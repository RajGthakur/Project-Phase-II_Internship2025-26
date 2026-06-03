import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getAvailableRides = () => api.get('/rides');
export const createRide = (rideData) => api.post('/rides', rideData);
export const getRidesByDriver = (driverId) => api.get(`/rides/driver/${driverId}`);

export default api;
