import React, { useState } from "react";
import { loginUser } from "../apis/login";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(username, password);
      const bearerToken = data.token;

      localStorage.setItem("accessToken", bearerToken);
      setToken(bearerToken);
      alert("로그인 성공!");
      navigate("/app");
    } catch (error) {
      console.error(error);
      alert("로그인 실패");
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <div style={{ width: "100%", maxWidth: "320px" }}>
        <h2 className="mb-4 text-center">로그인</h2>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="floatingLoginUsername"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="floatingLoginUsername">Username</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="floatingLoginPassword"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="floatingLoginPassword">Password</label>
        </div>
        <button className="btn btn-success w-100" onClick={handleLogin}>
          로그인
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
