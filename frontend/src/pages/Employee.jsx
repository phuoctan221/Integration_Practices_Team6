import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ==============================
  // 1. LOAD DANH SÁCH NHÂN VIÊN
  // ==============================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/api/employees");
        setEmployees(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Lỗi tải nhân viên:", err);
        setError("Unauthorized or server error.");
      }
    };

    fetchEmployees();
  }, []);

  // ==============================
  // 2. LOGIC TÌM KIẾM & BỘ LỌC
  // ==============================
  useEffect(() => {
    let result = [...employees];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.FullName?.toLowerCase().includes(s) ||
          e.Department?.toLowerCase().includes(s) ||
          e.Position?.toLowerCase().includes(s)
      );
    }

    if (statusFilter) {
      result = result.filter(
        (e) =>
          e.Status?.toString().trim().toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (departmentFilter) {
      result = result.filter(
        (e) =>
          e.Department?.toString().trim() ===
          departmentFilter.trim()
      );
    }

    setFiltered(result);
  }, [search, statusFilter, departmentFilter, employees]);

  // ==============================
  // 3. XOÁ NHÂN VIÊN
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá nhân viên này?"))
      return;

    try {
      await api.delete(`/api/employees/${id}`);
      const updated = employees.filter(
        (e) => e.EmployeeID !== id
      );
      setEmployees(updated);
    } catch (err) {
      alert(
        "Không thể xoá nhân viên này (có thể do ràng buộc dữ liệu)"
      );
    }
  };

  const departments = [
    ...new Set(
      employees
        .map((e) => e.Department?.trim())
        .filter(Boolean)
    ),
  ];

  if (error)
    return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Employee Management</h2>

      {/* ============================
          THANH TÌM KIẾM & BỘ LỌC
      ============================ */}
      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên, phòng ban, chức vụ..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">
              -- Tất cả trạng thái --
            </option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
          >
            <option value="">
              -- Tất cả phòng ban --
            </option>
            {departments.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 text-end">
          <button
            className="btn btn-primary w-100"
            onClick={() =>
              navigate("/employee/add")
            }
          >
            + Thêm nhân viên
          </button>
        </div>
      </div>

      {/* ============================
          BẢNG DANH SÁCH
      ============================ */}
      <div className="card shadow border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Họ và Tên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Trạng thái</th>
                  <th className="text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((emp) => (
                    <tr key={emp.EmployeeID}>
                      <td>{emp.EmployeeID}</td>
                      <td className="fw-bold">
                        {emp.FullName}
                      </td>
                      <td>{emp.Department}</td>
                      <td>{emp.Position}</td>
                      <td>
                        <span
                          className={`badge ${
                            emp.Status
                              ?.toString()
                              .trim()
                              .toLowerCase() ===
                            "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {emp.Status
                            ?.toString()
                            .trim()}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-info me-1"
                          onClick={() =>
                            navigate(
                              `/employee/${emp.EmployeeID}`
                            )
                          }
                        >
                          Xem
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() =>
                            navigate(
                              `/employee/edit/${emp.EmployeeID}`
                            )
                          }
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDelete(
                              emp.EmployeeID
                            )
                          }
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-muted"
                    >
                      Không tìm thấy nhân viên nào
                      khớp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}