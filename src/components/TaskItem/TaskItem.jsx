import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleTask, deleteTask } from "../../actions/taskActions";
import "../../styles/TaskItem.css";

export default function TaskItem({ task }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleToggleDescription = () => {
    if (!task.description) return;
    setOpen((prev) => !prev);
  };

  const hasDeadline = !!task.dueDateTime;

  const deadlineDate = hasDeadline
    ? new Date(task.dueDateTime.replace("Z", ""))
    : null;

  const now = new Date();

  const isOverdue = !!deadlineDate && !task.done && deadlineDate < now;

  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <li
      className={`task-item ${task.done ? "done" : ""} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      <div className="task-header">
        <div className="task-left">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => dispatch(toggleTask(task.id))}
          />
          <span
            className="task-text"
            onClick={handleToggleDescription}
            style={{ cursor: task.description ? "pointer" : "default" }}
          >
            {task.text}
          </span>
        </div>

        <div className="task-actions">
          {hasDeadline && (
            <span className="task-deadline">
              {isOverdue ? "Просрочено: " : "Дедлайн: "}
              {formattedDeadline}
            </span>
          )}

          {task.description && (
            <span
              className="task-toggle-indicator"
              onClick={handleToggleDescription}
            >
              {open ? "▲" : "▼"}
            </span>
          )}

          <button
            className="delete-btn"
            onClick={() => dispatch(deleteTask(task.id))}
          >
            ✕
          </button>
        </div>
      </div>

      {open && task.description && (
        <div className="task-description">{task.description}</div>
      )}

      {task.disciplineName && (
        <p className="task-discipline">
          Дисциплина: <span>{task.disciplineName}</span>
        </p>
      )}
    </li>
  );
}
