import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask } from "../../actions/taskActions";
import { fetchDisciplines } from "../../actions/disciplineActions";
import { fetchGroups } from "../../actions/groupActions";
import "../../styles/TaskInput.css";

export default function TaskInput() {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [disciplineId, setDisciplineId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [remindBeforeHour, setRemindBeforeHour] = useState(false); // флаг
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const disciplines = useSelector((state) => state.disciplines || []);
  const groups = useSelector((state) => state.groups || []);

  useEffect(() => {
    dispatch(fetchDisciplines());
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleAdd = () => {
    setError("");
    
    if (!text.trim()) {
      setError("Введите название задачи");
      return;
    }

    // Валидация даты - нельзя выбрать прошлое
    if (dueDateTime) {
      const selectedDate = new Date(dueDateTime);
      const now = new Date();
      if (selectedDate < now) {
        setError("Дедлайн не может быть в прошлом");
        return;
      }
    }

    // если флаг включен и есть дедлайн, шлём 1 час, иначе null
    const remindBeforeHours =
      remindBeforeHour && dueDateTime ? 1 : null;

    dispatch(
      addTask(
        text,
        description,
        dueDateTime,
        disciplineId,
        groupId,
        remindBeforeHours
      )
    );

    setText("");
    setDescription("");
    setDueDateTime("");
    setDisciplineId(null);
    setGroupId(null);
    setRemindBeforeHour(false);
    setError("");
  };

  return (
    <div className="task-input-wrapper">
      <div className="task-input-row">
        <input
          type="text"
          placeholder="Введите задачу..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="datetime-local"
          className="task-datetime-input"
          value={dueDateTime}
          onChange={(e) => setDueDateTime(e.target.value)}
          min={new Date().toISOString().slice(0, 16)} // Минимум текущее время
        />

        <select
          className="task-discipline-select"
          value={disciplineId ?? ""}
          onChange={(e) =>
            setDisciplineId(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        >
          <option value="">Без дисциплины</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="task-group-select"
          value={groupId ?? ""}
          onChange={(e) =>
            setGroupId(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        >
          <option value="">Без группы</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button className="task-add-btn" onClick={handleAdd}>
          +
        </button>
      </div>

      <div className="task-desc-row">
        <textarea
          className="task-input-description"
          placeholder="Описание задачи..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {error && <div className="task-error">{error}</div>}

      <label className="task-reminder-row">
        <input
          type="checkbox"
          checked={remindBeforeHour}
          onChange={(e) => setRemindBeforeHour(e.target.checked)}
          disabled={!dueDateTime} // нельзя ставить напоминание без дедлайна
        />
        <span>Напомнить за 1 час до дедлайна</span>
      </label>
    </div>
  );
}
