import { useEffect, useState } from "react";
import api from "../api/axiosConfig"; 
import CountUp from "react-countup";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // ========================
  // LOAD DATA FROM API
  // ========================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/dashboard/overview");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Unauthorized or server error. Please check your connection.");
      }
    };

    fetchDashboard();
  }, []);

  // Handle Error State
  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger shadow-sm border-0">{error}</div>
      </div>
    );
  }

  // Handle Loading State
  if (!data) {
    return (
      <div className="container-fluid p-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading dashboard data...</p>
      </div>
    );
  }

  // Safe data declarations
  const salaryChart = data.salaryChart || [];
  const deptChart = data.employeesByDepartment || [];
  
  // Get payroll value (supporting multiple potential backend keys)
  const payrollValue = data.salaryThisMonth || data.totalSalary || 0;

  // ========================
  // CHART CONFIGURATIONS
  // ========================

  const lineData = {
    labels: salaryChart.map((s) => s.Month),
    datasets: [
      {
        label: "Total Payroll (đ)",
        data: salaryChart.map((s) => s.Total),
        borderColor: "#6f42c1",
        backgroundColor: "rgba(111,66,193,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#6f42c1",
      },
    ],
  };

  const donutData = {
    labels: deptChart.map((d) => d.Department),
    datasets: [
      {
        data: deptChart.map((d) => d.Total),
        backgroundColor: [
          "#6f42c1",
          "#20c997",
          "#ffc107",
          "#dc3545",
          "#0d6efd",
          "#6610f2",
          "#fd7e14",
        ],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Employees Count",
        data: [
          data.activeEmployees || 0,
          (data.totalEmployees || 0) - (data.activeEmployees || 0),
        ],
        backgroundColor: ["#20c997", "#dc3545"],
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4 fw-bold">Dashboard Overview</h4>

      {/* ================= KPI SECTION ================= */}
      <div className="row g-4 mb-4">
        <KpiCard
          title="Total Employees"
          value={data.totalEmployees}
          gradient="linear-gradient(135deg,#6f42c1,#9f7aea)"
        />

        <KpiCard
          title="Total Payroll"
          value={payrollValue}
          suffix=" đ"
          gradient="linear-gradient(135deg,#20c997,#38d9a9)"
        />

        <KpiCard
          title="Active Employees"
          value={data.activeEmployees}
          gradient="linear-gradient(135deg,#0d6efd,#4dabf7)"
        />

        <KpiCard
          title="Growth Rate"
          value={data.growthPercent}
          suffix="%"
          gradient="linear-gradient(135deg,#ffc107,#ff922b)"
        />
      </div>

      {/* ================= CHART SECTION ================= */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="fw-bold text-muted mb-4">Salary Trend (Last 6 Months)</h6>
            <div style={{ height: "300px" }}>
              <Line 
                data={lineData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } } 
                }} 
              />
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="fw-bold text-muted mb-4">Department Distribution</h6>
            <Doughnut data={donutData} />
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h6 className="fw-bold text-muted mb-4">Employment Status</h6>
            <Bar 
                data={barData} 
                options={{ 
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }} 
            />
          </div>
        </div>
      </div>

      {/* ================= TABLE: DEPARTMENT DETAILS ================= */}
      <div className="card shadow-sm border-0 mt-4 p-4">
        <h6 className="mb-4 fw-bold text-muted">Employee Distribution by Department</h6>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th className="py-3">Department</th>
                <th className="py-3">Total Employees</th>
                <th className="py-3">Percentage (%)</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {deptChart.map((d, i) => (
                <tr key={i}>
                  <td className="fw-bold text-dark">{d.Department}</td>
                  <td>{d.Total} Employees</td>
                  <td>
                    {((d.Total / data.totalEmployees) * 100).toFixed(1)}%
                  </td>
                  <td>
                    <span className="badge bg-success-subtle text-success px-3">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= KPI CARD COMPONENT =================

function KpiCard({ title, value, prefix = "", suffix = "", gradient }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div
        className="card text-white shadow-sm border-0 h-100"
        style={{
          background: gradient,
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4">
          <h6 className="text-white-50 fw-normal mb-2">{title}</h6>
          <h2 className="fw-bold mb-0">
            {prefix}
            <CountUp 
              end={value || 0} 
              duration={2} 
              separator="." // Dot separator for Vietnamese currency standard
            />
            {suffix}
          </h2>
        </div>
      </div>
    </div>
  );
}