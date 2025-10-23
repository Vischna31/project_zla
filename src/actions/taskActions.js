import { ADD_TASK,TOGGLE_TASK,DELETE_TASK } from "../constants/taskConstants";

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