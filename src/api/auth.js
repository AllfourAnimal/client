import axios from 'axios';

const BASE_URL = 'https://all4animal.site/api';

// 로그인 API 호출 함수
export async function loginUser({ loginId, password }) {
  const response = await axios.post(`${BASE_URL}/auth/login`, { loginId, password });
  return response.data; // { accessToken, ... } 반환
}

// 회원가입 API 호출 함수
export async function signupUser(
  { loginId,
    password,
    passwordConfirm,
    name,
    phone,
    birthYear,
    location,
    isExperience,
    housingType,
    emptyTime }
  ) {
  const response = await axios.post(`${BASE_URL}/auth/signup`, { loginId, password, passwordConfirm, name, phone, birthYear, location, isExperience, housingType, emptyTime });
  return response.data;
}

// 아이디 중복 검사 API 호출 함수
export async function checkId(loginId) {
  const response = await axios.get(`${BASE_URL}/auth/check-id`, { params: { loginId } });
  return response.data;
}