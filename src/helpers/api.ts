const API_ENDPOINTS = {
  // Authentication
  USER_REGISTER: "auth/register",
  USER_VERIFY_OTP: "auth/verify-otp",
  USER_RESEND_OTP: "auth/resend-otp",
  USER_LOGIN: "auth/login",
  USER_LOGOUT: "auth/logout",
  USER_REFRESH_TOKEN: "auth/refresh-token",
  USER_FORGOT_PASSWORD: "auth/forgot-password",
  USER_RESET_PASSWORD: "auth/reset-password",
  USER_PROFILE: "auth/me",

  // Users Management
  USER_GET_ALL: "user",
  USER_GET_PUBLIC_SELLERS: "user/public-sellers",
  USER_DETAIL: "user/:id",
  USER_CREATE: "user",
  USER_UPDATE: "user/:id",
  USER_DELETE: "user/:id",
  USER_REPORT: "user/report/:id",

  // Products - User
  PRODUCT_CREATE: "product",
  PRODUCT_UPDATE: "product",
  PRODUCT_DELETE: "product",

  // Products - Public
  PRODUCT_GET_VALIDATED: "product",
  PRODUCT_GET_BY_ID: "product",
  PRODUCT_GET_HOME: "product/home",

  // Categories
  CATEGORY_GET_ALL: "category",
  CATEGORY_GET_BY_ID: "category",
  CATEGORY_CREATE: "category",
  CATEGORY_UPDATE: "category",
  CATEGORY_DELETE: "category",

  // Cities
  CITY_GET_ALL: "city",
  CITY_GET_BY_ID: "city",
  CITY_CREATE: "city",
  CITY_UPDATE: "city",
  CITY_DELETE: "city",

  // Favorites
  FAVORITE_GET_ALL: "favorite",
  FAVORITE_ADD: "favorite/add",
  FAVORITE_REMOVE: "favorite/remove",

  // Reviews
  REVIEW_GET_ALL: "review",
  REVIEW_GET_BY_ID: "review",
  REVIEW_GET_SELLER: "review/seller",
  REVIEW_GET_MY: "review/my-reviews",
  REVIEW_CREATE: "review",
  REVIEW_UPDATE: "review",
  REVIEW_DELETE: "review",

  // Notifications
  NOTIFICATION_GET_ALL: "notification",
  NOTIFICATION_READ: "notification/:id/read",
  NOTIFICATION_MARK_ALL_READ: "notification/mark-all-read",
} as const;

export default API_ENDPOINTS;
