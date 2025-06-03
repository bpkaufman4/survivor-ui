let apiUrl = (process.env.NODE_ENV === 'development') ? 'http://localhost:3001/' : 'somethingelse';

export default apiUrl;