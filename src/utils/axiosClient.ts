import axios from "axios";

// Keep baseURL exactly as provided in env; services will compose absolute URLs
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

  const p = pathname || "";
  const m = (method || "get").toLowerCase();

  // Nhận diện endpoint quản trị rõ ràng
  const isAdminEndpoint = /\/viewings\/admin(\b|\/)/.test(p) || /\b\/admin(\b|\/)/.test(p);

  // Một số hành động write trên tài nguyên nhạy cảm (có thể là admin/partner)
  const isPotentialAdminWrite = (m === 'post' || m === 'patch' || m === 'put' || m === 'delete') && /\/apartments(\b|\/)/.test(p) && !/home-sections/.test(p);

  // If the current browser page is an admin UI route, prefer admin token so
  // admin UI requests are not accidentally sent with a host/user token.
  // This is important because GET /apartments is a shared endpoint and the
  // backend will restrict results to the caller when a host token is used.
  const isAdminUI = (typeof window !== 'undefined') && (window.location.pathname || '').startsWith('/admin');

  // Host UI detection: pages under /quan-ly-chu-nha are host management pages.
  // When on host UI, prefer the user/host token and DO NOT fall back to admin
  // token. This prevents the situation where an admin token present in
  // localStorage causes host pages to receive admin-scoped data.
  const isHostUI = (typeof window !== 'undefined') && (window.location.pathname || '').startsWith('/quan-ly-chu-nha');

  if (isAdminEndpoint || isPotentialAdminWrite || isAdminUI) {
    // Admin endpoint or admin UI → ưu tiên token admin
    return adminToken || userToken || null;
  }

  // If we're in the host UI, prefer the user token and don't fall back to admin.
  if (isHostUI) return userToken || null;

  // Endpoint phía người dùng → ưu tiên token người dùng để không "đè" bằng admin
  return userToken || adminToken || null;
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
    if (typeof window === "undefined") {
      config.withCredentials = true;
    }

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
      const msg = (d && (d.message || (d.data && d.data.message))) || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('jwt expired')) {
        // perform logout + notify
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('tokenUser');
          localStorage.removeItem('tokenAdmin');
          localStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_user');
          sessionStorage.removeItem('access_token');
          try { localStorage.setItem('auth_logout', String(Date.now())); } catch {}
          try { document.cookie = 'access_token=; Max-Age=0; Path=/; SameSite=Lax'; } catch {}
          try { document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
        } catch {}

        try {
          const { toast } = require('react-toastify');
          toast.info('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } catch {}

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

        return Promise.reject(new Error('jwt expired'));
      }
    } catch (e) {
      // ignore parsing errors and continue
    }
    return response.data ?? response;
  },
  (error) => {
    const status = error?.response?.status;

    const respData = error?.response?.data || {};
    const unauthorizedByBody = respData && (String(respData.error || '').toLowerCase() === 'unauthorized' && String(respData.message || '').toLowerCase().includes('no auth token'));
    const jwtExpiredByBody = respData && String(respData.message || '').toLowerCase().includes('jwt expired');

    if ((status === 401 || unauthorizedByBody || jwtExpiredByBody) && typeof window !== 'undefined') {
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
      const method = String(cfg.method || 'get').toLowerCase();

      // Xoá token (loại bỏ tất cả token liên quan) và thông báo cho các tab khác
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('tokenUser');
        localStorage.removeItem('tokenAdmin');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('access_token');
        // set a logout flag so other tabs can react
        try { localStorage.setItem('auth_logout', String(Date.now())); } catch {}
        // clear common cookies
        try { document.cookie = 'access_token=; Max-Age=0; Path=/; SameSite=Lax'; } catch {}
        try { document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
      } catch {}

      // Thông báo + chuyển trang khi token hết hạn (áp dụng cho GET và các method khác)
      if (hadToken) {
        if (!logoutNotified) {
          logoutNotified = true;
          try {
            const { toast } = require('react-toastify');
            toast.info('Phiên đăng nhập đã hết hạn');
          } catch {}
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
            window.location.href = loginPath;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
