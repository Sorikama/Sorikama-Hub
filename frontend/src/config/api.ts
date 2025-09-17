// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000, // 10 secondes
  AUTH_STORAGE_KEY: {
    TOKEN: 'WebRichesse_token',
    REFRESH_TOKEN: 'WebRichesse_refresh_token',
    USER: 'WebRichesse_user',
    STORES: 'WebRichesse_stores',
    SELECTED_STORE: 'WebRichesse_selected_store'
  }
};

export default API_CONFIG;
