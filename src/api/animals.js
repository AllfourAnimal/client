import axios from 'axios';

const BASE_URL = '/api/animals';

// 동물 정보 API 호출 함수
export async function fetchAnimals(token) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}