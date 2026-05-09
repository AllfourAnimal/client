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

// 입양 문의 등록 API 호출 함수
export async function adoptionInquiry(token, animalId) {
  const response = await axios.post(
    `${BASE_URL}/${animalId}/inquiry`,
    null,
    { headers: authHeader(token) },
  );
  return response.data;
}

// 입양 완료 사진 등록 API 호출 함수
export async function submitAdoptionCertificate(token, adoptionId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(
    `${BASE_URL}/${adoptionId}/proof-image`,
    formData,
    { headers: authHeader(token) },
  );
  return response.data;
}
