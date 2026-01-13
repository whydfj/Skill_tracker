import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { usersAPI } from "../api/users";
import Modal from "../components/Modal";

export default function Users() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchUsername, setSearchUsername] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    name: "",
    surname: "",
    email_user: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUser.username ||
      !newUser.password ||
      !newUser.name ||
      !newUser.surname ||
      !newUser.email_user
    ) {
      alert("Заполните все обязательные поля");
      return;
    }

    if (newUser.password.length < 4) {
      alert("Пароль должен быть не менее 4 символов");
      return;
    }

    try {
      await usersAPI.createUser(newUser);
      setIsCreateModalOpen(false);
      setNewUser({
        username: "",
        password: "",
        role: "user",
        name: "",
        surname: "",
        email_user: "",
      });
      await loadUsers();
      alert("Пользователь успешно создан!");
    } catch (error) {
      alert("Ошибка создания пользователя: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteUser = async (username) => {
    if (!confirm(`Удалить пользователя "${username}"?`)) return;

    try {
      await usersAPI.deleteUser(username);
      await loadUsers();
      alert("Пользователь успешно удален!");
    } catch (error) {
      alert("Ошибка удаления пользователя: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleSearchUser = async () => {
    if (!searchUsername.trim()) {
      alert("Введите имя пользователя");
      return;
    }

    try {
      const result = await usersAPI.findUser(searchUsername);
      setSearchResult(result);
    } catch (error) {
      setSearchResult(null);
      alert("Пользователь не найден: " + (error.response?.data?.detail || error.message));
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Администратор",
      manager: "Руководитель",
      user: "Сотрудник",
      employee: "Сотрудник",
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
      employee: "bg-green-100 text-green-800",
    };
    return badges[role] || "bg-gray-100 text-gray-800";
  };

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
            <h2 className="text-4xl font-bold gradient-text mb-2">Пользователи</h2>
            <p className="text-gray-600">Управление пользователями системы</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              🔍 Поиск
            </button>
            {isAdmin() && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                + Создать пользователя
              </button>
            )}
          </div>
        </div>

        {searchResult && (
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
              <span>🔍</span>
              <span>Результат поиска:</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Имя:</span>
                <p className="font-semibold text-gray-800">{searchResult.name_user}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Фамилия:</span>
                <p className="font-semibold text-gray-800">{searchResult.surname_user}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Роль:</span>
                <p className="font-semibold text-gray-800">{getRoleLabel(searchResult.role_user)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Создан:</span>
                <p className="font-semibold text-gray-800">
                  {new Date(searchResult.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSearchResult(null)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ✕ Закрыть
            </button>
          </div>
        )}

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Дата регистрации
                </th>
                {isAdmin() && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Действия
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{u.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {u.name} {u.surname}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{u.email_user || "Не указан"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getRoleBadge(u.role)}`}
                    >
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(u.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(u.username)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                      >
                        🗑️ Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно создания пользователя */}
      {isAdmin() && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewUser({
              username: "",
              password: "",
              role: "user",
              name: "",
              surname: "",
              email_user: "",
            });
          }}
          title="Создать нового пользователя"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин *
              </label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="input-field"
                placeholder="Введите логин"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль * (минимум 4 символа)
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="input-field"
                placeholder="Введите пароль"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль *
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="input-field"
              >
                <option value="user">Сотрудник</option>
                <option value="manager">Руководитель</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="input-field"
                placeholder="Введите имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия *
              </label>
              <input
                type="text"
                value={newUser.surname}
                onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
                className="input-field"
                placeholder="Введите фамилию"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={newUser.email_user}
                onChange={(e) => setNewUser({ ...newUser, email_user: e.target.value })}
                className="input-field"
                placeholder="Введите email"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewUser({
                    username: "",
                    password: "",
                    role: "user",
                    name: "",
                    surname: "",
                    email_user: "",
                  });
                }}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateUser}
                className="btn-primary"
              >
                Создать
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальное окно поиска */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchUsername("");
          setSearchResult(null);
        }}
        title="Поиск пользователя"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="input-field"
              placeholder="Введите логин"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsSearchModalOpen(false);
                setSearchUsername("");
                setSearchResult(null);
              }}
              className="btn-secondary"
            >
              Закрыть
            </button>
            <button
              onClick={handleSearchUser}
              className="btn-primary"
            >
              Найти
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}