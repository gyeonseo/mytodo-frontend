import InputForm from "../components/InputForm";
import { useNavigate } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";

export default function NewCategoryPage() {
  const { triggerRefresh } = useCategory();
  const navigate = useNavigate();

  const handleSuccess = () => {
    triggerRefresh(); // 👈 사이드바 갱신 트리거
    navigate("/app");
  };

  return (
    <div className="page-container">
      <InputForm mode="create" onSuccess={handleSuccess} />
    </div>
  );
}
