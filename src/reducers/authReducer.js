import { SET_USER, CLEAR_USER } from "../actions/authActions";

const initialState = null;

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    case CLEAR_USER:
      return null;
    default:
      return state;
  }
};

export default authReducer;