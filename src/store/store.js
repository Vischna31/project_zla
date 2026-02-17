import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../reducers/tasksReducer";
import disciplineReducer from "../reducers/disciplineReducer";
import groupReducer from "../reducers/groupReducer";
import authReducer from "../reducers/authReducer";

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    disciplines: disciplineReducer,
    groups: groupReducer,
    auth: authReducer,
  },
});

store.subscribe(() => {
  console.log("State updated:", store.getState());
});

export default store;
