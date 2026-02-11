// src/actions/taskActions.js
import {
  ADD_TASK,
  TOGGLE_TASK,
  DELETE_TASK,
  SET_TASKS,
} from "../constants/taskConstants";

const API_BASE = "http://127.0.0.1:8000/api";

export const setTasks = (tasks) => ({
  type: SET_TASKS,
  payload: tasks,
});

export const fetchTasks = () => async (dispatch) => {
  const res = await fetch(`${API_BASE}/tasks/`);
  console.log("fetch status", res.status);

  const data = await res.json();
  console.log("tasks from API", data);

  if (!Array.isArray(data)) {
    console.error("Tasks API returned non-array", data);
    dispatch(setTasks([]));
    return;
  }

  const mapped = data.map((t) => ({
    id: t.id,
    text: t.title,
    description: t.description || "",
    done: t.status === "done",
    dueDateTime: t.deadline || null,
    disciplineId: t.discipline ? t.discipline.id : null,
    disciplineName: t.discipline ? t.discipline.name : "",
  }));

  console.log("mapped tasks", mapped);
  dispatch(setTasks(mapped));
};


// Добавление задачи через Django (+ напоминание)
export const addTask =
  (
    text,
    description = "",
    dueDateTime = null,
    disciplineId = null,
    remindBeforeHours = null
  ) =>
  async (dispatch) => {
    const res = await fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: text,
        description,
        status: "todo",
        deadline: dueDateTime,
        discipline_id: disciplineId,
        remind_before_hours: remindBeforeHours,
      }),
    });

    const t = await res.json();

    dispatch({
      type: ADD_TASK,
      payload: {
        id: t.id,
        text: t.title,
        description: t.description || "",
        done: t.status === "done",
        dueDateTime: t.deadline || null,
        disciplineId: t.discipline ? t.discipline.id : null,
        disciplineName: t.discipline ? t.discipline.name : "",
      },
    });
  };

// Удаление задачи
export const deleteTask = (id) => async (dispatch) => {
  const res = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    console.error("Failed to delete task", await res.text());
    return;
  }

  dispatch({
    type: DELETE_TASK,
    payload: id,
  });
};

// Переключение статуса задачи
export const toggleTask = (id) => async (dispatch, getState) => {
  const state = getState();
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  const newDone = !task.done;
  const newStatus = newDone ? "done" : "todo";

  const res = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    console.error("Failed to toggle task", await res.text());
    return;
  }

  dispatch({
    type: TOGGLE_TASK,
    payload: id,
  });
};
