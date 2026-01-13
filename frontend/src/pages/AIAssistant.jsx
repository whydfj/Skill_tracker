import { useState } from "react";
import Layout from "../components/Layout";
import { aiAPI } from "../api/ai";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const answer = await aiAPI.sendRequest(question);
      const newEntry = { question, answer, timestamp: new Date() };
      setHistory([newEntry, ...history]);
      setResponse(answer);
      setQuestion("");
    } catch (error) {
      alert("Ошибка запроса к AI: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">AI Помощник</h2>
          <p className="text-gray-600 text-lg">
            Задайте вопрос о работе API приложения Curse_work
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ваш вопрос
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows="5"
                className="input-field"
                placeholder="Например: Как создать задачу? Какие эндпоинты доступны для менеджера?"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
            >
              {loading ? "⏳ Отправка..." : "🚀 Отправить запрос"}
            </button>
          </form>
        </div>

        {response && (
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
              <span>💡</span>
              <span>Ответ AI:</span>
            </h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg">{response}</div>
          </div>
        )}

        {history.length > 0 && (
          <div className="card p-8">
            <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
              <span>📜</span>
              <span>История запросов</span>
            </h3>
            <div className="space-y-5">
              {history.map((entry, index) => (
                <div key={index} className="border-b-2 border-blue-100 pb-5 last:border-0">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-2 font-medium">
                      {entry.timestamp.toLocaleString("ru-RU")}
                    </div>
                    <div className="font-semibold text-gray-800 mb-3 bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-600">❓ Вопрос:</span> {entry.question}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {entry.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
