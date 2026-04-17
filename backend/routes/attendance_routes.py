from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection

attendance_bp = Blueprint("attendance_bp", __name__)

@attendance_bp.route("/api/attendance")
@jwt_required()
def get_attendance():

    sql = get_sqlserver_connection()
    my = get_mysql_connection()

    my_cur = None
    sql_cur = None

    try:
        my_cur = my.cursor(dictionary=True)
        sql_cur = sql.cursor()

        my_cur.execute("""
            SELECT 
                EmployeeID,
                AttendanceMonth,
                WorkDays,
                LeaveDays,
                AbsentDays
            FROM attendance
        """)

        rows = my_cur.fetchall()
        results = []

        for r in rows:
            sql_cur.execute("""
                SELECT FullName
                FROM Employees
                WHERE EmployeeID = ?
            """, (r["EmployeeID"],))

            emp = sql_cur.fetchone()

            results.append({
                "EmployeeID": r["EmployeeID"],
                "FullName": emp[0] if emp else "",
                "Month": str(r["AttendanceMonth"]),
                "WorkDays": int(r["WorkDays"]),
                "LeaveDays": int(r["LeaveDays"]),
                "AbsentDays": int(r["AbsentDays"])
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"msg": str(e)}), 500

    finally:
        if my_cur:
            my_cur.close()
        if sql_cur:
            sql_cur.close()
        my.close()
        sql.close()