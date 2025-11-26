import { boot } from 'quasar/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import authManager from 'src/services/auth-manager';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// ✅ OPRAVA - pridaný /api suffix
const api = axios.create({
  baseURL: process.env.API_URL ?? 'http://localhost:3333/api', // ← /api pridané
  withCredentials: false, // ✅ Zmeň na false (nepoužívame cookies, len Bearer token)
  headers: {
    'Content-Type': 'application/json', // ✅ Pridaj default content-type
  },
});

const DEBUG = process.env.NODE_ENV === 'development';

// Add interceptor to add authorization header for api calls
api.interceptors.request.use(
  (config) => {
    const token = authManager.getToken();

    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (DEBUG) {
      console.info('→ ', config.method?.toUpperCase(), config.url, config.data); // ✅ Lepší log
    }

    return config;
  },
  (error) => {
    if (DEBUG) {
      console.error('→ ', error);
    }

    return Promise.reject(error);
  },
);

// Add interceptor for response to trigger logout
api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.info('← ', response.status, response.config.url, response.data); // ✅ Lepší log
    }

    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error('← ', error.response?.status, error.response?.config?.url, error.response?.data ?? error);
    }

    // Server API request returned unauthorized response so we trigger logout
    const status = error?.response?.status;
    const cfg = error?.response?.config;

    if (status === 401 && !(cfg && cfg.dontTriggerLogout)) {
      authManager.logout();
    }

    return Promise.reject(error);
  },
);

export default boot(({ app }) => {
  // For use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
