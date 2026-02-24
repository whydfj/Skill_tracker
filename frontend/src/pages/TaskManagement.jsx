import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { tasksAPI } from "../api/tasks";
import { usersAPI } from "../api/users";
import { aiAPI } from "../api/ai";
import Modal from "../components/Modal";

export default function TaskManagement() {
  const { user, isManager } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [filterUser, setFilterUser] = useState("all");

  // Форма создания задачи
  const [newTask, setNewTask] = useState({
    username: "",
    title: "",
    description: "",
    deadline: "",
  });

  // Форма редактирования задачи
  const [editTask, setEditTask] = useState({
    username: "",
    title: "",
    newTitle: "",
    newDescription: "",
  });

  // Форма дедлайна
  const [deadlineData, setDeadlineData] = useState({
    taskId: null,
    newDeadline: "",
  });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isManager()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        tasksAPI.getAllTasks(),
        usersAPI.getAllUsers(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      alert("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.username || !newTask.title || !newTask.description) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      await tasksAPI.addTask(
        newTask.username,
        newTask.title,
        newTask.description,
        newTask.deadline ? new Date(newTask.deadline).toISOString() : null
      );
      setIsCreateModalOpen(false);
      setNewTask({ username: "", title: "", description: "", deadline: "" });
      await loadData();
      alert("Задача успешно создана!");
    } catch (error) {
      alert("Ошибка создания задачи: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleSuggestDescription = async () => {
    if (!newTask.username || !newTask.title) {
      alert("Сначала выберите пользователя и введите название задачи");
      return;
    }

    try {
      setAiLoading(true);
      const data = await aiAPI.suggestTaskDescription({
        username: newTask.username,
        title: newTask.title,
        draft_description: newTask.description || "",
      });
      const suggested = data?.suggested_description || "";
      if (!suggested) {
        alert("AI не смог сгенерировать описание. Попробуйте позже.");
        return;
      }

      setNewTask((prev) => ({
        ...prev,
        description: prev.description
          ? `${prev.description}\n\n${suggested}`
          : suggested,
      }));
    } catch (error) {
      alert(
        "Ошибка работы AI-помощника: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTask.username || !editTask.title || !editTask.newTitle || !editTask.newDescription) {
      alert("Заполните все поля");
      return;
    }

    try {
      await tasksAPI.editTask(
        editTask.username,
        editTask.title,
        editTask.newTitle,
        editTask.newDescription
      );
      setIsEditModalOpen(false);
      setEditTask({ username: "", title: "", newTitle: "", newDescription: "" });
      await loadData();
      alert("Задача успешно обновлена!");
    } catch (error) {
      alert("Ошибка обновления задачи: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteTask = async (username, title) => {
    if (!confirm(`Удалить задачу "${title}" у пользователя ${username}?`)) return;

    try {
      await tasksAPI.deleteTask(username, title);
      await loadData();
      alert("Задача успешно удалена!");
    } catch (error) {
      alert("Ошибка удаления задачи: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateDeadline = async () => {
    if (!deadlineData.taskId || !deadlineData.newDeadline) {
      alert("Выберите задачу и установите дедлайн");
      return;
    }

    try {
      await tasksAPI.updateDeadline(
        deadlineData.taskId,
        new Date(deadlineData.newDeadline).toISOString()
      );
      setIsDeadlineModalOpen(false);
      setDeadlineData({ taskId: null, newDeadline: "" });
      await loadData();
      alert("Дедлайн успешно обновлен!");
    } catch (error) {
      alert("Ошибка обновления дедлайна: " + (error.response?.data?.detail || error.message));
    }
  };

  const openEditModal = (task) => {
    setEditTask({
      username: users.find((u) => u.id === task.employee_id)?.username || "",
      title: task.title,
      newTitle: task.title,
      newDescription: task.description,
    });
    setIsEditModalOpen(true);
  };

  const openDeadlineModal = (task) => {
    setDeadlineData({
      taskId: task.id,
      newDeadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : "",
    });
    setIsDeadlineModalOpen(true);
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

  const filteredTasks =
    filterUser === "all"
      ? tasks
      : tasks.filter((task) => {
          const taskUser = users.find((u) => u.id === task.employee_id);
          return taskUser?.username === filterUser;
        });

  if (!isManager()) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          У вас нет доступа к этой странице
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold gradient-text mb-2">Управление задачами</h2>
            <p className="text-gray-600">Создание и управление задачами сотрудников</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            + Создать задачу
          </button>
        </div>

        <div className="card p-5 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex gap-4 items-center">
            <label className="font-semibold text-gray-700">Фильтр по пользователю:</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="flex-1 input-field max-w-xs"
            >
              <option value="all">Все пользователи</option>
              {users.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.name} {u.surname} ({u.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredTasks.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-xl font-medium">Нет задач</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const taskUser = users.find((u) => u.id === task.employee_id);
              return (
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
                      <div className="bg-blue-50 p-3 rounded-lg inline-block">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">👤 Исполнитель: </span>
                          {taskUser
                            ? `${taskUser.name} ${taskUser.surname} (${taskUser.username})`
                            : "Неизвестно"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${getStatusBadge(task.status)}`}
                    >
                      {task.status === "running"
                        ? "В работе"
                        : task.status === "completed"
                        ? "Завершено"
                        : "Заморожено"}
                    </span>
                  </div>

                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Прогресс выполнения</span>
                      <span className="text-lg font-bold gradient-text">
                        {task.progress || 0}%
                      </span>
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

                  <div className="flex gap-3 border-t-2 border-blue-100 pt-6">
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      onClick={() => openDeadlineModal(task)}
                      className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      📅 Дедлайн
                    </button>
                    <button
                      onClick={() => handleDeleteTask(taskUser?.username || "", task.title)}
                      className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Модальное окно создания задачи */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewTask({ username: "", title: "", description: "", deadline: "" });
        }}
        title="Создать новую задачу"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пользователь *
            </label>
            <select
              value={newTask.username}
              onChange={(e) => setNewTask({ ...newTask, username: e.target.value })}
              className="input-field"
            >
              <option value="">Выберите пользователя</option>
              {users.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.name} {u.surname} ({u.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field"
              placeholder="Введите название задачи"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="4"
              className="input-field"
              placeholder="Введите описание задачи"
            />
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-xs text-gray-500">
              AI-помощник может помочь детализировать описание задачи.
            </span>
            <button
              type="button"
              onClick={handleSuggestDescription}
              disabled={aiLoading || !newTask.username || !newTask.title}
              className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? "AI дописывает..." : "Дополнить описание с помощью AI"}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дедлайн (необязательно)
            </label>
            <input
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewTask({ username: "", title: "", description: "", deadline: "" });
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              onClick={handleCreateTask}
              className="btn-primary"
            >
              Создать
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования задачи */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditTask({ username: "", title: "", newTitle: "", newDescription: "" });
        }}
        title="Редактировать задачу"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пользователь
            </label>
            <input
              type="text"
              value={editTask.username}
              disabled
              className="input-field bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текущее название
            </label>
            <input
              type="text"
              value={editTask.title}
              disabled
              className="input-field bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Новое название *
            </label>
            <input
              type="text"
              value={editTask.newTitle}
              onChange={(e) => setEditTask({ ...editTask, newTitle: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Новое описание *
            </label>
            <textarea
              value={editTask.newDescription}
              onChange={(e) => setEditTask({ ...editTask, newDescription: e.target.value })}
              rows="4"
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditTask({ username: "", title: "", newTitle: "", newDescription: "" });
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              onClick={handleEditTask}
              className="btn-primary"
            >
              Сохранить
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно установки дедлайна */}
      <Modal
        isOpen={isDeadlineModalOpen}
        onClose={() => {
          setIsDeadlineModalOpen(false);
          setDeadlineData({ taskId: null, newDeadline: "" });
        }}
        title="Установить дедлайн"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дедлайн *
            </label>
            <input
              type="datetime-local"
              value={deadlineData.newDeadline}
              onChange={(e) =>
                setDeadlineData({ ...deadlineData, newDeadline: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeadlineModalOpen(false);
                setDeadlineData({ taskId: null, newDeadline: "" });
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              onClick={handleUpdateDeadline}
              className="btn-primary"
            >
              Сохранить
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
