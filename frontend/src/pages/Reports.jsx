import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/api/reports");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Unauthorized or failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  if (error)
    return <div className="p-4 text-danger">{error}</div>;

  if (!data)
    return <div className="p-4">Loading reports...</div>;

  const deptChart = {
    labels: data.departmentReport.map((d) => d.Department),
    datasets: [
      {
        label: "Employees",
        data: data.departmentReport.map((d) => d.Total),
        backgroundColor: [
          "#6f42c1",
          "#20c997",
          "#ffc107",
          "#dc3545",
          "#0d6efd",
        ],
      },
    ],
  };

  const statusChart = {
    labels: data.statusReport.map((s) => s.Status),
    datasets: [
      {
        data: data.statusReport.map((s) => s.Total),
        backgroundColor: ["#20c997", "#dc3545"],
      },
    ],
  };

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Reports Dashboard</h4>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="row g-4 mb-4">
        <SummaryCard
          title="Total Employees"
          value={data.totalEmployees}
        />
        <SummaryCard
          title="Total Salary"
          value={`${Number(
            data.totalSalary
          ).toLocaleString()} đ`}
        />
        <SummaryCard
          title="Average Salary"
          value={`${Number(
            data.avgSalary
          ).toLocaleString()} đ`}
        />
        <SummaryCard
          title="Absence Rate"
          value={`${data.absenceRate}%`}
        />
      </div>

      {/* ================= CHART SECTION ================= */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100 p-4">
            <h6 className="mb-3">
              Employees by Department
            </h6>
            <Bar data={deptChart} />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100 p-4">
            <h6 className="mb-3">
              Employee Status
            </h6>
            <Pie data={statusChart} />
          </div>
        </div>
      </div>

      {/* ================= TOP ABSENT ================= */}
      <div className="card shadow-sm mt-4 p-4">
        <h6 className="mb-3">
          Top Absent Employees
        </h6>

        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Total Absent Days</th>
              </tr>
            </thead>
            <tbody>
              {data.topAbsent.map((t, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{t.EmployeeID}</td>
                  <td>
                    <span className="badge bg-danger">
                      {t.total_absent} days
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

// ================= SUMMARY CARD =================

function SummaryCard({ title, value }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="card shadow-sm h-100 text-center p-4">
        <h6 className="text-muted">{title}</h6>
        <h3 className="fw-bold mt-2">{value}</h3>
      </div>
    </div>
  );
}