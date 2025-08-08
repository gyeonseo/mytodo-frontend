import { createContext, useContext, useEffect, useState } from "react";
import { fetchCategories, fetchCategoryById } from "../apis/category";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();

        // id 필드 우선, 없으면 fid/categoryId 로 fallback
        const normalized = data.map((c) => {
          const id = c.id ?? c.fid ?? c.categoryId; // 어떤 백엔드든 안전하게
          return { ...c, id };
        });

        setCategories(normalized);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
        setCategories([{ id: null, name: "-" }]);
      }
    };
    load();
  }, [refreshKey]);

  const selectCategory = async (id) => {
    if (!id) {
      setSelectedCategory(null);
      return;
    }
    try {
      const detail = await fetchCategoryById(id);
      const normalized = {
        ...detail,
        id: detail.id ?? detail.fid ?? detail.categoryId,
      };
      setSelectedCategory(normalized);
    } catch (err) {
      console.error("카테고리 상세 조회 실패:", err);
    }
  };

  const value = {
    refreshKey,
    triggerRefresh,
    categories,
    selectedCategory,
    selectCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);
