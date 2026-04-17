import "../styles/Header.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="brand-box">
          <h5 className="brand-title">HRMS</h5>
        </div>
      </div>

      <div className="header-right">
        <div className="user-section">
          <div className="user-profile" onClick={() => setShowMenu(!showMenu)}>
            <div className="avatar-wrapper">
              <img src="https://i.pravatar.cc/40?img=11" alt="avatar" />
              <div className="status-indicator"></div>
            </div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Quản trị viên</span>
            </div>
            <span className={`arrow-icon ${showMenu ? "rotate" : ""}`}>▼</span>
          </div>

          {showMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                 Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}