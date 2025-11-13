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

  if (isAdminEndpoint || isPotentialAdminWrite) {
    // Admin endpoint → ưu tiên token admin
    return adminToken || userToken || null;
  }

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
    return response.data ?? response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
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

      // Xoá token theo scope
      try {
        if (isAdminEndpoint) {
          localStorage.removeItem('tokenAdmin');
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('tokenUser');
        }
        document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      } catch {}

      // Hiện toast một lần
      if (hadToken && !logoutNotified) {
        logoutNotified = true;
        try {
          const { toast } = require('react-toastify');
          toast.info('Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại!');
        } catch {}
        // Reset cờ sau 5s để nếu người dùng đăng nhập lại rồi lại hết hạn sau này vẫn hiện được
        setTimeout(() => { logoutNotified = false; }, 5000);
      }

      // Redirect nếu chưa ở trang login
      const atLogin = window.location.pathname.includes('/dang-nhap');
      const loginPath = isAdminEndpoint ? '/dang-nhap?role=admin' : '/dang-nhap';
      if (!atLogin) {
        // Chặn vòng lặp nhanh nhiều redirect
        const FLAG = 'auth_logout_inflight';
        const last = Number(sessionStorage.getItem(FLAG) || 0);
        const now = Date.now();
        if (!last || now - last > 1500) {
          sessionStorage.setItem(FLAG, String(now));
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
