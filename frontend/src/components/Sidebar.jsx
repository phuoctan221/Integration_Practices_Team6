import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/Sidebar.css";

export default function Sidebar() {

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/overview", icon: "" },
    { name: "Employee", path: "/employee", icon: "" },
    { name: "Payroll", path: "/payroll", icon: "" },
    { name: "Attendance", path: "/attendance", icon: "" },
    { name: "Reports", path: "/reports", icon: "" },
    { name: "Alerts", path: "/alerts", icon: "" },
    { name: "Profile", path: "/profile", icon: "" }
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div className="sidebar-header">
        <span className="logo">
          {collapsed ? "" : ""}
        </span>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </div>

      <div className="menu">

        {menu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`menu-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}

      </div>

    </div>
  );
}