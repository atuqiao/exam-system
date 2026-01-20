import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/admin';

// 创建 axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 后端使用 admin-token header，不是 Authorization
      config.headers['admin-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 接口
export const adminApi = {
  // 城市管理
  cities: {
    getList: (params?: any) => api.post('/cities/list', params || {}),
    create: (data: any) => api.post('/cities', data),
    update: (id: number, data: any) => api.put(`/cities/${id}`, data),
    delete: (id: number) => api.delete(`/cities/${id}`),
  },

  // 年级管理
  grades: {
    getList: (params?: any) => api.post('/grades/list', params || {}),
    create: (data: any) => api.post('/grades', data),
    update: (id: number, data: any) => api.put(`/grades/${id}`, data),
    delete: (id: number) => api.delete(`/grades/${id}`),
  },

  // 科目管理
  subjects: {
    getList: (params?: any) => api.post('/subjects/list', params || {}),
    create: (data: any) => api.post('/subjects', data),
    update: (id: number, data: any) => api.put(`/subjects/${id}`, data),
    delete: (id: number) => api.delete(`/subjects/${id}`),
    open: (id: number) => api.post(`/subjects/${id}/open`),
    close: (id: number) => api.post(`/subjects/${id}/close`),
  },

  // 标签管理
  tags: {
    getList: (params?: any) => api.post('/tags/list', params || {}),
    create: (data: any) => api.post('/tags', data),
    update: (id: number, data: any) => api.put(`/tags/${id}`, data),
    delete: (id: number) => api.delete(`/tags/${id}`),
  },

  // 试卷管理
  exams: {
    getList: (params?: any) => api.post('/exams/list', params || {}),
    create: (data: any) => api.post('/exams', data),
    update: (id: number, data: any) => api.put(`/exams/${id}`, data),
    delete: (id: number) => api.delete(`/exams/${id}`),
    getDetail: (id: number) => api.get(`/exams/${id}`),
    search: (params: any) => api.get('/exams/search', { params }),
  },

  // 用户管理
  users: {
    getList: (params?: any) => api.post('/users/list', params || {}),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    updatePoints: (id: number, points: number) => api.put(`/users/${id}/points`, { points }),
    toggleStatus: (id: number) => api.put(`/users/${id}/toggle-status`),
  },

  // 仪表板统计
  dashboard: {
    getStats: () => api.get('/stats/overview'),
  },

  // 认证
  auth: {
    login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  },
};

export default api;
