import {
  ADD_TASK,
  TOGGLE_TASK,
  DELETE_TASK,
  SET_TASKS,
} from "../constants/taskConstants";
import { getToken } from "../api/auth";

const API_BASE = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
};

const normalizeDateTime = (value) => {
  if (!value) return null;
  if (value.length === 16) return value + ":00";
  return value;
};


export const setTasks = (tasks) => ({
  type: SET_TASKS,
  payload: tasks,
});

export const fetchTasks = () => async (dispatch) => {
  console.log("fetching from", `${API_BASE}/tasks/`);

  const res = await fetch(`${API_BASE}/tasks/`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  console.log("fetch status", res.status);

  if (!res.ok) {
    console.error("Failed to fetch tasks", res.status, await res.text());
    dispatch(setTasks([]));
    return;
  }

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
    groupId: t.group ? t.group.id : null,
    groupName: t.group ? t.group.name : "",
  }));

  console.log("mapped tasks", mapped);
  dispatch(setTasks(mapped));
};

export const addTask =
  (
    text,
    description = "",
    dueDateTime = null,
    disciplineId = null,
    groupId = null,
    remindBeforeHours = null
  ) =>
  async (dispatch) => {
    const res = await fetch(`${API_BASE}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        title: text,
        description,
        status: "todo",
        deadline: normalizeDateTime(dueDateTime),
        discipline_id: disciplineId,
        group_id: groupId,
        remind_before_hours: remindBeforeHours,
      }),
    });

    if (!res.ok) {
      console.error("Failed to create task", res.status, await res.text());
      return;
    }

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
        groupId: t.group ? t.group.id : null,
        groupName: t.group ? t.group.name : "",
      },
    });
  };

export const deleteTask = (id) => async (dispatch) => {
  const res = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok && res.status !== 204) {
    console.error("Failed to delete task", res.status, await res.text());
    return;
  }

  dispatch({
    type: DELETE_TASK,
    payload: id,
  });
};

export const toggleTask = (id) => async (dispatch, getState) => {
  const state = getState();
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  const newDone = !task.done;
  const newStatus = newDone ? "done" : "todo";

  const res = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    console.error("Failed to toggle task", res.status, await res.text());
    return;
  }

  dispatch({
    type: TOGGLE_TASK,
    payload: id,
  });
};
