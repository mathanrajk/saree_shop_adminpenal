import axios from 'axios';

const client = axios.create({
  baseURL: 'https://saree-shop-server-8uuv.onrender.com',
  withCredentials: true,
});

export default client;
