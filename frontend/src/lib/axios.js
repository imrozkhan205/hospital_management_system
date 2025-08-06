import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URI,
  headers: {
    'Content-Type': 'application/json',
  },
});