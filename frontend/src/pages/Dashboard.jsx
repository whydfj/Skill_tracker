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
    pendingTasks: 0,
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
          pendingTasks: allTasks.filter((t) => t.progress === 0).length,
          myTasks: 0,
        });
      } else {
        const myTasks = await tasksAPI.getMyTasks();
        setStats({
          myTasks: myTasks.length,
          completedTasks: myTasks.filter((t) => t.progress === 100).length,
          inProgressTasks: myTasks.filter((t) => t.progress > 0 && t.progress < 100).length,
          pendingTasks: myTasks.filter((t) => t.progress === 0).length,
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

  const totalTasks = isManager() ? stats.allTasks : stats.myTasks;
  const completionRate = totalTasks > 0 ? Math.round((stats.completedTasks / totalTasks) * 100) : 0;

  // Данные для диаграммы
  const chartData = [
    { label: "Выполнено", value: stats.completedTasks, color: "bg-green-500" },
    { label: "В процессе", value: stats.inProgressTasks, color: "bg-yellow-500" },
    { label: "Ожидание", value: stats.pendingTasks, color: "bg-blue-500" },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
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
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
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
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
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
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Диаграмма статистики */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Статистика задач</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Распределение задач</h3>
              <div className="space-y-4">
                {chartData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{item.label}</span>
                      <span className="text-sm font-bold text-gray-800">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${(item.value / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Визуализация</h3>
              <div className="relative h-64 flex items-end justify-center gap-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div
                        className={`w-full ${item.color} rounded-t-lg transition-all duration-500 shadow-lg`}
                        style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '20px' : '0' }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Информация о профиле</h2>
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
