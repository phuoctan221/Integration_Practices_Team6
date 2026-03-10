// Import React hooks
import { useEffect, useState } from "react";

// Import router hooks
import { useNavigate, useParams } from "react-router-dom";

// Component chỉnh sửa nhân viên
export default function EmployeeEdit() {

  const nav = useNavigate();
  const { id } = useParams();

  // STATE form
  const [form, setForm] = useState({
    FullName: "",
    DateOfBirth: "",
    Gender: "",
    PhoneNumber: "",
    Email: "",
    HireDate: "",
    DepartmentID: "",
    PositionID: "",
    Status: "",
  });

  // STATE dropdown
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Khi người dùng thay đổi input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  // Chuyển định dạng ngày
  const convertDate = (dt) => {
    if (!dt) return "";

    return new Date(dt)
      .toISOString()
      .substring(0, 10);
  };

  // Load dropdown
  const loadDropdowns = () => {

    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(() => alert("Không load được danh sách phòng ban"));

    fetch("http://localhost:5000/api/positions")
      .then((res) => res.json())
      .then((data) => setPositions(data))
      .catch(() => alert("Không load được danh sách chức vụ"));
  };

  // Load thông tin nhân viên
  const loadEmployee = () => {

    fetch(`http://localhost:5000/api/employees/${id}`)
      .then((res) => res.json())
      .then((data) => {

        setForm({
          FullName: data.FullName || "",
          DateOfBirth: convertDate(data.DateOfBirth),
          Gender: data.Gender || "",
          PhoneNumber: data.PhoneNumber || "",
          Email: data.Email || "",
          HireDate: convertDate(data.HireDate),
          DepartmentID: data.DepartmentID || "",
          PositionID: data.PositionID || "",
          Status: data.Status || "Active",
        });

      })
      .catch(() => alert("Không tải được dữ liệu nhân viên!"));
  };

  // Submit update
  const handleSubmit = (e) => {

    e.preventDefault();

    fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((rs) => {

        alert(rs.msg);

        if (rs.status === "success") {
          nav("/");
        }

      })
      .catch(() => alert("Không thể cập nhật nhân viên"));
  };

  // Load dữ liệu khi mở trang
  useEffect(() => {
    loadDropdowns();
    loadEmployee();
  }, []);

  return (
    <div>

      <h3>Edit Employee</h3>

      <form onSubmit={handleSubmit} className="card p-4 mt-3">

        {/* Full Name */}
        <label>Full Name</label>
        <input
          id="FullName"
          className="form-control mb-2"
          value={form.FullName}
          onChange={handleChange}
          required
        />

        {/* Date of Birth */}
        <label>Date of Birth</label>
        <input
          type="date"
          id="DateOfBirth"
          className="form-control mb-2"
          value={form.DateOfBirth}
          onChange={handleChange}
          required
        />

        {/* Gender */}
        <label>Gender</label>
        <select
          id="Gender"
          className="form-control mb-2"
          value={form.Gender}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Gender --</option>
          <option>Nam</option>
          <option>Nữ</option>
          <option>Khác</option>
        </select>

        {/* Phone */}
        <label>Phone Number</label>
        <input
          id="PhoneNumber"
          className="form-control mb-2"
          value={form.PhoneNumber}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <label>Email</label>
        <input
          id="Email"
          type="email"
          className="form-control mb-2"
          value={form.Email}
          onChange={handleChange}
          required
        />

        {/* Hire Date */}
        <label>Hire Date</label>
        <input
          type="date"
          id="HireDate"
          className="form-control mb-2"
          value={form.HireDate}
          onChange={handleChange}
          required
        />

        {/* Department */}
        <label>Department</label>
        <select
          id="DepartmentID"
          className="form-control mb-2"
          value={form.DepartmentID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Department --</option>

          {departments.map((d) => (
            <option key={d.DepartmentID} value={d.DepartmentID}>
              {d.DepartmentName}
            </option>
          ))}
        </select>

        {/* Position */}
        <label>Position</label>
        <select
          id="PositionID"
          className="form-control mb-2"
          value={form.PositionID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Position --</option>

          {positions.map((p) => (
            <option key={p.PositionID} value={p.PositionID}>
              {p.PositionName}
            </option>
          ))}
        </select>

        {/* Status */}
        <label>Status</label>
        <select
          id="Status"
          className="form-control mb-2"
          value={form.Status}
          onChange={handleChange}
          required
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Đang làm việc">Đang làm việc</option>
        </select>

        <button className="btn btn-primary mt-2">
          Save Changes
        </button>

      </form>

    </div>
  );
}