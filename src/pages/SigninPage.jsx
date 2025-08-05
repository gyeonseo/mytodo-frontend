import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../apis/register";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, password: false });
  const navigate = useNavigate();

  const isUsernameValid = username.length >= 4;
  const isPasswordValid = password.length >= 4;

  const handleRegister = async () => {
    if (!isUsernameValid || !isPasswordValid) {
      alert("아이디와 비밀번호는 최소 4글자 이상이어야 합니다.");
      return;
    }

    try {
      const data = await registerUser(username, password);
      alert(data.message || "회원가입 성공!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("회원가입 실패");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="mb-4 text-center">회원가입</h2>

        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${
              touched.username && !isUsernameValid ? "is-invalid" : ""
            }`}
            id="floatingUsername"
            placeholder="username"
            value={username}
            onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="floatingUsername">Username</label>
          <div className="invalid-feedback">
            아이디는 최소 4글자 이상이어야 합니다.
          </div>
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${
              touched.password && !isPasswordValid ? "is-invalid" : ""
            }`}
            id="floatingPassword"
            placeholder="password"
            value={password}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="floatingPassword">Password</label>
          <div className="invalid-feedback">
            비밀번호는 최소 4글자 이상이어야 합니다.
          </div>
        </div>

        <button className="btn btn-success w-100" onClick={handleRegister}>
          회원가입
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
