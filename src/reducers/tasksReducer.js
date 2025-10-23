//Типы константы
const ADD_TASK = 'tasks/ADD_TASK';
const TOGGLE_TASK = 'tasks/TOGGLE_TASK';
const DELETE_TASK = 'tasks/DELETE_TASK';

// Создал функцию для импорта что при добавление задачи выводится тип действия и текст задачи
export const addTask = (text) => ({
  type: ADD_TASK,
  payload: text,
});

// Создал функцию для отмечания выполнено не выполнено
export const toggleTask = (id) => ({
  type: TOGGLE_TASK,
  payload: id,
});
// Создал функцию для отмечания удаление задачи с выводом id 
export const deleteTask = (id) => ({
  type: DELETE_TASK,
  payload: id,
});

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