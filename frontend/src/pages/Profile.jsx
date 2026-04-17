import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, Key, CheckCircle } from "lucide-react";
import "../styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/profile")
      .then(res => setUser(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match!" });
    }
    try {
      await api.post("/api/change-password", { newPassword: passwordForm.newPassword });
      setMsg({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: "Failed to update password." });
    }
  };

  if (!user) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="profile-container">
      <div className="background-shape shape-1"></div>
      
      <div className="profile-card">
        {/* User Info Section */}
        <div className="profile-header">
          <div className="avatar-large">
            {user.Username.charAt(0).toUpperCase()}
          </div>
          <h2>{user.Username}</h2>
          <span className={`badge-role ${user.Role.toLowerCase()}`}>
            <Shield size={14} /> {user.Role}
          </span>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <div className="info-item">
              <User size={18} />
              <div>
                <label>Account Status</label>
                <p>{user.IsActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Change Password Section */}
          <form className="password-form" onSubmit={handleChangePassword}>
            <h4><Key size={18} /> Change Password</h4>
            {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
            
            <input 
              type="password" 
              placeholder="New Password" 
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              required 
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              required 
            />
            <button type="submit" className="btn-save">Update Password</button>
          </form>

          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout Account
          </button>
        </div>
      </div>
    </div>
  );
}