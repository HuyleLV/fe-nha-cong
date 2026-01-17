import axios from "axios";

// Keep baseURL exactly as provided in env; services will compose absolute URLs
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    "Content-Type": "application/json",
  },
  // client-side request timeout (ms) to avoid long-hanging requests
  timeout: 10000,
});

// ====== Helper lấy token theo endpoint ======
function resolvePath(configUrl?: string, baseURL?: string) {
  try {
    // configUrl có thể là tuyệt đối hoặc tương đối; baseURL đến từ instance
    const u = baseURL ? new URL(configUrl || "", baseURL) : new URL(configUrl || "", "http://x");
    return u.pathname || "";
  } catch {
    return configUrl || "";
  }
}

function pickTokenForRequest(pathname: string, method?: string): string | null {
  if (typeof window === "undefined") return null;
  const adminToken = localStorage.getItem("tokenAdmin");
  const userToken = localStorage.getItem("access_token") || localStorage.getItem("tokenUser");

  function isExpired(token?: string | null) {
    if (!token) return false;
    try {
      const [, payload] = token.split('.');
      if (!payload) return false;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (json.exp && typeof json.exp === 'number') {
        return Date.now() / 1000 > json.exp;
      }
      return false;
    } catch {
      return false;
    }
  }

  const p = pathname || "";
  const m = (method || "get").toLowerCase();

  // Nhận diện endpoint quản trị rõ ràng
  const isAdminEndpoint = /\/viewings\/admin(\b|\/)/.test(p) || /\b\/admin(\b|\/)/.test(p);

  // Một số hành động write trên tài nguyên nhạy cảm (có thể là admin/partner)
  const isPotentialAdminWrite = (m === 'post' || m === 'patch' || m === 'put' || m === 'delete') && /\/apartments(\b|\/)/.test(p) && !/home-sections/.test(p);

  const isAdminUI = (typeof window !== 'undefined') && (window.location.pathname || '').startsWith('/admin');

  const isHostUI = (typeof window !== 'undefined') && (window.location.pathname || '').startsWith('/quan-ly-chu-nha');

  // --- Special: public apartment endpoints should behave like anonymous on public UI pages
  // When visiting the public site (not /admin and not /quan-ly-chu-nha), avoid sending any token
  // for GET requests to apartment listing endpoints so that hosts (who also have user tokens)
  // don't receive host-scoped results (created_by restriction). This ensures all viewers
  // on the public pages see the same items.
  const isPublicApartmentGet = m === 'get' && /^\/api\/apartments(\/|$)/.test(p);
  const isPublicUI = (typeof window !== 'undefined') && !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/quan-ly-chu-nha');
  if (isPublicApartmentGet && isPublicUI) {
    return null;
  }

  // If tokens are expired locally, clear them and don't return them
  try {
    if (isExpired(adminToken)) {
      localStorage.removeItem('tokenAdmin');
      localStorage.removeItem('adminInfo');
    }
    if (isExpired(userToken)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('tokenUser');
      localStorage.removeItem('auth_user');
    }
  } catch { }

  if (isAdminEndpoint || isPotentialAdminWrite || isAdminUI) {
    // Admin endpoint or admin UI → ưu tiên token admin
    return (adminToken && !isExpired(adminToken) ? adminToken : (userToken && !isExpired(userToken) ? userToken : null)) || null;
  }

  // If we're in the host UI, prefer the user token and don't fall back to admin.
  if (isHostUI) return userToken || null;

  // Endpoint phía người dùng → ưu tiên token người dùng để không "đè" bằng admin
  return (userToken && !isExpired(userToken) ? userToken : (adminToken && !isExpired(adminToken) ? adminToken : null)) || null;
}

// ====== REQUEST Interceptor ======
axiosClient.interceptors.request.use(
  (config) => {
    const path = resolvePath(config.url as any, (config as any).baseURL || axiosClient.defaults.baseURL);
    const token = pickTokenForRequest(path, config.method);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu bạn muốn hỗ trợ cookie-based auth (trong SSR)
    // Always send credentials (cookies) so cookie-based auth works in browser and SSR.
    // The server must allow credentials (Access-Control-Allow-Credentials) for CORS.
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error)
);

// ====== RESPONSE Interceptor ======
let logoutNotified = false; // tránh hiện toast nhiều lần cho loạt request 401
axiosClient.interceptors.response.use(
  (response) => {
    // Handle backend returning an OK status but with a payload indicating JWT expired,
    // example: { success: true, data: { message: 'jwt expired' }, meta: {} }
    try {
      const d = response?.data;
      const raw = (d && (d.message || (d.data && d.data.message))) || '';
      const msg = String(raw);
      const low = msg.toLowerCase();
      const isExpired = low.includes('jwt expired') || low.includes('phiên đăng nhập đã hết hạn') || low.includes('token expired');
      const isInvalid = low.includes('invalid signature') || low.includes('jwt malformed') || low.includes('token không hợp lệ');
      if (isExpired || isInvalid) {
        // perform logout + notify
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('tokenUser');
          localStorage.removeItem('tokenAdmin');
          localStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_user');
          sessionStorage.removeItem('access_token');
          try { localStorage.setItem('auth_logout', String(Date.now())); } catch { }
          try { document.cookie = 'access_token=; Max-Age=0; Path=/; SameSite=Lax'; } catch { }
          try { document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch { }
        } catch { }

        try {
          const { toast } = require('react-toastify');
          toast.info(isExpired ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Token không hợp lệ. Vui lòng đăng nhập lại.');
        } catch { }

        // redirect to login (preserve admin path if applicable)
        if (typeof window !== 'undefined') {
          const isAdminUI = window.location.pathname.startsWith('/admin');
          const loginPath = isAdminUI ? '/dang-nhap?role=admin' : '/dang-nhap';
          // small debounce to avoid navigation loops
          const FLAG = 'auth_logout_inflight';
          const last = Number(sessionStorage.getItem(FLAG) || 0);
          const now = Date.now();
          if (!last || now - last > 1500) {
            sessionStorage.setItem(FLAG, String(now));
            window.location.href = loginPath;
          }
        }

        return Promise.reject(new Error(isExpired ? 'jwt expired' : 'invalid token'));
      }
    } catch (e) {
      // ignore parsing errors and continue
    }
    return response.data ?? response;
  },
  (error) => {
    const status = error?.response?.status;

    const respData = error?.response?.data || {};
    const lowMsg = String(respData.message || '').toLowerCase();
    const unauthorizedByBody = respData && (String(respData.error || '').toLowerCase() === 'unauthorized' && lowMsg.includes('no auth token'));
    const jwtExpiredByBody = respData && (lowMsg.includes('jwt expired') || lowMsg.includes('phiên đăng nhập đã hết hạn') || lowMsg.includes('token expired'));
    const invalidTokenByBody = respData && (lowMsg.includes('invalid signature') || lowMsg.includes('jwt malformed') || lowMsg.includes('token không hợp lệ'));

    if ((status === 401 || unauthorizedByBody || jwtExpiredByBody || invalidTokenByBody) && typeof window !== 'undefined') {
      // Chỉ thông báo nếu trước đó có token => nghĩa là phiên đã từng đăng nhập
      const hadToken = !!(
        localStorage.getItem('access_token') ||
        localStorage.getItem('tokenUser') ||
        localStorage.getItem('tokenAdmin') ||
        document.cookie.includes('auth_user=')
      );

      const cfg = error?.config || {};
      const path = resolvePath(cfg.url, cfg.baseURL || axiosClient.defaults.baseURL);
      const isAdminEndpoint = /\/viewings\/admin(\b|\/)/.test(path) || /\b\/admin(\b|\/)/.test(path);

      // Clear tokens
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('tokenUser');
        localStorage.removeItem('tokenAdmin');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('access_token');
        try { localStorage.setItem('auth_logout', String(Date.now())); } catch { }
        try { document.cookie = 'access_token=; Max-Age=0; Path=/; SameSite=Lax'; } catch { }
        try { document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch { }
      } catch { }

      if (hadToken) {
        if (!logoutNotified) {
          logoutNotified = true;
          try {
            const { toast } = require('react-toastify');
            toast.info(jwtExpiredByBody ? 'Phiên đăng nhập đã hết hạn' : 'Vui lòng đăng nhập lại');
          } catch { }
          setTimeout(() => { logoutNotified = false; }, 5000);
        }

        const atLogin = window.location.pathname.includes('/dang-nhap');
        const loginPath = isAdminEndpoint ? '/dang-nhap?role=admin' : '/dang-nhap';

        if (!atLogin) {
          const FLAG = 'auth_logout_inflight';
          const last = Number(sessionStorage.getItem(FLAG) || 0);
          const now = Date.now();
          if (!last || now - last > 1500) {
            sessionStorage.setItem(FLAG, String(now));

            // Handle callbackUrl
            const currentUrl = window.location.pathname + window.location.search;
            const callbackParam = encodeURIComponent(currentUrl);
            // Append to existing query params if any
            const separator = loginPath.includes('?') ? '&' : '?';
            window.location.href = `${loginPath}${separator}callbackUrl=${callbackParam}`;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
