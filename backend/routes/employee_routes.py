from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection

employee_bp = Blueprint("employee_bp", __name__)

# ============================================================
# LẤY DANH SÁCH PHÒNG BAN
# ============================================================
@employee_bp.route("/api/departments")
@jwt_required()
def get_departments():
    sql = get_sqlserver_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            SELECT DepartmentID, DepartmentName
            FROM Departments
            ORDER BY DepartmentName
        """)
        rows = [{"DepartmentID": r[0], "DepartmentName": r[1]} for r in cur.fetchall()]
        return jsonify(rows)
    finally:
        cur.close()
        sql.close()


# ============================================================
# LẤY DANH SÁCH CHỨC VỤ
# ============================================================
@employee_bp.route("/api/positions")
@jwt_required()
def get_positions():
    sql = get_sqlserver_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            SELECT PositionID, PositionName
            FROM Positions
            ORDER BY PositionName
        """)
        rows = [{"PositionID": r[0], "PositionName": r[1]} for r in cur.fetchall()]
        return jsonify(rows)
    finally:
        cur.close()
        sql.close()


# ============================================================
# LẤY DANH SÁCH NHÂN VIÊN
# ============================================================
@employee_bp.route("/api/employees")
@jwt_required()
def get_employees():
    sql = get_sqlserver_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            SELECT 
                e.EmployeeID,
                e.FullName,
                d.DepartmentName,
                p.PositionName,
                e.Status
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            ORDER BY e.EmployeeID
        """)

        rows = []
        for r in cur.fetchall():
            rows.append({
                "EmployeeID": r[0],
                "FullName": r[1],
                "Department": r[2] or "",
                "Position": r[3] or "",
                "Status": r[4].strip() if r[4] else ""
            })
        return jsonify(rows)
    finally:
        cur.close()
        sql.close()


# ============================================================
# CHI TIẾT NHÂN VIÊN
# ============================================================
@employee_bp.route("/api/employees/<int:emp_id>")
@jwt_required()
def get_employee_detail(emp_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()

    try:
        cur.execute("""
            SELECT
                e.EmployeeID, e.FullName, e.Email, e.DateOfBirth, e.Gender,
                e.PhoneNumber, e.HireDate, e.Status,
                d.DepartmentID, d.DepartmentName,
                p.PositionID, p.PositionName
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            WHERE e.EmployeeID = ?
        """, (emp_id,))

        r = cur.fetchone()
        if not r:
            return jsonify({"msg": "Employee not found"}), 404

        return jsonify({
            "EmployeeID": r[0],
            "FullName": r[1],
            "Email": r[2],
            "DateOfBirth": str(r[3]) if r[3] else None,
            "Gender": r[4],
            "PhoneNumber": r[5],
            "HireDate": str(r[6]) if r[6] else None,
            "Status": r[7],
            "DepartmentID": r[8],
            "DepartmentName": r[9],
            "PositionID": r[10],
            "PositionName": r[11]
        })
    finally:
        cur.close()
        sql.close()


# ============================================================
# THÊM NHÂN VIÊN
# ============================================================
@employee_bp.route("/api/employees", methods=["POST"])
@jwt_required()
def add_employee():
    data = request.get_json()

    full_name = data.get("FullName")
    dob = data.get("DateOfBirth")
    gender = data.get("Gender")
    phone = data.get("PhoneNumber")
    email = data.get("Email")
    hire_date = data.get("HireDate")
    dept_id = data.get("DepartmentID") or None
    pos_id = data.get("PositionID") or None
    status = data.get("Status") or "Active"

    sql = get_sqlserver_connection()
    my = get_mysql_connection()
    sql.autocommit = False
    my.start_transaction()

    try:
        cur = sql.cursor()
        cur.execute("SELECT COUNT(*) FROM Employees WHERE Email = ?", (email,))
        if cur.fetchone()[0] > 0:
            return jsonify({"status": "error", "msg": "Email đã tồn tại"}), 400

        cur.execute("""
            INSERT INTO Employees
            (FullName, DateOfBirth, Gender, PhoneNumber, Email, HireDate, DepartmentID, PositionID, Status)
            OUTPUT INSERTED.EmployeeID
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (full_name, dob, gender, phone, email, hire_date, dept_id, pos_id, status))

        new_id = int(cur.fetchone()[0])

        my_cur = my.cursor(dictionary=True)
        my_cur.execute("""
            INSERT INTO employees_payroll
            (EmployeeID, FullName, DepartmentID, PositionID, Status)
            VALUES (%s, %s, %s, %s, %s)
        """, (new_id, full_name, dept_id, pos_id, status))

        sql.commit()
        my.commit()

        return jsonify({
            "status": "success",
            "msg": f"Thêm nhân viên thành công (ID = {new_id})"
        }), 201

    except Exception as e:
        sql.rollback()
        my.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        sql.close()
        my.close()


# ============================================================
# CẬP NHẬT NHÂN VIÊN
# ============================================================
@employee_bp.route("/api/employees/<int:emp_id>", methods=["PUT"])
@jwt_required()
def update_employee(emp_id):
    data = request.get_json()

    full_name = data.get("FullName")
    dob = data.get("DateOfBirth")
    gender = data.get("Gender")
    phone = data.get("PhoneNumber")
    email = data.get("Email")
    hire_date = data.get("HireDate")
    dept_id = data.get("DepartmentID")
    pos_id = data.get("PositionID")
    status = data.get("Status")

    sql = get_sqlserver_connection()
    my = get_mysql_connection()
    sql.autocommit = False
    my.start_transaction()

    try:
        cur = sql.cursor()
        cur.execute("""
            UPDATE Employees SET
                FullName=?, DateOfBirth=?, Gender=?, PhoneNumber=?,
                Email=?, HireDate=?, DepartmentID=?, PositionID=?, Status=?
            WHERE EmployeeID=?
        """, (full_name, dob, gender, phone, email, hire_date, dept_id, pos_id, status, emp_id))

        my_cur = my.cursor(dictionary=True)
        my_cur.execute("""
            UPDATE employees_payroll SET
                FullName=%s, DepartmentID=%s, PositionID=%s, Status=%s
            WHERE EmployeeID=%s
        """, (full_name, dept_id, pos_id, status, emp_id))

        sql.commit()
        my.commit()

        return jsonify({"status": "success", "msg": "Update thành công"}), 200

    except Exception as e:
        sql.rollback()
        my.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        sql.close()
        my.close()


# ============================================================
# XOÁ NHÂN VIÊN (ĐÃ FIX ROLLBACK KHI CÓ DIVIDENDS)
# ============================================================
@employee_bp.route("/api/employees/<int:emp_id>", methods=["DELETE"])
@jwt_required()
def delete_employee(emp_id):
    sql = get_sqlserver_connection()
    my = get_mysql_connection()
    sql.autocommit = False
    my.start_transaction()

    try:
        cur = sql.cursor()

        # Kiểm tra có Dividends không
        cur.execute("SELECT COUNT(*) FROM Dividends WHERE EmployeeID=?", (emp_id,))
        if cur.fetchone()[0] > 0:
            sql.rollback()
            my.rollback()
            return jsonify({"status": "error", "msg": "Không thể xoá – nhân viên có Dividends"}), 400

        # Xoá ở SQL Server
        cur.execute("DELETE FROM Employees WHERE EmployeeID=?", (emp_id,))

        # Xoá ở MySQL
        my_cur = my.cursor(dictionary=True)
        my_cur.execute("DELETE FROM employees_payroll WHERE EmployeeID=%s", (emp_id,))
        my_cur.execute("DELETE FROM attendance WHERE EmployeeID=%s", (emp_id,))
        my_cur.execute("DELETE FROM salaries WHERE EmployeeID=%s", (emp_id,))

        sql.commit()
        my.commit()

        return jsonify({"status": "success", "msg": "Xoá thành công"}), 200

    except Exception as e:
        sql.rollback()
        my.rollback()
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        sql.close()
        my.close()