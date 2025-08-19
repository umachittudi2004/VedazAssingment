import axios from "axios";

// Use your machine's IP if testing on a real device
const API_URL = "https://d7c114d38da4.ngrok-free.app" || "http://localhost:5000"

const api = axios.create({ baseURL: API_URL });

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;