// export const API_BASE_URL = 'https://mathscan-backend.onrender.com/api';
export const API_BASE_URL = 'http://localhost:3000/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};