from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from config import get_sqlserver_connection

auth_bp = Blueprint("auth_bp", __name__)

# ============================================================
# LOGIN
# ============================================================
@auth_bp.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    sql = None
    cur = None

    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()

        cur.execute("""
            SELECT UserID, PasswordHash, Role, IsActive
            FROM Users
            WHERE Username = ?
        """, (username,))

        user = cur.fetchone()

        if not user:
            return jsonify({"msg": "Invalid username or password"}), 401

        user_id = user[0]
        password_hash = user[1]
        role = user[2]
        is_active = user[3]

        if not is_active:
            return jsonify({"msg": "Account is disabled"}), 403

        if not check_password_hash(password_hash, password):
            return jsonify({"msg": "Invalid username or password"}), 401

        access_token = create_access_token(
            identity=str(user_id),
            additional_claims={"role": role}
        )

        return jsonify({
            "status": "success",
            "token": access_token,
            "user": {
                "userId": user_id,
                "username": username,
                "role": role
            }
        }), 200

    except Exception as e:
        return jsonify({"msg": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if sql:
            sql.close()


# ============================================================
# REGISTER
# ============================================================
@auth_bp.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "User")

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    sql = None
    cur = None

    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()

        # ✅ Kiểm tra username tồn tại
        cur.execute("SELECT UserID FROM Users WHERE Username = ?", (username,))
        if cur.fetchone():
            return jsonify({"msg": "Username already exists"}), 400

        hashed_pw = generate_password_hash(password)

        cur.execute("""
            INSERT INTO Users (Username, PasswordHash, Role, IsActive)
            VALUES (?, ?, ?, 1)
        """, (username, hashed_pw, role))

        sql.commit()

        return jsonify({"msg": "User created successfully"}), 201

    except Exception as e:
        if sql:
            sql.rollback()
        return jsonify({"msg": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if sql:
            sql.close()


# ============================================================
# PROFILE
# ============================================================
@auth_bp.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():

    user_id = int(get_jwt_identity())

    sql = None
    cur = None

    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()

        cur.execute("""
            SELECT Username, Role, IsActive
            FROM Users
            WHERE UserID = ?
        """, (user_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({"msg": "User not found"}), 404

        return jsonify({
            "Username": row[0],
            "Role": row[1],
            "IsActive": row[2]
        }), 200

    except Exception as e:
        return jsonify({"msg": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if sql:
            sql.close()


# ============================================================
# CHANGE PASSWORD
# ============================================================
@auth_bp.route("/api/change-password", methods=["POST"])
@jwt_required()
def change_password():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({"msg": "Missing JSON body"}), 400

    new_password = data.get("newPassword")

    if not new_password or len(new_password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters"}), 400

    sql = None
    cur = None

    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()

        hashed_pw = generate_password_hash(new_password)

        cur.execute("""
            UPDATE Users
            SET PasswordHash = ?
            WHERE UserID = ?
        """, (hashed_pw, user_id))

        sql.commit()

        return jsonify({"msg": "Password updated successfully"}), 200

    except Exception as e:
        if sql:
            sql.rollback()
        return jsonify({"msg": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if sql:
            sql.close()