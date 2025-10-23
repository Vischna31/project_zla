import { useSelector, useDispatch } from 'react-redux';
import { toggleTask, deleteTask } from '../../reducers/tasksReducer';
import '../../styles/TaskList.css';
//создал функции для export
export default function TaskList() {
  const tasks = useSelector(state => state.tasks);
  const dispatch = useDispatch();

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => dispatch(toggleTask(task.id))}
          />
          <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
            {task.text}
          </span>
          <button onClick={() => dispatch(deleteTask(task.id))}>✕</button>
        </li>
      ))}
    </ul>
  );
}