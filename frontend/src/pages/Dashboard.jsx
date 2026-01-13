import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { tasksAPI } from "../api/tasks";

export default function Dashboard() {
  const { user, isManager } = useAuth();
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    allTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (isManager()) {
        const allTasks = await tasksAPI.getAllTasks();
        setStats({
          allTasks: allTasks.length,
          completedTasks: allTasks.filter((t) => t.progress === 100).length,
          inProgressTasks: allTasks.filter((t) => t.progress > 0 && t.progress < 100).length,
          myTasks: 0,
        });
      } else {
        const myTasks = await tasksAPI.getMyTasks();
        setStats({
          myTasks: myTasks.length,
          completedTasks: myTasks.filter((t) => t.progress === 100).length,
          inProgressTasks: myTasks.filter((t) => t.progress > 0 && t.progress < 100).length,
          allTasks: 0,
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  const roleLabels = {
    admin: "Администратор",
    manager: "Руководитель",
    user: "Сотрудник",
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">
            Добро пожаловать, {user.name} {user.surname}!
          </h1>
          <p className="text-blue-100 text-lg">
            {roleLabels[user.role] || user.role}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-medium">
                {isManager() ? "Всего задач" : "Мои задачи"}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <div className="text-4xl font-bold gradient-text">
              {isManager() ? stats.allTasks : stats.myTasks}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-medium">В процессе</div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-yellow-600">
              {stats.inProgressTasks}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-medium">Выполнено</div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {stats.completedTasks}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-medium">Прогресс</div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {stats.myTasks > 0 || stats.allTasks > 0
                ? Math.round(
                    (stats.completedTasks /
                      (isManager() ? stats.allTasks : stats.myTasks)) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            <span>👤</span>
            <span>Информация о профиле</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Логин</span>
              <p className="font-semibold text-gray-800 text-lg">{user.username}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Email</span>
              <p className="font-semibold text-gray-800 text-lg">{user.email_user || "Не указан"}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Дата регистрации</span>
              <p className="font-semibold text-gray-800 text-lg">
                {new Date(user.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <span className="text-gray-600 text-sm block mb-1">Роль</span>
              <p className="font-semibold text-gray-800 text-lg">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
