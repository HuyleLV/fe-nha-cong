import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ====== Helper lấy token chung ======
function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // Ưu tiên: admin -> khách hàng
  const adminToken = localStorage.getItem("tokenAdmin");
  const userToken = localStorage.getItem("access_token") || localStorage.getItem("tokenUser");

  return adminToken || userToken || null;
}

// ====== REQUEST Interceptor ======
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
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
    console.error("[API ERROR]", error?.response || error.message);

    // Nếu token hết hạn, bạn có thể xử lý refresh hoặc logout
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        // auto logout cả 2 loại người dùng
        localStorage.removeItem("tokenAdmin");
        localStorage.removeItem("access_token");
        localStorage.removeItem("tokenUser");
      }
      // Option: điều hướng về login
      // window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
