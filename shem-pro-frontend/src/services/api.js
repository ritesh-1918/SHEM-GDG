import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;

      // Demo Mode Mock Adapter
      // Don't mock ESP32 data endpoint so we can see real data
      if (token === 'demo-token-bypass' && !config.url?.includes('esp32data')) {
        config.adapter = async (config) => {
          return new Promise((resolve) => {
            const mockData = {
              voltage: 230 + Math.random() * 5,
              current: 5 + Math.random() * 2,
              power: 1200 + Math.random() * 100,
              energy: 500 + Math.random() * 10,
              frequency: 50 + Math.random() * 0.1,
              powerFactor: 0.9 + Math.random() * 0.05,
              timestamp: new Date().toISOString()
            };

            // Handle different endpoints if needed
            let data = mockData;
            if (config.url?.includes('/history')) {
              data = Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                value: Math.random() * 1000
              }));
            }

            resolve({
              data: data,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
              request: {}
            });
          });
        };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("API 401 Unauthorized. Token might be invalid for backend, but keeping session alive to prevent loop.");
      // CRITICAL FIX: Do NOT redirect to login here. It causes a loop if backend & frontend auth differ.
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getLiveSensorData = async () => api.get('/data/live');
export const getHistoryData = async () => api.get('/data/history');
export const getSevenDayHistoryData = async () => api.get('/data/history/7day');
export const getEsp32LatestData = async () => {
  try {
    const response = await api.get('/esp32data');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export default api;