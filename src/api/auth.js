import axios from "axios";

// const BASE_URL = "http://localhost:8080/api/auth";
const BASE_URL = "https://all4animal.site/api/auth";

// 로그인 API 호출 함수
export async function loginUser({ loginId, password }) {
  const response = await axios.post(`${BASE_URL}/login`, { loginId, password });
  return response.data; // { accessToken, ... } 반환
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 회원가입 API 호출 함수
export async function signupUser({
  loginId,
  password,
  passwordConfirm,
  name,
  phone,
  birthYear,
  location,
  isExperience,
  housingType,
  emptyTime,
}) {
  const response = await axios.post(`${BASE_URL}/signup`, {
    loginId,
    password,
    passwordConfirm,
    name,
    phone,
    birthYear,
    location,
    isExperience,
    housingType,
    emptyTime,
  });
  return response.data;
}

// 아이디 중복 검사 API 호출 함수
export async function checkId(loginId) {
  const response = await axios.get(`${BASE_URL}/checkId`, {
    params: { loginId },
  });
  return response.data;
}
// 내 정보 조회 API 호출 함수
export async function fetchMe(token) {
  const response = await axios.get(`${BASE_URL}/me`, {
    headers: authHeader(token),
  });
  return response.data;
}
