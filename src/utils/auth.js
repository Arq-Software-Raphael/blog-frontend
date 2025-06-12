export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};
