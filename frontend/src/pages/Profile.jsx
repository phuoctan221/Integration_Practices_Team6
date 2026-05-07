import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, Key } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/profile")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMsg({
        type: "danger",
        text: "Passwords do not match!",
      });
    }

    try {
      await api.post("/api/change-password", {
        newPassword: passwordForm.newPassword,
      });

      setMsg({
        type: "success",
        text: "Password updated successfully!",
      });

      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({
        type: "danger",
        text: "Failed to update password.",
      });
    }
  };

  if (!user)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="card shadow-sm">
            <div className="card-body p-4">

              {/* HEADER */}
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{ width: 70, height: 70, fontSize: 28 }}
                >
                  {user.Username.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 className="mb-1">{user.Username}</h4>
                  <span className="badge bg-secondary">
                    <Shield size={14} className="me-1" />
                    {user.Role}
                  </span>
                </div>
              </div>

              <hr />

              {/* ACCOUNT INFO */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">
                  <User size={16} className="me-2" />
                  Account Information
                </h6>

                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1 text-muted">Status</p>
                    <p className="fw-bold">
                      {user.IsActive ? (
                        <span className="text-success">
                          Active
                        </span>
                      ) : (
                        <span className="text-danger">
                          Inactive
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <hr />

              {/* CHANGE PASSWORD */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">
                  <Key size={16} className="me-2" />
                  Change Password
                </h6>

                {msg.text && (
                  <div className={`alert alert-${msg.type}`}>
                    {msg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="New Password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm Password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <hr />

              {/* LOGOUT */}
              <div className="text-end">
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="me-1" />
                  Logout
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}