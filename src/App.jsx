import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, logout, fetchCurrentUser } from "./actions/authActions";
import TodoContainer from "./containers/TodoContainer";
import "./styles/App.css";
import "./styles/TaskInput.css";
import "./styles/TaskList.css";

export default function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Проверяем токен при загрузке
  if (!auth && !localStorage.getItem("authToken")) {
    dispatch(fetchCurrentUser());
  }

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Введите имя и пароль");
      return;
    }
    await dispatch(login(username, password));
  };

  const handleRegister = async () => {
    setError("");
    if (!username || !password) {
      setError("Введите имя и пароль");
      return;
    }
    await dispatch(register(username, password, email));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (auth) {
    return (
      <div className="app-modal-wrapper">
        <div className="todo-modal">
          <div className="user-info">
            <span>Пользователь: {auth.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Выйти
            </button>
          </div>
          <h1 className="todo-title">Список учебных задач</h1>
          <TodoContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="app-modal-wrapper">
      <div className="auth-modal">
        <h2 className="auth-title">
          {isLoginMode ? "Вход в систему" : "Регистрация"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-form">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {!isLoginMode && (
            <input
              type="email"
              placeholder="Email (необязательно)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="auth-submit-btn"
            onClick={isLoginMode ? handleLogin : handleRegister}
          >
            {isLoginMode ? "Войти" : "Зарегистрироваться"}
          </button>

          <p className="auth-toggle">
            {isLoginMode ? (
              <>
                Нет аккаунта?{" "}
                <button
                  className="auth-link"
                  onClick={() => {
                    setIsLoginMode(false);
                    setError("");
                  }}
                >
                  Регистрация
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button
                  className="auth-link"
                  onClick={() => {
                    setIsLoginMode(true);
                    setError("");
                  }}
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
