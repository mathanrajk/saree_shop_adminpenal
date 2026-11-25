import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.2:8989',
  withCredentials: true,
});

export default client;
