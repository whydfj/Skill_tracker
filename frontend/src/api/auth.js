import api from "./api";

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/get_current_user");
    return response.data;
  },
};
