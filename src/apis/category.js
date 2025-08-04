import instance from "./instance";

export const fetchCategories = async () => {
  const res = await instance.get("/categories");
  return res.data;
};

export const fetchCategoryById = async (id) => {
  const res = await instance.get(`/categories/${id}`);
  return res.data;
};

export const saveCategory = async (category, isEdit = false) => {
  if (isEdit) {
    const res = await instance.put(`/categories/${category.id}`, category);
    return res.data;
  } else {
    const res = await instance.post("/categories", category);
    return res.data;
  }
};

export const deleteCategory = async (id) => {
  const res = await instance.delete(`/categories/${id}`);
  return res.data;
};
