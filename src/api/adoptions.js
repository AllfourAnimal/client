import axios from 'axios';

const BASE_URL = 'https://all4animal.site/api/adoptions';

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 내가 입양 문의/신청한 목록 조회 API 호출 함수
export async function fetchMyAdoptions(token) {
  const response = await axios.get(`${BASE_URL}/my`, {
    headers: authHeader(token),
  });
  return response.data;
}
