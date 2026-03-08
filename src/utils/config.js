const API_URL = import.meta.env.PROD
  ? '/api'
  : 'https://chatbot-backend-5-g34m.onrender.com/api';

export const SERVER_URL = import.meta.env.PROD
  ? ''
  : 'https://chatbot-backend-5-g34m.onrender.com/';

export default API_URL;
