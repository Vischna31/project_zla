import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTasks } from "../actions/taskActions";
import TaskInput from "../components/TaskInput/TaskInput";
import TaskList from "../components/TaskList/TaskList";

export default function TodoContainer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div>
      <TaskInput />
      <TaskList />
    </div>
  );
}
