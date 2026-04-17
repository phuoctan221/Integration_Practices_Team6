from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import get_sqlserver_connection, get_mysql_connection
from datetime import datetime

report_bp = Blueprint("report_bp", __name__)

# ============================================================
# API: REPORTS SUMMARY
# ============================================================
@report_bp.route("/api/reports")
@jwt_required()
def get_reports():

    sql = None
    my = None
    sql_cur = None
    my_cur = None

    try:
        sql = get_sqlserver_connection()
        my = get_mysql_connection()

        sql_cur = sql.cursor()
        my_cur = my.cursor(dictionary=True)

        # ================= EMPLOYEE REPORT =================
        sql_cur.execute("SELECT COUNT(*) FROM Employees")
        total_employees = sql_cur.fetchone()[0]

        sql_cur.execute("""
            SELECT Status, COUNT(*)
            FROM Employees
            GROUP BY Status
        """)
        status_report = [{"Status": r[0], "Total": r[1]} for r in sql_cur.fetchall()]

        sql_cur.execute("""
            SELECT ISNULL(d.DepartmentName, 'Chưa có phòng ban'), COUNT(*)
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            GROUP BY d.DepartmentName
        """)
        department_report = [{"Department": r[0], "Total": r[1]} for r in sql_cur.fetchall()]

        # ================= PAYROLL REPORT =================
        my_cur.execute("SELECT SUM(NetSalary) as total FROM salaries")
        total_salary = float(my_cur.fetchone()["total"] or 0)

        my_cur.execute("SELECT AVG(NetSalary) as avg FROM salaries")
        avg_salary = float(my_cur.fetchone()["avg"] or 0)

        # ================= ATTENDANCE REPORT =================
        my_cur.execute("""
            SELECT 
                COALESCE(SUM(AbsentDays), 0) as total_absent,
                COALESCE(SUM(WorkDays + LeaveDays + AbsentDays), 0) as total_days
            FROM attendance
        """)
        row = my_cur.fetchone()

        absence_rate = 0.0
        if row["total_days"] and row["total_days"] > 0:
            absence_rate = (row["total_absent"] / row["total_days"]) * 100

        my_cur.execute("""
            SELECT EmployeeID, COALESCE(SUM(AbsentDays), 0) as total_absent
            FROM attendance
            GROUP BY EmployeeID
            ORDER BY total_absent DESC
            LIMIT 5
        """)
        top_absent = [
            {"EmployeeID": r["EmployeeID"], "total_absent": int(r["total_absent"])}
            for r in my_cur.fetchall()
        ]

        return jsonify({
            "totalEmployees": total_employees,
            "statusReport": status_report,
            "departmentReport": department_report,
            "totalSalary": total_salary,
            "avgSalary": round(avg_salary, 2),
            "absenceRate": round(absence_rate, 2),
            "topAbsent": top_absent
        }), 200

    except Exception as e:
        print("Reports Error:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        if sql_cur: sql_cur.close()
        if my_cur: my_cur.close()
        if sql: sql.close()
        if my: my.close()


# ============================================================
# API: ALERTS (CÓ TÊN NHÂN VIÊN)
# ============================================================
@report_bp.route("/api/alerts")
@jwt_required()
def get_alerts():

    sql = None
    my = None
    sql_cur = None
    my_cur = None
    alerts = []

    try:
        sql = get_sqlserver_connection()
        my = get_mysql_connection()

        sql_cur = sql.cursor()
        my_cur = my.cursor(dictionary=True)

        # Hàm lấy tên nhân viên
        def get_employee_name(emp_id):
            sql_cur.execute("SELECT FullName FROM Employees WHERE EmployeeID = ?", (emp_id,))
            row = sql_cur.fetchone()
            return row[0] if row else "Nhân viên đã xoá"

        today = datetime.now()

        # ================= BIRTHDAY ALERT =================
        sql_cur.execute("SELECT EmployeeID, FullName, DateOfBirth FROM Employees WHERE DateOfBirth IS NOT NULL")
        for r in sql_cur.fetchall():
            if r[2] and r[2].month == today.month and r[2].day == today.day:
                alerts.append({
                    "EmployeeID": r[0],
                    "FullName": r[1],
                    "Type": "Birthday",
                    "Message": f"Hôm nay là sinh nhật của {r[1]} 🎂",
                    "Severity": "Info"
                })

        # ================= WORK ANNIVERSARY =================
        sql_cur.execute("SELECT EmployeeID, FullName, HireDate FROM Employees WHERE HireDate IS NOT NULL")
        for r in sql_cur.fetchall():
            if r[2] and r[2].month == today.month and r[2].day == today.day:
                years = today.year - r[2].year
                alerts.append({
                    "EmployeeID": r[0],
                    "FullName": r[1],
                    "Type": "Anniversary",
                    "Message": f"Kỷ niệm {years} năm làm việc của {r[1]} 🎉",
                    "Severity": "Info"
                })

        # ================= ABSENT ALERT =================
        my_cur.execute("""
            SELECT EmployeeID, COALESCE(SUM(AbsentDays), 0) as total_absent
            FROM attendance
            GROUP BY EmployeeID
            HAVING COALESCE(SUM(AbsentDays), 0) >= 3
        """)
        for r in my_cur.fetchall():
            name = get_employee_name(r["EmployeeID"])
            severity = "Critical" if r["total_absent"] >= 5 else "Warning"
            alerts.append({
                "EmployeeID": r["EmployeeID"],
                "FullName": name,
                "Type": "Absence",
                "Message": f"Nghỉ không phép {r['total_absent']} ngày",
                "Severity": severity
            })

        # ================= SALARY ANOMALY =================
        my_cur.execute("SELECT EmployeeID, NetSalary FROM salaries WHERE NetSalary > 15000000")
        for r in my_cur.fetchall():
            name = get_employee_name(r["EmployeeID"])
            alerts.append({
                "EmployeeID": r["EmployeeID"],
                "FullName": name,
                "Type": "Salary",
                "Message": f"Lương cao bất thường: {int(r['NetSalary']):,} đ",
                "Severity": "Critical"
            })

        return jsonify(alerts), 200

    except Exception as e:
        print("Alerts Error:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

    finally:
        if sql_cur: sql_cur.close()
        if my_cur: my_cur.close()
        if sql: sql.close()
        if my: my.close()