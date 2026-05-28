import axios from 'axios';
import { BASE_URL } from './constants';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor cho Request: Gửi kèm token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý tự động lỗi 401 (hết hạn token/chưa đăng nhập)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa thông tin đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      
      // Chuyển hướng về trang login nếu không phải ở trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
