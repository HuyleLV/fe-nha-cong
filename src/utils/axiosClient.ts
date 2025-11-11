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
        try {
          const cfg = error?.config || {};
          const path = resolvePath(cfg.url, cfg.baseURL || axiosClient.defaults.baseURL);
          const isAdminEndpoint = /\/viewings\/admin(\b|\/)/.test(path) || /\b\/admin(\b|\/)/.test(path);
          if (isAdminEndpoint) {
            localStorage.removeItem("tokenAdmin");
          } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("tokenUser");
          }
        } catch {
          // Fallback: không xoá gì thêm
        }
      }
      // Option: điều hướng về login
      // window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
