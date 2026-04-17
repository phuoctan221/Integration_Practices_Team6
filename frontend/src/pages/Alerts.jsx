import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/api/alerts");
        setAlerts(res.data);
      } catch (err) {
        console.error(err);
        setError("Unauthorized or server error.");
      }
    };

    fetchAlerts();
  }, []);

  if (error)
    return <div className="p-4 text-danger">{error}</div>;

  const filtered = severityFilter
    ? alerts.filter((a) => a.Severity === severityFilter)
    : alerts;

  const totalInfo = alerts.filter((a) => a.Severity === "Info").length;
  const totalWarning = alerts.filter((a) => a.Severity === "Warning").length;
  const totalCritical = alerts.filter((a) => a.Severity === "Critical").length;

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4">Alerts Management</h4>

      {/* SUMMARY */}
      <div className="row g-4 mb-4">
        <SummaryCard title="Info" value={totalInfo} color="info" />
        <SummaryCard title="Warning" value={totalWarning} color="warning" />
        <SummaryCard title="Critical" value={totalCritical} color="danger" />
      </div>

      {/* FILTER */}
      <div className="mb-4">
        <select
          className="form-select w-25"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="">-- All Severity --</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Message</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a, i) => (
                  <tr
                    key={i}
                    className={
                      a.Severity === "Critical"
                        ? "table-danger"
                        : a.Severity === "Warning"
                        ? "table-warning"
                        : ""
                    }
                  >
                    <td>{i + 1}</td>
                    <td
                      style={{ cursor: "pointer", fontWeight: "bold" }}
                      onClick={() =>
                        navigate(`/employee/edit/${a.EmployeeID}`)
                      }
                    >
                      {a.FullName || `ID: ${a.EmployeeID}`}
                    </td>
                    <td>{a.Type}</td>
                    <td>{a.Message}</td>
                    <td>
                      <span
                        className={`badge ${
                          a.Severity === "Info"
                            ? "bg-info"
                            : a.Severity === "Warning"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {a.Severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-muted">
                    No alerts found
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

function SummaryCard({ title, value, color }) {
  return (
    <div className="col-md-4">
      <div className={`card border-${color} shadow-sm h-100`}>
        <div className="card-body text-center">
          <h6 className="text-muted">{title}</h6>
          <h3 className={`fw-bold text-${color}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}