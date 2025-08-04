import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>환영합니다 👋</h1>
      <p>시작하려면 아래 버튼을 클릭하세요.</p>
      <button onClick={() => navigate("/login")}>로그인</button>
      <button onClick={() => navigate("/signin")}>회원가입</button>
    </div>
  );
}

export default HomePage;
