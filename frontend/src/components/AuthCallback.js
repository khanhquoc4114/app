import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role") || "user";

    if (token) {
      localStorage.setItem("token", token);
      login(role);
      message.success("Đăng nhập thành công!");
      navigate("/home");
    } else {
      navigate("/login");
    }
  }, [navigate, login]);

  return <p>Đang xử lý đăng nhập...</p>;
};

export default AuthCallback;
