// client/src/api/axios.js
import axios from 'axios';

// This points to your running Express server
const api = axios.create({
  baseURL: 'https://vegledger-api.onrender.com/api',
});

export default api;