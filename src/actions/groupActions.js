import { SET_GROUPS } from "../constants/groupConstants";

const API_BASE = "http://127.0.0.1:8000/api";

export const setGroups = (groups) => ({
  type: SET_GROUPS,
  payload: groups,
});

export const fetchGroups = () => async (dispatch) => {
  const res = await fetch(`${API_BASE}/groups/`);
  const data = await res.json();

  dispatch(setGroups(data));
};