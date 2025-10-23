import { useDispatch } from "react-redux";
import { toggleTask, deleteTask } from "../../actions/taskActions";
import "../../styles/TaskItem.css";

export default function TaskItem({ task }) {
  const dispatch = useDispatch();

  return (
    <li className={`task-item ${task.done ? "done" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => dispatch(toggleTask(task.id))}
        />
        <span className="task-text">{task.text}</span>
      </label>

      <button
        className="delete-btn"
        onClick={() => dispatch(deleteTask(task.id))}
      >
        ✕
      </button>
    </li>
  );
}