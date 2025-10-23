import { useSelector } from "react-redux";
import TaskItem from "../TaskItem/TaskItem";
import "../../styles/TaskList.css";

export default function TaskList() {
  const tasks = useSelector((state) => state.tasks);

  if (tasks.length === 0) {
    return <p className="empty">Нет задач</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}