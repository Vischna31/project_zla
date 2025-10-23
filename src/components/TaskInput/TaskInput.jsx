import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../../actions/taskActions'; 
import '../../styles/TaskInput.css';

export default function TaskInput() {
  const [text, setText] = useState('');
  const dispatch = useDispatch();

  const handleAdd = () => {
    if (text.trim()) {
      dispatch(addTask(text));
      setText('');
    }
  };

  return (
    <div className="task-input">
      <input
        type="text"
        placeholder="Введите задачу..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleAdd}>Добавить</button>
    </div>
  );
}