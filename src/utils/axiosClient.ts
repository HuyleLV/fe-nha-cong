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
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data luôn cho tiện
    return response.data ?? response;
  },
  (error) => {
    // Log lỗi chi tiết
    // console.error("[API ERROR]", error?.response || error.message);

    // Nếu token hết hạn, bạn có thể xử lý refresh hoặc logout
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        const safeLogout = () => {
          try {
            const cfg = error?.config || {};
            const path = resolvePath(cfg.url, cfg.baseURL || axiosClient.defaults.baseURL);
            // Regex sửa: (\b|/) không cần escape thêm slash trong character group
            const isAdminEndpoint = /\/viewings\/admin(\b|\/)/.test(path) || /\b\/admin(\b|\/)/.test(path);

            // Xoá token theo scope
            if (isAdminEndpoint) {
              localStorage.removeItem("tokenAdmin");
            } else {
              localStorage.removeItem("access_token");
              localStorage.removeItem("tokenUser");
            }
            // Dọn cookie auth_user nếu có
            document.cookie = "auth_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

            // Chặn vòng lặp redirect: flag trong sessionStorage 3s
            const FLAG = "auth_logout_inflight";
            const last = Number(sessionStorage.getItem(FLAG) || 0);
            const now = Date.now();
            if (!last || now - last > 3000) {
              sessionStorage.setItem(FLAG, String(now));
              const loginPath = isAdminEndpoint ? "/dang-nhap?role=admin" : "/dang-nhap";
              const atLogin = window.location.pathname.includes('/dang-nhap');
              if (!atLogin) window.location.href = loginPath;
            }
          } catch (e) {
            // Nuốt lỗi an toàn
            console.warn('[AUTH LOGOUT ERROR]', e);
          }
        };
        safeLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
