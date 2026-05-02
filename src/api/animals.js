import axios from 'axios';

const BASE_URL = 'https://all4animal.site/api/animals';

// 동물 정보 API 호출 함수
export async function fetchAnimals() {
  const response = await axios.get(`${BASE_URL}`);
  return response.data; // 동물 정보 배열 반환
}