import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <h1>MyTodo</h1>
      <p>시작하려면 아래 버튼을 클릭하세요.</p>
      <div>
        <button onClick={() => navigate("/login")}>로그인</button>
        <button onClick={() => navigate("/signin")}>회원가입</button>
      </div>
    </div>
  );
}

export default HomePage;
