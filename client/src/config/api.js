// API URL - uses environment variable in production, empty for same-domain deployment
// In local development, Vite handles .env.local via VITE_ prefix
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
