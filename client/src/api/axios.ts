import axios, { type AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({ baseURL: BASE_URL });
export const apiPrivate = axios.create({ baseURL: BASE_URL });

apiPrivate.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One refresh at a time: parallel requests (polling) share the same in-flight refresh.
let refreshing: Promise<string> | null = null;

const refreshAccessToken = () => {
  refreshing ??= apiClient
    .post('/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') })
    .then(res => {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      return res.data.accessToken as string;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

apiPrivate.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const request = error.config as (typeof error.config & { retried?: boolean }) | undefined;
    if (error.response?.status === 401 && request && !request.retried && localStorage.getItem('refreshToken')) {
      request.retried = true;
      try {
        const token = await refreshAccessToken();
        request.headers.Authorization = `Bearer ${token}`;
        return apiPrivate(request);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

/** Human-readable message from an API error. */
export const errorMessage = (error: unknown, fallback = 'Something went wrong') => {
  const data = (error as AxiosError<{ message?: string }>)?.response?.data;
  if (data && typeof data === 'object' && data.message) return data.message;
  if ((error as AxiosError)?.code === 'ERR_NETWORK') return 'Cannot reach the server';
  return fallback;
};
