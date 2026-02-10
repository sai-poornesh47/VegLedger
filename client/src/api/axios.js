// client/src/api/axios.js
import axios from 'axios';

// This points to your running Express server
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;