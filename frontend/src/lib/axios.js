import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ adjust if your backend uses a different prefix
  headers: {
    'Content-Type': 'application/json',
  },
});
