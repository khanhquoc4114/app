import { useState } from "react";
import api from "../services/axiosInstance";
import type { LoginResponse } from "../types/types";

export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        // Register user
        await api.post("/auth/register", { username, password });
        alert("Registration successful! Please login.");
        setIsRegister(false);
      } else {
        // Login user
        const res = await api.post<LoginResponse>("/auth/login", {
          username,
          password,
        });
        localStorage.setItem("token", res.data.access_token);
        alert("Login successful!");
      }
    } catch (err: any) {
      setError(isRegister ? "Registration failed" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "auto" }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        onClick={handleAuth} disabled={loading} style={{ marginRight: "10px" }}>
        {loading ? "Please wait..." : isRegister ? "Sign Up" : "Login"}
      </button>
      <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        onClick={() => setIsRegister(!isRegister)}
        style={{ background: "transparent", border: "none", color: "navy", cursor: "pointer" }}
      >
        {isRegister ? "Already have an account? Login" : "New user? Register"}
      </button>
    </div>
  );
}
