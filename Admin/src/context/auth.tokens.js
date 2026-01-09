// Admin access token - stored in memory only (not localStorage)
let adminAccessToken = null;

// Lawyer access token - stored in memory only (not localStorage)
let lawyerAccessToken = null;

// Admin token management
export const setAdminAccessToken = (token) => {
  adminAccessToken = token;
};

export const getAdminAccessToken = () => {
  return adminAccessToken;
};

export const clearAdminAuth = () => {
  adminAccessToken = null;
};

// Lawyer token management
export const setLawyerAccessToken = (token) => {
  lawyerAccessToken = token;
};

export const getLawyerAccessToken = () => {
  return lawyerAccessToken;
};

export const clearLawyerAuth = () => {
  lawyerAccessToken = null;
};

// Clear all auth tokens
export const clearAllAuth = () => {
  adminAccessToken = null;
  lawyerAccessToken = null;
};
