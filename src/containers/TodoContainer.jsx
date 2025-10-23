import TaskInput from '../components/TaskInput/TaskInput';
import TaskList from '../components/TaskList/TaskList';

export default function TodoContainer() {
  return (
    <div>
      <TaskInput />
      <TaskList />
    </div>
  );
}