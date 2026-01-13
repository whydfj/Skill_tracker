import api from "./api";

export const commentsAPI = {
  addComment: async (taskId, text, attachedFile = null) => {
    const response = await api.post("/add_new_comment", {
      task_id: taskId,
      text,
      attached_file: attachedFile,
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete("/delete_comment", {
      data: { comment_id: commentId },
    });
    return response.data;
  },
};
