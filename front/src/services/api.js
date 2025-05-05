import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6699'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verifica se não estamos na página de login (para evitar redirecionamento em loop)
    const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
    
    if (error.response && error.response.status === 401 && !isLoginPage) {
      // Limpa o localStorage e redireciona para o login somente se não estiver já na página de login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 