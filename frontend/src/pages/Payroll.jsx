import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
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

  // ================= LOAD DATA =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/payroll", {
        headers: { Authorization: `Bearer ${token}` }
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

  const months = [...new Set(payroll.map(p => p.SalaryMonth))];
  const departments = [...new Set(payroll.map(p => p.Department))];

  // ================= FILTER =================
  useEffect(() => {
    let result = [...payroll];

    // ✅ Nếu chưa chọn tháng thì lấy tháng mới nhất
    const selectedMonth = monthFilter || months[0];

    if (selectedMonth) {
      result = result.filter(p => p.SalaryMonth === selectedMonth);
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

  // ================= TOTAL PAYROLL =================
  const totalPayroll = useMemo(() => {
    return filtered.reduce((sum, p) => sum + (p.NetSalary || 0), 0);
  }, [filtered]);

  // ================= CHART DATA (NO DUPLICATE) =================
  const chartData = useMemo(() => {
    const employeeMap = new Map();

    // ✅ Ghi đè theo tên nhân viên (đảm bảo 1 người = 1 dòng)
    filtered.forEach(p => {
      employeeMap.set(p.FullName, p.NetSalary || 0);
    });

    const labels = Array.from(employeeMap.keys());
    const data = Array.from(employeeMap.values());

    return {
      labels,
      datasets: [
        {
          label: "Net Salary (đ)",
          data,
          backgroundColor: "#6f42c1",
          borderRadius: 6
        }
      ]
    };
  }, [filtered]);

  // ================= LOADING =================
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

      {/* FILTER */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">-- Latest Month --</option>
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

      {/* TOTAL CARD */}
      <div className="card shadow-sm p-4 mb-4 border-0 bg-light">
        <h6 className="text-muted">Total Payroll (Selected Month)</h6>
        <h2 className="fw-bold text-success">
          {totalPayroll.toLocaleString("vi-VN")} đ
        </h2>
      </div>

      {/* TABLE */}
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

      {/* BAR CHART */}
      <div className="card shadow-sm p-4 border-0">
        <h6 className="mb-3 fw-bold">
          Net Salary Comparison (By Employee)
        </h6>
        <div style={{ height: "350px" }}>
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.raw.toLocaleString("vi-VN") + " đ";
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString("vi-VN");
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}