import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../reducers/tasksReducer';

// Создал store в котором описал какой именно Reducer у нас используется
const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});
// Использовал метод subscribe для того чтобы при любом изменение состояния выводил лог , при добавление,удаление,отметки
store.subscribe(() => {
  console.log('State updated:', store.getState());
});

export default store;