from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection

payroll_bp = Blueprint("payroll_bp", __name__)

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

        # ========================
        # 1️⃣ LẤY TOÀN BỘ NHÂN VIÊN TRƯỚC
        # ========================
        sql_cur.execute("""
            SELECT e.EmployeeID, e.FullName, 
                   ISNULL(d.DepartmentName, 'N/A') as Department
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        """)

        employees = sql_cur.fetchall()

        # Tạo dictionary để lookup nhanh
        employee_map = {
            emp[0]: {
                "FullName": emp[1],
                "Department": emp[2]
            }
            for emp in employees
        }

        # ========================
        # 2️⃣ LẤY SALARY
        # ========================
        my_cur.execute("""
            SELECT 
                DATE_FORMAT(SalaryMonth, '%Y-%m') as SalaryMonth,
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
            emp = employee_map.get(s["EmployeeID"], None)

            results.append({
                "SalaryMonth": s["SalaryMonth"],
                "EmployeeID": s["EmployeeID"],
                "FullName": emp["FullName"] if emp else "Deleted Employee",
                "Department": emp["Department"] if emp else "N/A",
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