// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Bar, Line } from "react-chartjs-2";
// import { Users, UserCheck, CreditCard, TrendingUp } from "lucide-react"; // Import Icons
// import "chart.js/auto";
// import "../styles/Dashboard.css";

// function Dashboard() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/dashboard/overview")
//       .then(res => setData(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   if (!data) {
//     return (
//       <div className="loader-container">
//         <div className="spinner"></div>
//         <p>Đang tải dữ liệu...</p>
//       </div>
//     );
//   }

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { labels: { color: "#cbd5e1", font: { family: 'Inter' } } }
//     },
//     scales: {
//       x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
//       y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } }
//     }
//   };

//   const deptChart = {
//     labels: data.employeesByDepartment.map(d => d.Department),
//     datasets: [{
//       label: "Nhân viên",
//       data: data.employeesByDepartment.map(d => d.Total),
//       backgroundColor: "rgba(99, 102, 241, 0.8)",
//       borderRadius: 8,
//       hoverBackgroundColor: "#818cf8"
//     }]
//   };

//   const salaryChart = {
//     labels: data.salaryChart.map(s => s.Month),
//     datasets: [{
//       label: "Tổng lương",
//       data: data.salaryChart.map(s => s.Total),
//       borderColor: "#10b981",
//       backgroundColor: "rgba(16, 185, 129, 0.1)",
//       tension: 0.4,
//       fill: true,
//       pointRadius: 4,
//       pointBackgroundColor: "#10b981"
//     }]
//   };

//   return (
//     <div className="dashboard-wrapper">
//       <div className="dashboard-header">
//         <div>
//           <h2>Tổng Quan Hệ Thống</h2>
//           <p>Chào mừng bạn quay trở lại, đây là số liệu hôm nay.</p>
//         </div>
//         <button className="refresh-btn" onClick={() => window.location.reload()}>
//            Làm mới dữ liệu
//         </button>
//       </div>

//       {/* KPI Cards */}
//       <div className="kpi-grid">
//         <KpiCard
//           title="Tổng Nhân Viên"
//           value={data.totalEmployees}
//           icon={<Users size={24} />}
//           color="blue"
//         />
//         <KpiCard
//           title="Đang Hoạt Động"
//           value={data.activeEmployees}
//           icon={<UserCheck size={24} />}
//           color="green"
//         />
//         <KpiCard
//           title="Quỹ Lương Tháng"
//           value={data.totalSalary}
//           suffix=" đ"
//           icon={<CreditCard size={24} />}
//           color="purple"
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="charts-grid">
//         <div className="chart-card">
//           <div className="chart-info">
//             <h5>Nhân sự theo phòng ban</h5>
//             <TrendingUp size={18} className="text-muted" />
//           </div>
//           <div className="chart-container">
//             <Bar data={deptChart} options={chartOptions} />
//           </div>
//         </div>

//         <div className="chart-card">
//           <div className="chart-info">
//             <h5>Biến động lương 6 tháng</h5>
//             <TrendingUp size={18} className="text-muted" />
//           </div>
//           <div className="chart-container">
//             <Line data={salaryChart} options={chartOptions} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function KpiCard({ title, value, suffix = "", icon, color }) {
//   return (
//     <div className={`kpi-card-v2 ${color}`}>
//       <div className="kpi-content">
//         <span className="kpi-label">{title}</span>
//         <h3 className="kpi-value">
//           {value.toLocaleString("vi-VN")}
//           <span className="kpi-suffix">{suffix}</span>
//         </h3>
//       </div>
//       <div className="kpi-icon-wrapper">
//         {icon}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;