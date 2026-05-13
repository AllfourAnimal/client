import axios from "axios";

const BASE_URL = "https://all4animal.site/api/animals";

// 동물 정보 API 호출 함수
export async function fetchAnimals(token, page = 0, size = 10, signal) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, size },
    signal,
  });
  return response.data;
}

// 개별 동물 상세 정보 API 호출 함수
export async function fetchAnimalById(animalId, token) {
  const response = await axios.get(`${BASE_URL}/${animalId}`, {
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

const LOCAL_AI_IMAGES = {
  1: '/images/aiImage_1.png',
  2: '/images/aiImage_2.png',
  4: '/images/aiImage_4.png',
  97: '/images/aiImage_97.png',
  174: '/images/aiImage_174.png',
};

function normalizeImages(images) {
  return images
    .map((image) => ({
      imageUrl: image?.imageUrl ?? image?.image_url ?? image?.url ?? null,
      is_ai_image: image?.is_ai_image ?? image?.isAiImage ?? false,
    }))
    .filter((image) => image.imageUrl);
}

export function getAiImage(images, animalId) {
  const normalized = normalizeImages(images);
  const apiAiImage = normalized.find((image) => image.is_ai_image)?.imageUrl;
  if (apiAiImage) return apiAiImage;

  const localFallback = animalId != null ? LOCAL_AI_IMAGES[Number(animalId)] : undefined;
  return localFallback ?? normalized[0]?.imageUrl ?? null;
}

export function getAllImages(images, animalId) {
  const normalized = normalizeImages(images);
  const hasApiAiImage = normalized.some((img) => img.is_ai_image);

  const localFallback =
    !hasApiAiImage && animalId != null ? LOCAL_AI_IMAGES[Number(animalId)] : null;

  const aiImages = hasApiAiImage
    ? normalized.filter((img) => img.is_ai_image)
    : localFallback
      ? [{ imageUrl: localFallback, is_ai_image: true }]
      : [];

  return [
    ...aiImages,
    ...normalized.filter((img) => !img.is_ai_image),
  ];
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
  const response = await axios.get(
    `https://all4animal.site/api/stories/${animalId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
}

// 추천 동물 조회 API 호출 함수
export async function getRecommendedAnimals(token) {
  const response = await axios.get("https://all4animal.site/api/users/recommendations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
