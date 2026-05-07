import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/animals';
// const BASE_URL = 'https://all4animal.site/api/animals';

// 동물 정보 API 호출 함수
export async function fetchAnimals(token, page = 0, size = 10) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, size },
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

// 동물 검색 필터링 API 호출 함수
export async function searchAnimals(token, filters) {
  const response = await axios.get(`${BASE_URL}/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: filters,
  });
  return response.data;
}

// 동물 스토리 조회 API 호출 함수
export async function getAnimalStory(animalId, token) {
  const response = await axios.get(`https://all4animal.site/api/stories/${animalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;

}

