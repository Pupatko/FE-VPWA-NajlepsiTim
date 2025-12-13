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

// api client with /api base path
const api = axios.create({
  baseURL: process.env.API_URL ?? 'http://localhost:3333/api', // include api prefix
  withCredentials: false, // use bearer token instead of cookies
  headers: {
    'Content-Type': 'application/json', // default json content type
  },
});

const DEBUG = process.env.NODE_ENV === 'development';

// add authorization header
api.interceptors.request.use(
  (config) => {
    const token = authManager.getToken();

    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (DEBUG) {
      console.info('-> ', config.method?.toUpperCase(), config.url, config.data); // dev log
    }

    return config;
  },
  (error) => {
    if (DEBUG) {
      console.error('-> ', error.response?.status, error.response?.config?.url, error.response?.data ?? error);
    }

    return Promise.reject(error);
  },
);

// log responses and handle unauthorized
api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.info('-> ', response.status, response.config.url, response.data); // dev log
    }

    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error('-> ', error.response?.status, error.response?.config?.url, error.response?.data ?? error);
    }

    // logout when api says unauthorized
    const status = error?.response?.status;
    const cfg = error?.response?.config;

    if (status === 401 && !(cfg && cfg.dontTriggerLogout)) {
      authManager.logout();
    }

    return Promise.reject(error);
  },
);

export default boot(({ app }) => {
  // expose axios instances to vue components
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };

