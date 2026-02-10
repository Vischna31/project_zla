import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../reducers/tasksReducer";
import disciplineReducer from "../reducers/disciplineReducer";

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    disciplines: disciplineReducer,
  },
});

store.subscribe(() => {
  console.log("State updated:", store.getState());
});

export default store;
