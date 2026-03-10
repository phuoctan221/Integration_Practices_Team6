# ============================================================
# 1. IMPORT THƯ VIỆN
# ============================================================

from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection, get_mysql_connection

# ============================================================
# 2. TẠO BLUEPRINT
# ============================================================

router = Blueprint("router", __name__)

# ============================================================
# API: LẤY DANH SÁCH PHÒNG BAN
# ============================================================

@router.route("/api/departments")
def get_departments():

    sql = get_sqlserver_connection()
    cur = sql.cursor()

    cur.execute("""
        SELECT DepartmentID, DepartmentName
        FROM Departments
        ORDER BY DepartmentName
    """)

    rows = [
        {"DepartmentID": r[0], "DepartmentName": r[1]}
        for r in cur.fetchall()
    ]

    return jsonify(rows)


# ============================================================
# API: LẤY DANH SÁCH CHỨC VỤ
# ============================================================

@router.route("/api/positions")
def get_positions():

    sql = get_sqlserver_connection()
    cur = sql.cursor()

    cur.execute("""
        SELECT PositionID, PositionName
        FROM Positions
        ORDER BY PositionName
    """)

    rows = [
        {"PositionID": r[0], "PositionName": r[1]}
        for r in cur.fetchall()
    ]

    return jsonify(rows)


# ============================================================
# API: LẤY DANH SÁCH NHÂN VIÊN
# ============================================================

@router.route("/api/employees")
def get_employees():

    sql = get_sqlserver_connection()
    cur = sql.cursor()

    cur.execute("""
        SELECT 
            e.EmployeeID,
            e.FullName,
            d.DepartmentName,
            p.PositionName
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
            "Department": r[2],
            "Position": r[3]
        })

    return jsonify(rows)


# ============================================================
# API: LẤY CHI TIẾT NHÂN VIÊN
# ============================================================

@router.route("/api/employees/<int:emp_id>")
def get_employee_detail(emp_id):

    sql = get_sqlserver_connection()
    cur = sql.cursor()

    cur.execute("""
        SELECT
            e.EmployeeID,
            e.FullName,
            e.Email,
            e.DateOfBirth,
            e.Gender,
            e.PhoneNumber,
            e.HireDate,
            e.Status,
            d.DepartmentID,
            d.DepartmentName,
            p.PositionID,
            p.PositionName
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE EmployeeID = ?
    """, emp_id)

    r = cur.fetchone()

    if not r:
        return jsonify({"msg": "Employee not found"}), 404

    return jsonify({
        "EmployeeID": r[0],
        "FullName": r[1],
        "Email": r[2],
        "DateOfBirth": r[3],
        "Gender": r[4],
        "PhoneNumber": r[5],
        "HireDate": r[6],
        "Status": r[7],
        "DepartmentID": r[8],
        "DepartmentName": r[9],
        "PositionID": r[10],
        "PositionName": r[11]
    })


# ============================================================
# API: THÊM NHÂN VIÊN
# ============================================================

@router.route("/api/employees", methods=["POST"])
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
    cur = sql.cursor()

    # Check email trùng
    cur.execute("SELECT COUNT(*) FROM Employees WHERE Email = ?", email)

    if cur.fetchone()[0] > 0:
        return jsonify({
            "status": "error",
            "msg": "Email đã tồn tại"
        }), 400

    my = get_mysql_connection()

    sql.autocommit = False
    my.start_transaction()

    try:

        cur.execute("""
            INSERT INTO Employees
            (FullName, DateOfBirth, Gender, PhoneNumber, Email, HireDate, DepartmentID, PositionID, Status)
            OUTPUT INSERTED.EmployeeID
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            full_name, dob, gender, phone,
            email, hire_date, dept_id, pos_id, status
        ))

        row = cur.fetchone()
        new_id = int(row[0])

        my_cur = my.cursor(dictionary=True)

        my_cur.execute("""
            INSERT INTO employees_payroll
            (EmployeeID, FullName, DepartmentID, PositionID, Status)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            new_id, full_name, dept_id, pos_id, status
        ))

        sql.commit()
        my.commit()

    except Exception as e:

        sql.rollback()
        my.rollback()

        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500

    return jsonify({
        "status": "success",
        "msg": f"Thêm nhân viên thành công (ID = {new_id})"
    })


# ============================================================
# API: UPDATE NHÂN VIÊN
# ============================================================

@router.route("/api/employees/<int:emp_id>", methods=["PUT"])
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
                FullName=?,
                DateOfBirth=?,
                Gender=?,
                PhoneNumber=?,
                Email=?,
                HireDate=?,
                DepartmentID=?,
                PositionID=?,
                Status=?
            WHERE EmployeeID=?
        """, (
            full_name, dob, gender, phone,
            email, hire_date, dept_id, pos_id,
            status, emp_id
        ))

        my_cur = my.cursor(dictionary=True)

        my_cur.execute("""
            UPDATE employees_payroll SET
                FullName=%s,
                DepartmentID=%s,
                PositionID=%s,
                Status=%s
            WHERE EmployeeID=%s
        """, (
            full_name, dept_id, pos_id, status, emp_id
        ))

        sql.commit()
        my.commit()

    except Exception as e:

        sql.rollback()
        my.rollback()

        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500

    return jsonify({
        "status": "success",
        "msg": "Update thành công"
    })


# ============================================================
# API: XOÁ NHÂN VIÊN
# ============================================================

@router.route("/api/employees/<int:emp_id>", methods=["DELETE"])
def delete_employee(emp_id):

    sql = get_sqlserver_connection()
    my = get_mysql_connection()

    sql.autocommit = False
    my.start_transaction()

    try:

        cur = sql.cursor()

        # Check Dividends
        cur.execute(
            "SELECT COUNT(*) FROM Dividends WHERE EmployeeID=?",
            emp_id
        )

        if cur.fetchone()[0] > 0:
            return jsonify({
                "status": "error",
                "msg": "Không thể xoá – nhân viên có Dividends"
            }), 400

        cur.execute(
            "DELETE FROM Employees WHERE EmployeeID=?",
            emp_id
        )

        my_cur = my.cursor(dictionary=True)

        my_cur.execute(
            "DELETE FROM employees_payroll WHERE EmployeeID=%s",
            (emp_id,)
        )

        my_cur.execute(
            "DELETE FROM attendance WHERE EmployeeID=%s",
            (emp_id,)
        )

        my_cur.execute(
            "DELETE FROM salaries WHERE EmployeeID=%s",
            (emp_id,)
        )

        sql.commit()
        my.commit()

    except Exception as e:

        sql.rollback()
        my.rollback()

        return jsonify({
            "status": "error",
            "msg": str(e)
        }), 500

    return jsonify({
        "status": "success",
        "msg": "Xoá thành công"
    })