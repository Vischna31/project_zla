import { SET_GROUPS } from "../constants/groupConstants";

const initialState = [];

const groupReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_GROUPS:
      return action.payload;
    default:
      return state;
  }
};

export default groupReducer;