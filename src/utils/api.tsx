import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // baseURL: "https://antplant.store/",
    // baseURL: "http://localhost:8080",
    timeout: 5000,
    withCredentials: true, // 全局开启跨域携带 Cookie
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;