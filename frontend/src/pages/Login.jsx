import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Thêm Link để điều hướng
import "../styles/Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì vào thẳng Overview
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/overview");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);
      const token = res?.data?.token;

      if (!token) {
        setErrorMsg("Đăng nhập thất bại: Không tìm thấy token.");
        return;
      }

      // Lưu thông tin vào bộ nhớ trình duyệt
      localStorage.setItem("token", token);
      if (res?.data?.user?.role) {
        localStorage.setItem("role", res.data.user.role);
      }

      // Chuyển hướng
      navigate("/overview");
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.msg || "Sai tài khoản hoặc mật khẩu!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Các khối cầu trang trí chuyển động phía sau */}
      <div className="background-shape shape-1"></div>
      <div className="background-shape shape-2"></div>

      <div className="login-card">
        <div className="card-header">
          <h3>Welcome Back 👋</h3>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {errorMsg && <div className="login-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Tên tài khoản"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Đăng Nhập"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
          <div className="demo-info">
            Demo: <span>admin / 123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}