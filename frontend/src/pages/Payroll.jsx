import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Skeleton from "react-loading-skeleton";
import "chart.js/auto";
import "react-loading-skeleton/dist/skeleton.css";

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/payroll", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        const sorted = res.data.sort((a, b) =>
          b.SalaryMonth.localeCompare(a.SalaryMonth)
        );
        setPayroll(sorted);
        setFiltered(sorted);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load payroll data");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...payroll];

    if (monthFilter) {
      result = result.filter(p => p.SalaryMonth === monthFilter);
    }

    if (employeeFilter) {
      result = result.filter(p =>
        p.FullName?.toLowerCase().includes(employeeFilter.toLowerCase())
      );
    }

    if (departmentFilter) {
      result = result.filter(p => p.Department === departmentFilter);
    }

    setFiltered(result);
  }, [monthFilter, employeeFilter, departmentFilter, payroll]);

  const totalPayroll = useMemo(() => {
    return filtered.reduce((sum, p) => sum + (p.NetSalary || 0), 0);
  }, [filtered]);

  const chartData = useMemo(() => {
    const grouped = {};

    filtered.forEach(p => {
      const name = p.FullName || "Unknown";
      grouped[name] = (grouped[name] || 0) + (p.NetSalary || 0);
    });

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: "Total Net Salary (đ)",
          data: Object.values(grouped),
          borderColor: "#6f42c1",
          backgroundColor: "rgba(111,66,193,0.2)",
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [filtered]);

  const departments = [...new Set(payroll.map(p => p.Department))];
  const months = [...new Set(payroll.map(p => p.SalaryMonth))];

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="p-4">
        <Skeleton height={50} count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4 fw-bold">Payroll Management</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">-- Filter by Month --</option>
            {months.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Filter by Employee"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">-- Filter by Department --</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card shadow-sm p-4 mb-4 border-0 bg-light">
        <h6 className="text-muted">Total Payroll</h6>
        <h2 className="fw-bold text-success">
          {totalPayroll.toLocaleString("vi-VN")} đ
        </h2>
      </div>

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body table-responsive p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Month</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td>{p.SalaryMonth}</td>
                  <td>{p.FullName}</td>
                  <td>{p.Department}</td>
                  <td>{(p.BaseSalary || 0).toLocaleString("vi-VN")} đ</td>
                  <td>{(p.Bonus || 0).toLocaleString("vi-VN")} đ</td>
                  <td>{(p.Deductions || 0).toLocaleString("vi-VN")} đ</td>
                  <td className="fw-bold text-primary">
                    {(p.NetSalary || 0).toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center p-4 text-muted">
              No payroll data found.
            </div>
          )}
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="card shadow-sm p-4 border-0">
        <h6 className="mb-3 fw-bold">Salary Overview</h6>
        <div style={{ height: "350px" }}>
          <Line
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}