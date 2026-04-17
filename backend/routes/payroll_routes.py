from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection

payroll_bp = Blueprint("payroll_bp", __name__)

# ============================================================
# API: LẤY DANH SÁCH LƯƠNG (PAYROLL)
# ============================================================
@payroll_bp.route("/api/payroll")
@jwt_required()
def get_payroll():

    sql = None
    my = None
    my_cur = None
    sql_cur = None

    try:
        sql = get_sqlserver_connection()
        my = get_mysql_connection()

        my_cur = my.cursor(dictionary=True)
        sql_cur = sql.cursor()

        # Lấy tất cả lương từ MySQL
        my_cur.execute("""
            SELECT 
                SalaryMonth,
                EmployeeID,
                BaseSalary,
                Bonus,
                Deductions,
                NetSalary
            FROM salaries
            ORDER BY SalaryMonth DESC
        """)

        salary_rows = my_cur.fetchall()
        results = []

        for s in salary_rows:
            # Lấy thông tin nhân viên từ SQL Server
            sql_cur.execute("""
                SELECT e.FullName, ISNULL(d.DepartmentName, 'N/A')
                FROM Employees e
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                WHERE e.EmployeeID = ?
            """, (s["EmployeeID"],))

            emp = sql_cur.fetchone()

            results.append({
                "SalaryMonth": str(s["SalaryMonth"]),
                "EmployeeID": s["EmployeeID"],
                "FullName": emp[0] if emp else "Nhân viên đã xoá",
                "Department": emp[1] if emp else "N/A",
                "BaseSalary": float(s["BaseSalary"] or 0),
                "Bonus": float(s["Bonus"] or 0),
                "Deductions": float(s["Deductions"] or 0),
                "NetSalary": float(s["NetSalary"] or 0)
            })

        return jsonify(results), 200

    except Exception as e:
        print("Payroll Error:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        if my_cur:
            my_cur.close()
        if sql_cur:
            sql_cur.close()
        if my:
            my.close()
        if sql:
            sql.close()