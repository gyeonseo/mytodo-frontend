import instance from "./instance";

export const registerUser = async (username, password) => {
  const response = await instance.post("users/signup", {
    username,
    password,
  });

  return response.data; // { message: '회원가입 성공' }
};
