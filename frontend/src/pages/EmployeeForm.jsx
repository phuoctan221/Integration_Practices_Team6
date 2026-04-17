import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";

export default function EmployeeForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  // ==============================
  // LOAD DATA
  // ==============================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [depRes, posRes] = await Promise.all([
          api.get("/api/departments"),
          api.get("/api/positions"),
        ]);

        setDepartments(depRes.data);
        setPositions(posRes.data);

        if (isEdit) {
          const empRes = await api.get(`/api/employees/${id}`);
          const data = empRes.data;

          setForm({
            FullName: data.FullName || "",
            DateOfBirth: data.DateOfBirth?.substring(0, 10) || "",
            Gender: data.Gender || "",
            PhoneNumber: data.PhoneNumber || "",
            Email: data.Email || "",
            HireDate: data.HireDate?.substring(0, 10) || "",
            DepartmentID: data.DepartmentID || "",
            PositionID: data.PositionID || "",
            Status: data.Status || "Active",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const url = isEdit
        ? `/api/employees/${id}`
        : "/api/employees";

      const method = isEdit ? "put" : "post";

      const res = await api({
        method,
        url,
        data: form,
      });

      alert(res.data.msg || "Success");
      nav("/employee");
    } catch (err) {
      alert(
        err?.response?.data?.msg ||
          "Error occurred while saving."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-4">Loading...</div>;

  if (error)
    return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container">
      <h3>
        {isEdit ? "Edit Employee" : "Add New Employee"}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="card p-4 mt-3"
      >
        <input
          id="FullName"
          className="form-control mb-2"
          placeholder="Full Name"
          value={form.FullName}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          id="DateOfBirth"
          className="form-control mb-2"
          value={form.DateOfBirth}
          onChange={handleChange}
          required
        />

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

        <input
          id="PhoneNumber"
          className="form-control mb-2"
          placeholder="Phone Number"
          value={form.PhoneNumber}
          onChange={handleChange}
          required
        />

        <input
          id="Email"
          className="form-control mb-2"
          placeholder="Email"
          value={form.Email}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          id="HireDate"
          className="form-control mb-2"
          value={form.HireDate}
          onChange={handleChange}
          required
        />

        <select
          id="DepartmentID"
          className="form-control mb-2"
          value={form.DepartmentID}
          onChange={handleChange}
        >
          <option value="">-- Select Department --</option>
          {departments.map((d) => (
            <option
              key={d.DepartmentID}
              value={d.DepartmentID}
            >
              {d.DepartmentName}
            </option>
          ))}
        </select>

        <select
          id="PositionID"
          className="form-control mb-2"
          value={form.PositionID}
          onChange={handleChange}
        >
          <option value="">-- Select Position --</option>
          {positions.map((p) => (
            <option
              key={p.PositionID}
              value={p.PositionID}
            >
              {p.PositionName}
            </option>
          ))}
        </select>

        <select
          id="Status"
          className="form-control mb-2"
          value={form.Status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          className="btn btn-primary mt-3"
          disabled={loading}
        >
          {isEdit
            ? "Update Employee"
            : "Add Employee"}
        </button>
      </form>
    </div>
  );
}