import { ADD_TASK, TOGGLE_TASK, DELETE_TASK } from '../constants/taskConstants';

// Пустой массив данных или же нулевое значение 
const initialState = [];
// Редусер для состояние , возвращает состояние
const tasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TASK:
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          done: false,
        },
      ];

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