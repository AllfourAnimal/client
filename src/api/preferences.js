import axios from 'axios';

const BASE_URL = '/api/preferences';

export async function savePreferences(token, preferences) {
  const response = await axios.post(BASE_URL, preferences, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
