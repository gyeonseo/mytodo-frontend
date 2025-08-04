import React, { useState } from "react";
import { loginUser } from "../apis/login";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h2>로그인</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}

export default LoginPage;
