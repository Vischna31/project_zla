import { ADD_TASK, TOGGLE_TASK, DELETE_TASK, SET_TASKS } from "../constants/taskConstants";

const initialState = [];

const tasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TASKS:
      // полностью заменяем список задач тем, что пришло с сервера
      return action.payload;

    case ADD_TASK:
      // теперь в payload уже готовый объект {id, text, done}
      return [...state, action.payload];

    case TOGGLE_TASK:
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, done: !task.done }
          : task
      );

    case DELETE_TASK:
      return state.filter((task) => task.id !== action.payload);

    default:
      return state;
  }
};

export default tasksReducer;
