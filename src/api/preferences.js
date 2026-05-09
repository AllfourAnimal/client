import axios from "axios";

const BASE_URL = "https://all4animal.site/api/users/preferences";

// 선호 정보 수정 API
export async function patchPreferences(token, preferences) {
  const response = await axios.patch(`${BASE_URL}`, preferences, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 선호 정보 조회 API
export async function getPreferences(token) {
  const response = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
