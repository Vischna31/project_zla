import { SET_DISCIPLINES } from "../constants/disciplineConstants";

const initialState = [];

const disciplineReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DISCIPLINES:
      return action.payload;
    default:
      return state;
  }
};

export default disciplineReducer;
