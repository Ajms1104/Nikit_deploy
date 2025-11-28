// src/api.js
import axios from 'axios';
// (나중에 로컬에서 테스트할 땐 주석을 바꾸면 됩니다)
const BASE_URL = "https://nikitdeploy-production.up.railway.app/api/v1";
// const BASE_URL = "http://localhost:8080/api/v1"; // 로컬 테스트용



const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;