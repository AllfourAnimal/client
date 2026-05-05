import axios from 'axios';

// const BASE_URL = 'https://all4animal.site/api/favorites';
const BASE_URL = 'http://localhost:8080/api/favorites';

// 찜 목록 추가/삭제 API 호출 함수
export async function toggleFavorite(token, animalId) {
  const response = await axios.post(`${BASE_URL}/${animalId}`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

// 찜 목록 조회 API 호출 함수
export async function fetchFavorites(token) {
  const response = await axios.get(`${BASE_URL}/my_favorite`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
