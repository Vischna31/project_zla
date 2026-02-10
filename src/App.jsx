import TodoContainer from './containers/TodoContainer';
import './styles/App.css';
import './styles/TaskInput.css';
import './styles/TaskList.css';
import './styles/TaskItem.css';

export default function App() {
  return (
    <div className="app-modal-wrapper">
      <div className="todo-modal">
        <h1 className="todo-title">Redux ToDo List</h1>
        <TodoContainer />
      </div>
    </div>
  );
}
