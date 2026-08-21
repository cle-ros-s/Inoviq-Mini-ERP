const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest(endpoint, options = {}) {
  let token = localStorage.getItem('sfw:token') || sessionStorage.getItem('sfw:token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    // If 401 Unauthorized or Token Expired
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshToken = localStorage.getItem('sfw:refreshToken') || sessionStorage.getItem('sfw:refreshToken');
      
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(newToken => {
            return fetch(url, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`
              }
            }).then(r => r.json());
          });
        }

        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.data?.accessToken) {
            const newToken = refreshData.data.accessToken;
            const newRefresh = refreshData.data.refreshToken || refreshToken;
            localStorage.setItem('sfw:token', newToken);
            sessionStorage.setItem('sfw:token', newToken);
            localStorage.setItem('sfw:refreshToken', newRefresh);
            sessionStorage.setItem('sfw:refreshToken', newRefresh);

            processQueue(null, newToken);

            // Retry original request
            const retryRes = await fetch(url, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`
              }
            });
            return await retryRes.json();
          } else {
            throw new Error('Refresh token invalid');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          // Clear stale tokens
          localStorage.removeItem('sfw:token');
          sessionStorage.removeItem('sfw:token');
          localStorage.removeItem('sfw:refreshToken');
          sessionStorage.removeItem('sfw:refreshToken');
          localStorage.removeItem('sfw:session');
          sessionStorage.removeItem('sfw:session');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw refreshErr;
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available, redirect to login cleanly
        localStorage.removeItem('sfw:token');
        sessionStorage.removeItem('sfw:token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.message || 'Request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, options) => apiRequest(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};
