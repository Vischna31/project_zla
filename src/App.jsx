import TodoContainer from './containers/TodoContainer';
import './styles/TaskInput.css';
import './styles/TaskList.css';

export default function App() {
  return (
    <div style={{ padding:50 }}>
      <h1>Redux ToDo List</h1>
      <TodoContainer />
    </div>
  );
}