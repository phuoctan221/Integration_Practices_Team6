// Import React hooks
import { useEffect, useState } from "react";

// Import navigation
import { useNavigate } from "react-router-dom";

// Component thêm nhân viên
export default function EmployeeAdd() {

  const nav = useNavigate();

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
    Status: "Active",
  });

  // STATE dropdown
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Khi người dùng nhập form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  // Load dữ liệu dropdown
  const loadDropdowns = () => {

    fetch("http://localhost:5000/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(data));

    fetch("http://localhost:5000/api/positions")
      .then((r) => r.json())
      .then((data) => setPositions(data));
  };

  // Submit form
  const handleSubmit = (e) => {

    e.preventDefault();

    fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((res) => {

        alert(res.msg);

        if (res.status === "success") {
          nav("/");
        }
      });
  };

  // Load dropdown khi mở trang
  useEffect(() => {
    loadDropdowns();
  }, []);

  return (
    <div>

      <h3>Add New Employee</h3>

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
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button className="btn btn-primary mt-2">
          Add Employee
        </button>

      </form>

    </div>
  );
}