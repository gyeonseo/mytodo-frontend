import instance from "./instance";

export const loginUser = async (username, password) => {
  const response = await instance.post("users/login", {
    username,
    password,
  });

  return response.data; // { token: '...' }
};
