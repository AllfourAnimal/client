import axios from "axios";

const BASE_URL = "https://all4animal.site/api/review";
// const BASE_URL = 'https://all4animal.site/api/review';

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 리뷰 전체 조회 API 호출 함수
export async function fetchReviews() {
  const response = await axios.get(`${BASE_URL}/all`);
  return response.data;
}

// 동물 타입별 리뷰 조회 API 호출 함수
export async function fetchReviewsByAnimalType(animalType) {
  const response = await axios.get(`${BASE_URL}/animal-type/${animalType}`);
  return response.data;
}

// 입양 인증 리뷰 조회 API 호출 함수
export async function fetchAdoptedReviews() {
  const response = await axios.get(`${BASE_URL}/adopted`);
  return response.data;
}

// 리뷰 상세 조회 API 호출 함수
export async function fetchReviewDetail(reviewId) {
  const response = await axios.get(`${BASE_URL}/${reviewId}`);
  return response.data;
}

// 리뷰 작성 API 호출 함수
export async function createReview(token, reviewData) {
  const response = await axios.post(BASE_URL, reviewData, {
    headers: authHeader(token),
  });
  return response.data;
}

// 리뷰 수정 API 호출 함수
export async function updateReview(reviewId, token, reviewData) {
  const {
    title,
    petName,
    content,
    imageUrls = [],
    imageFiles = [],
  } = reviewData;
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("image", file);
  });

  const response = await axios.patch(`${BASE_URL}/${reviewId}`, formData, {
    headers: authHeader(token),
    params: {
      title,
      petName,
      content,
      imageUrls,
    },
    paramsSerializer: {
      serialize: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
    },
  });
  return response.data;
}

// 리뷰 삭제 API 호출 함수
export async function deleteReview(reviewId, token) {
  const response = await axios.delete(`${BASE_URL}/${reviewId}`, {
    headers: authHeader(token),
  });
  return response.data;
}
