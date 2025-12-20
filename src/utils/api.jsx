import axios from 'axios';

const api = axios.create({
    // 自动适配开发/生产环境
    baseURL: "https://antplant.store/",
    // baseURL: "http://localhost:8080",
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;