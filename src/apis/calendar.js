import instance from "./instance";

export const fetchCalendarByCategoryId = async (id, year, month) => {
  const res = await instance.get(`/categories/${id}/calendar`, {
    params: { year, month },
  });
  return res.data;
};

export const updateCalendarStatus = async (id, date, status) => {
  const res = await instance.post(`/categories/${id}/calendar`, {
    date,
    status,
  });
  return res.data;
};
