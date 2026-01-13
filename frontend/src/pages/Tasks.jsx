import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { tasksAPI } from "../api/tasks";
import { commentsAPI } from "../api/comments";
import Modal from "../components/Modal";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (taskTitle, progress) => {
    try {
      await tasksAPI.updateProgress(taskTitle, progress);
      await loadTasks();
      alert("Прогресс обновлен!");
    } catch (error) {
      alert("Ошибка обновления прогресса: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;

    try {
      await commentsAPI.addComment(selectedTask.id, commentText);
      setIsCommentModalOpen(false);
      setCommentText("");
      await loadTasks();
      alert("Комментарий добавлен!");
    } catch (error) {
      alert("Ошибка добавления комментария: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Удалить комментарий?")) return;

    try {
      await commentsAPI.deleteComment(commentId);
      await loadTasks();
      alert("Комментарий удален!");
    } catch (error) {
      alert("Ошибка удаления комментария: " + (error.response?.data?.detail || error.message));
    }
  };

  const openCommentModal = (task) => {
    setSelectedTask(task);
    setProgressValue(task.progress || 0);
    setIsCommentModalOpen(true);
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusBadge = (status) => {
    const badges = {
      running: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      frozen: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка задач...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold gradient-text mb-2">Мои задачи</h2>
            <p className="text-gray-600">Управление вашими задачами</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg">
            <span className="text-2xl font-bold">{tasks.length}</span>
            <span className="text-blue-100 ml-2">задач</span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-xl font-medium">Нет активных задач</p>
            <p className="text-gray-400 mt-2">Новые задачи появятся здесь</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${getStatusBadge(task.status)}`}>
                    {task.status === "running" ? "В работе" : task.status === "completed" ? "Завершено" : "Заморожено"}
                  </span>
                </div>

                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Прогресс выполнения</span>
                    <span className="text-lg font-bold gradient-text">{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-4 shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 shadow-sm ${getProgressColor(task.progress || 0)}`}
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Дедлайн</span>
                    <span className="font-semibold text-gray-800">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Не установлен"}
                    </span>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Создано</span>
                    <span className="font-semibold text-gray-800">
                      {task.created_at
                        ? new Date(task.created_at).toLocaleDateString("ru-RU")
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-blue-100 pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Обновить прогресс (0-100%)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.progress || 0}
                          onChange={(e) => {
                            const newProgress = parseInt(e.target.value) || 0;
                            const updatedTasks = tasks.map((t) =>
                              t.id === task.id ? { ...t, progress: newProgress } : t
                            );
                            setTasks(updatedTasks);
                          }}
                          className="flex-1 input-field"
                        />
                        <button
                          onClick={() => handleUpdateProgress(task.title, task.progress || 0)}
                          className="btn-primary px-6"
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => openCommentModal(task)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium self-end"
                    >
                      💬 Комментарии
                    </button>
                  </div>
                </div>

                {task.comments && task.comments.length > 0 && (
                  <div className="mt-6 border-t-2 border-blue-100 pt-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>💬</span>
                      <span>Комментарии ({task.comments.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {task.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl flex justify-between items-start border border-blue-100"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(comment.user?.name || comment.user?.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {comment.user?.name || comment.user?.username || "Пользователь"}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 ml-10">{comment.text}</div>
                            <div className="text-xs text-gray-400 mt-2 ml-10">
                              {comment.created_at
                                ? new Date(comment.created_at).toLocaleString("ru-RU")
                                : ""}
                            </div>
                          </div>
                          {comment.user_id === user?.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-800 text-sm ml-2 font-medium"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setCommentText("");
          setSelectedTask(null);
        }}
        title={`Комментарий к задаче: ${selectedTask?.title}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текст комментария
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="4"
              className="input-field"
              placeholder="Введите комментарий..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCommentModalOpen(false);
                setCommentText("");
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Добавить
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}