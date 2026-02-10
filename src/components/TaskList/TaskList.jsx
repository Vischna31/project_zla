import { useState } from "react";
import { useSelector } from "react-redux";
import TaskItem from "../TaskItem/TaskItem";
import "../../styles/TaskList.css";

export default function TaskList() {
  const tasks = useSelector((state) => state.tasks);
  const disciplines = useSelector((state) => state.disciplines || []);

  const [statusFilter, setStatusFilter] = useState("all"); // all | active | done | overdue
  const [disciplineFilter, setDisciplineFilter] = useState("all"); // all | id

  const now = new Date();

  const filteredTasks = tasks.filter((task) => {
    const hasDeadline = !!task.dueDateTime;
    const deadlineDate = hasDeadline
      ? new Date(task.dueDateTime.replace("Z", ""))
      : null;
    const isOverdue =
      !!deadlineDate && !task.done && deadlineDate < now;

    // фильтр по статусу
    let okStatus = true;
    switch (statusFilter) {
      case "active":
        okStatus = !task.done;
        break;
      case "done":
        okStatus = task.done;
        break;
      case "overdue":
        okStatus = isOverdue;
        break;
      default:
        okStatus = true;
    }

    // фильтр по дисциплине
    let okDiscipline = true;
    if (disciplineFilter !== "all") {
      okDiscipline =
        task.disciplineId === Number(disciplineFilter);
    }

    return okStatus && okDiscipline;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="task-list-wrapper">
        <div className="task-filters-row">
          <div className="task-filters">
            <button
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              Все
            </button>
            <button
              className={statusFilter === "active" ? "active" : ""}
              onClick={() => setStatusFilter("active")}
            >
              Активные
            </button>
            <button
              className={statusFilter === "done" ? "active" : ""}
              onClick={() => setStatusFilter("done")}
            >
              Выполненные
            </button>
            <button
              className={statusFilter === "overdue" ? "active" : ""}
              onClick={() => setStatusFilter("overdue")}
            >
              Просроченные
            </button>
          </div>

          <select
            className="task-filter-discipline"
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
          >
            <option value="all">Все дисциплины</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <p className="empty">Задач нет по текущим фильтрам</p>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      <div className="task-filters-row">
        <div className="task-filters">
          <button
            className={statusFilter === "all" ? "active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            Все
          </button>
          <button
            className={statusFilter === "active" ? "active" : ""}
            onClick={() => setStatusFilter("active")}
          >
            Активные
          </button>
          <button
            className={statusFilter === "done" ? "active" : ""}
            onClick={() => setStatusFilter("done")}
          >
            Выполненные
          </button>
          <button
            className={statusFilter === "overdue" ? "active" : ""}
            onClick={() => setStatusFilter("overdue")}
          >
            Просроченные
          </button>
        </div>

        <select
          className="task-filter-discipline"
          value={disciplineFilter}
          onChange={(e) => setDisciplineFilter(e.target.value)}
        >
          <option value="all">Все дисциплины</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}
