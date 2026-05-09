import axios from "axios";

const BASE_URL = "https://all4animal.site/api/profile";

export async function fetchProfile(token) {
  const response = await axios.get(BASE_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function updateProfile(token, profile) {
  const response = await axios.patch(BASE_URL, profile, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}
