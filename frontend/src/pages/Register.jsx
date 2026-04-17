import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", role: "User" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Kiểm tra mật khẩu khớp nhau
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username: form.username,
        password: form.password,
        role: form.role
      });

      setSuccessMsg(res.data.msg || "Đăng ký thành công!");
      
      // Chuyển hướng sang trang login sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setErrorMsg(err?.response?.data?.msg || "Đăng ký thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="background-shape shape-1"></div>
      <div className="background-shape shape-2"></div>

      <div className="register-card">
        <div className="card-header">
          <h3>Create Account</h3>
          <p>Tham gia hệ thống quản lý nhân sự ngay</p>
        </div>

        {errorMsg && <div className="register-error">{errorMsg}</div>}
        {successMsg && <div className="register-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Nhập tên tài khoản"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Đăng Ký"}
          </button>
        </form>

        <div className="register-footer">
          <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
        </div>
      </div>
    </div>
  );
}