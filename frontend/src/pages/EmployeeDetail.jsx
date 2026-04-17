import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/Employee.css";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    api.get(`/api/employees/${id}`)
      .then(res => setEmployee(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!employee) return <div className="p-4">Loading...</div>;

  return (
  <div className="employee-detail-wrapper">
    <div className="employee-detail-card">

      <div className="detail-header">
        <div className="detail-avatar">
          {employee.FullName?.charAt(0).toUpperCase()}
        </div>
        <h3>{employee.FullName}</h3>
        <span
          className={`detail-status ${
            employee.Status?.toLowerCase() === "active"
              ? "detail-active"
              : "detail-inactive"
          }`}
        >
          {employee.Status}
        </span>
      </div>

      <div className="detail-grid">

        <div className="detail-item">
          <label>Email</label>
          <p>{employee.Email}</p>
        </div>

        <div className="detail-item">
          <label>Department</label>
          <p>{employee.DepartmentName}</p>
        </div>

        <div className="detail-item">
          <label>Position</label>
          <p>{employee.PositionName}</p>
        </div>

        <div className="detail-item">
          <label>Date of Birth</label>
          <p>{employee.DateOfBirth?.substring(0, 10)}</p>
        </div>

        <div className="detail-item">
          <label>Phone Number</label>
          <p>{employee.PhoneNumber}</p>
        </div>

        <div className="detail-item">
          <label>Hire Date</label>
          <p>{employee.HireDate?.substring(0, 10)}</p>
        </div>

      </div>

    </div>
  </div>
);
}