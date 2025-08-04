import { useNavigate, useLocation } from "react-router-dom";
import InputForm from "../components/InputForm";
import { deleteCategory } from "../apis/category";
import { useCategory } from "../context/CategoryContext";

export default function EditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useCategory();

  // --- 쿼리에서 category id 읽기 (hash 라우터 호환)
  const rawSearch =
    location.search ||
    (location.hash && location.hash.includes("?")
      ? location.hash.slice(location.hash.indexOf("?"))
      : "");
  const params = new URLSearchParams(rawSearch);
  const categoryId = params.get("category");

  // --- id 기준으로 매칭 (id가 없으면 fid/categoryId도 고려)
  const category =
    categories.find(
      (c) => String(c.id ?? c.fid ?? c.categoryId) === String(categoryId ?? "")
    ) || null;

  if (!categoryId) {
    return <p>잘못된 접근입니다. (category 파라미터 없음)</p>;
  }

  if (!category) {
    return <p>잘못된 접근입니다. (카테고리 정보 없음)</p>;
  }

  const handleDelete = async () => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteCategory(category.id);
      alert("삭제 완료");
      navigate("/app");
    } catch (err) {
      alert("삭제 실패");
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <InputForm
        mode="edit"
        category={category}
        onSuccess={() => navigate("/app")}
      >
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
      </InputForm>
    </div>
  );
}
