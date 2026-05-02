import axios from 'axios';

const BASE_URL = 'http://all4animal.site:8080/api';

// 로그인 API 호출 함수
export async function loginUser({ loginId, password }) {
  const response = await axios.post(`${BASE_URL}/auth/login`, { loginId, password });
  return response.data; // { accessToken, ... } 반환
}