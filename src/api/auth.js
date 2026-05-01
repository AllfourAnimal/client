import axios from 'axios';

const BASE_URL = 'https://port-0-server-mnpq6pmy055ea378.sel3.cloudtype.app/api';

// 로그인 API 호출 함수
export async function loginUser({ loginId, password }) {
  const response = await axios.post(`${BASE_URL}/auth/login`, { loginId, password });
  return response.data; // { accessToken, ... } 반환
}
