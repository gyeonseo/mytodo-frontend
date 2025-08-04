// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { registerUser } from "../apis/register";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const data = await registerUser(username, password);
      alert(data.message || "회원가입 성공!");
      navigate("/login");
    } catch (error) {
      alert("회원가입 실패");
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
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
      <button onClick={handleRegister}>회원가입</button>
    </div>
  );
}

export default RegisterPage;
