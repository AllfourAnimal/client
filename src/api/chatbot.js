import axios from "axios";

const BASE_URL = "http://localhost:8080/api";
// const BASE_URL = "https://all4animal.site/api";

export async function sendChatMessage(message) {
  const response = await axios.post(`${BASE_URL}/chatbot/ask`, null, {
    params: { keyword: message },
  });
  return response.data;
}
