import axios from "axios";

// const BASE_URL = "http://localhost:8080/api";
const BASE_URL = "https://all4animal.site/api";

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function sendChatMessage(token, message) {
  const response = await axios.post(
    `${BASE_URL}/chatbot/ask`,
    {
      keyword: message,
    },
    {
      headers: authHeader(token),
    },
  );
  return response.data;
}
