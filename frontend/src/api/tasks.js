import api from "./api";

export const tasksAPI = {
  // Для обычных пользователей
  getMyTasks: async () => {
    const response = await api.get("/get_my_tasks");
    return response.data;
  },

  updateProgress: async (taskTitle, progress) => {
    const response = await api.patch(`/tasks/0/progress`, {
      task_title: taskTitle,
      progress,
    });
    return response.data;
  },

  // Для менеджеров/админов
  addTask: async (username, title, description, deadline) => {
    const response = await api.post("/add_task", {
      username,
      title,
      description,
      deadline: deadline || null,
    });
    return response.data;
  },

  editTask: async (username, title, newTitle, newDescription) => {
    const response = await api.patch("/set_task", {
      username,
      title,
      new_title: newTitle,
      new_description: newDescription,
    });
    return response.data;
  },

  deleteTask: async (username, title) => {
    const response = await api.delete("/delete_task", {
      data: { username, title },
    });
    return response.data;
  },

  getUserTasks: async (username) => {
    const response = await api.get(`/get_user_tasks/${username}`);
    return response.data;
  },

  getAllTasks: async () => {
    const response = await api.get("/get_all_tasks");
    return response.data;
  },

  updateDeadline: async (taskId, newDeadline) => {
    const response = await api.patch("/update_deadline", {
      task_id: taskId,
      new_deadline: newDeadline,
    });
    return response.data;
  },
};
