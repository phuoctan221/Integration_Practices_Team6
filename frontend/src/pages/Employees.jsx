// Import các hook của React
// useState: lưu dữ liệu trong component
// useEffect: chạy khi component render (ví dụ gọi API)
import { useEffect, useState } from "react";

// Import Link để chuyển trang không reload
import { Link } from "react-router-dom";

// Component hiển thị danh sách nhân viên
export default function Employees() {

  // State lưu danh sách nhân viên
  const [employees, setEmployees] = useState([]);

  // Hàm gọi API lấy danh sách nhân viên
  const loadEmployees = () => {

    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
      })
      .catch((err) => console.error("Lỗi tải danh sách:", err));
  };

  // Chạy 1 lần khi component load
  useEffect(() => {
    loadEmployees();
  }, []);

  // Hàm xóa nhân viên
  const deleteEmployee = (id) => {

    if (!window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) return;

    fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((rs) => {

        alert(rs.msg);

        if (rs.status === "success") {
          loadEmployees();
        }
      });
  };

  // Giao diện JSX
  return (
    <div>

      {/* Tiêu đề */}
      <h3>Employee List</h3>

      {/* Nút thêm nhân viên */}
      <Link to="/employees/add" className="btn btn-success mb-3">
        + Add Employee
      </Link>

      {/* Bảng danh sách nhân viên */}
      <table className="table table-bordered">

        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Position</th>
            <th style={{ width: "150px" }}>Action</th>
          </tr>
        </thead>

        <tbody>

          {/* Lặp danh sách nhân viên */}
          {employees.map((emp) => (
            <tr key={emp.EmployeeID}>

              <td>{emp.EmployeeID}</td>
              <td>{emp.FullName}</td>
              <td>{emp.Department}</td>
              <td>{emp.Position}</td>

              <td>

                {/* Nút Edit */}
                <Link
                  className="btn btn-primary btn-sm me-2"
                  to={`/employees/${emp.EmployeeID}`}
                >
                  Edit
                </Link>

                {/* Nút Delete */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteEmployee(emp.EmployeeID)}
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}

          {/* Nếu không có dữ liệu */}
          {employees.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No data available.
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}