import axios from 'axios';

const BASE_URL = '/api/animals';

// 동물 정보 API 호출 함수
export async function fetchAnimals(token) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 동물 이미지 목록 API 호출 함수
export async function fetchAnimalImages(animalId, token) {
  const response = await axios.get(`${BASE_URL}/${animalId}/images`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}