import api from "./api";

export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get("/found/show_all");
    return response.data;
  },

  findUser: async (username) => {
    const response = await api.post("/found", { username });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/create_user", userData);
    return response.data;
  },

  deleteUser: async (username) => {
    const response = await api.delete("/found/delete", {
      data: { username },
    });
    return response.data;
  },
};
