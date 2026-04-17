from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection

dashboard_bp = Blueprint("dashboard_bp", __name__)

# ============================================================
# API: DASHBOARD OVERVIEW
# ============================================================
@dashboard_bp.route("/api/dashboard/overview")
@jwt_required()
def dashboard_overview():

    sql = None
    my = None
    cur = None
    my_cur = None

    try:
        # ================= CONNECT DATABASE =================
        sql = get_sqlserver_connection()
        my = get_mysql_connection()

        cur = sql.cursor()
        my_cur = my.cursor(dictionary=True)

        # ================= TOTAL EMPLOYEES =================
        cur.execute("SELECT COUNT(*) FROM Employees")
        total_employees = cur.fetchone()[0] or 0

        cur.execute("SELECT COUNT(*) FROM Employees WHERE Status='Active'")
        active_employees = cur.fetchone()[0] or 0

        # ================= EMPLOYEES BY DEPARTMENT =================
        cur.execute("""
            SELECT ISNULL(d.DepartmentName, 'N/A'), COUNT(*)
            FROM Employees e
            LEFT JOIN Departments d
                ON e.DepartmentID = d.DepartmentID
            GROUP BY d.DepartmentName
        """)
        dept_data = [
            {"Department": r[0], "Total": r[1]}
            for r in cur.fetchall()
        ]

        # ================= GET LATEST MONTH =================
        my_cur.execute("""
            SELECT DATE_FORMAT(SalaryMonth, '%Y-%m') as latest_month
            FROM salaries
            ORDER BY SalaryMonth DESC
            LIMIT 1
        """)

        row_latest = my_cur.fetchone()

        salary_this_month = 0.0
        salary_last_month = 0.0
        latest_month = None

        if row_latest and row_latest["latest_month"]:
            latest_month = row_latest["latest_month"]

            # Total tháng mới nhất
            my_cur.execute("""
                SELECT SUM(NetSalary) as total
                FROM salaries
                WHERE DATE_FORMAT(SalaryMonth, '%Y-%m') = %s
            """, (latest_month,))
            row_now = my_cur.fetchone()
            salary_this_month = float(row_now["total"]) if row_now and row_now["total"] else 0.0

            # Total tháng trước
            my_cur.execute("""
                SELECT SUM(NetSalary) as total
                FROM salaries
                WHERE DATE_FORMAT(SalaryMonth, '%Y-%m') = DATE_FORMAT(
                    DATE_SUB(STR_TO_DATE(%s, '%%Y-%%m'), INTERVAL 1 MONTH),
                    '%%Y-%%m'
                )
            """, (latest_month,))
            row_prev = my_cur.fetchone()
            salary_last_month = float(row_prev["total"]) if row_prev and row_prev["total"] else 0.0

        # ================= CALCULATE GROWTH =================
        growth = 0.0
        if salary_last_month > 0:
            growth = ((salary_this_month - salary_last_month) / salary_last_month) * 100

        # ================= SALARY CHART =================
        my_cur.execute("""
            SELECT DATE_FORMAT(SalaryMonth, '%Y-%m') as Month,
                   SUM(NetSalary) as Total
            FROM salaries
            GROUP BY Month
            ORDER BY Month DESC
            LIMIT 6
        """)

        salary_chart = [
            {
                "Month": r["Month"],
                "Total": float(r["Total"]) if r["Total"] else 0.0
            }
            for r in my_cur.fetchall()
        ]

        salary_chart.reverse()

        # ================= RETURN =================
        return jsonify({
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "salaryThisMonth": salary_this_month,
            "growthPercent": round(growth, 2),
            "employeesByDepartment": dept_data,
            "salaryChart": salary_chart
        })

    except Exception as e:
        print("🔥 Dashboard Error:", str(e))
        return jsonify({
            "status": "error",
            "msg": "Internal Server Error"
        }), 500

    finally:
        if cur:
            cur.close()
        if sql:
            sql.close()
        if my_cur:
            my_cur.close()
        if my:
            my.close()