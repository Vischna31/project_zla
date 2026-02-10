import { SET_DISCIPLINES } from "../constants/disciplineConstants";

const API_BASE = "http://127.0.0.1:8000/api";

export const setDisciplines = (disciplines) => ({
  type: SET_DISCIPLINES,
  payload: disciplines,
});

export const fetchDisciplines = () => async (dispatch) => {
  const res = await fetch(`${API_BASE}/disciplines/`);
  const data = await res.json();

  // data: [{id, name, description}, ...]
  dispatch(setDisciplines(data));
};
