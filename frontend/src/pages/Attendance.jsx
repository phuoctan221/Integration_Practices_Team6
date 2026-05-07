import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function Attendance() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [error, setError] = useState(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/api/attendance");
        setData(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
        setError("Unauthorized or server error.");
      }
    };

    fetchAttendance();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let result = [...data];

    if (yearFilter) {
      result = result.filter((a) =>
        a.Month?.startsWith(yearFilter)
      );
    }

    if (monthFilter) {
      result = result.filter((a) => {
        const month = a.Month?.split("-")[1];
        return month === monthFilter;
      });
    }

    if (employeeFilter) {
      result = result.filter((a) =>
        a.FullName?.toLowerCase().includes(
          employeeFilter.toLowerCase()
        )
      );
    }

    setFiltered(result);
  }, [monthFilter, yearFilter, employeeFilter, data]);

  // ================= SUMMARY =================
  const totalWork = filtered.reduce(
    (sum, a) => sum + a.WorkDays,
    0
  );
  const totalLeave = filtered.reduce(
    (sum, a) => sum + a.LeaveDays,
    0
  );
  const totalAbsent = filtered.reduce(
    (sum, a) => sum + a.AbsentDays,
    0
  );

  // Lấy danh sách năm duy nhất
  const years = [
    ...new Set(data.map((a) => a.Month?.split("-")[0])),
  ];

  if (error)
    return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container-fluid">
      <h4 className="mb-4 fw-bold">
        Attendance Management
      </h4>

      {/* FILTER */}
      <div className="row g-3 mb-4">
        {/* YEAR FILTER */}
        <div className="col-md-2">
          <select
            className="form-select"
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value)
            }
          >
            <option value="">
              -- Filter by Year --
            </option>
            {years.map((y, i) => (
              <option key={i} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* MONTH FILTER */}
        <div className="col-md-2">
          <select
            className="form-select"
            value={monthFilter}
            onChange={(e) =>
              setMonthFilter(e.target.value)
            }
          >
            <option value="">
              -- Filter by Month --
            </option>
            {[...Array(12)].map((_, i) => {
              const month = String(i + 1).padStart(
                2,
                "0"
              );
              return (
                <option key={month} value={month}>
                  Month {i + 1}
                </option>
              );
            })}
          </select>
        </div>

        {/* EMPLOYEE FILTER */}
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Filter by Employee"
            value={employeeFilter}
            onChange={(e) =>
              setEmployeeFilter(e.target.value)
            }
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <SummaryCard
          title="Work Days"
          value={totalWork}
          color="success"
        />
        <SummaryCard
          title="Leave Days"
          value={totalLeave}
          color="warning"
        />
        <SummaryCard
          title="Absent Days"
          value={totalAbsent}
          color="danger"
        />
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Month</th>
                <th>Employee</th>
                <th>WorkDays</th>
                <th>LeaveDays</th>
                <th>AbsentDays</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a, i) => (
                  <tr
                    key={i}
                    className={
                      a.AbsentDays > 5
                        ? "table-danger"
                        : ""
                    }
                  >
                    <td>{a.Month}</td>
                    <td>{a.FullName}</td>
                    <td>{a.WorkDays}</td>
                    <td>{a.LeaveDays}</td>
                    <td className="fw-bold">
                      {a.AbsentDays}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-4 text-muted"
                  >
                    No attendance data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= SUMMARY CARD =================

function SummaryCard({ title, value, color }) {
  return (
    <div className="col-md-4">
      <div className={`card border-${color} shadow-sm`}>
        <div className="card-body text-center">
          <h6>{title}</h6>
          <h3 className={`text-${color}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}