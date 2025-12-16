import axios from 'axios';

const api = axios.create({
    // TODO 生产环境需要切换！
    baseURL: '/api', // 生产环境
    // baseURL: 'http://localhost:8080', // 开发环境
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default api;