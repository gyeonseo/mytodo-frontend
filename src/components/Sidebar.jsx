import { useNavigate } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const { categories = [], selectCategory } = useCategory();

  const handleCategoryClick = async (cat) => {
    // 선택 상태 업데이트 (선택 상태가 꼭 필요없다면 생략 가능)
    await selectCategory(cat.id);

    // 2) 실제로 URL 이동 수행
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1~12
    navigate(
      `/app?category=${encodeURIComponent(
        String(cat.id)
      )}&year=${year}&month=${month}`
    );
  };

  return (
    <div className="sidebar">
      {/* ALL은 목록 밖에서 단일 버튼로 렌더링(고정 key) */}
      <button key="ALL" onClick={() => navigate("/app")}>
        ALL
      </button>

      {categories.map((cat) => (
        <button
          key={String(cat.id)} // ✅ 고유 key
          onClick={() => handleCategoryClick(cat)}
        >
          {cat.name}
        </button>
      ))}

      <button onClick={() => navigate("/app/category/new")}>＋</button>
    </div>
  );
}
