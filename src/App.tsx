import { format, utcToZonedTime } from 'date-fns-tz';
import { FormEventHandler, useEffect, useState } from 'react';
import { BsTrash } from 'react-icons/bs';

type Task = {
  id: number;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const res = await fetch('http://127.0.0.1:8080/tasks').then((res) => res.json());
    setTasks(res);
  };

  const createTask = async ({ description }: { description: string }) => {
    await fetch('http://127.0.0.1:8080/tasks', {
      method: 'POST',
      body: JSON.stringify({ description }),
      headers: { 'content-type': 'application/json' },
    });
    await fetchTasks();
  };

  const destroyTask = async (task_id: number) => {
    await fetch(`http://127.0.0.1:8080/tasks/${task_id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
    });
    await fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, fetchTasks, createTask, destroyTask };
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const timeZone = 'Asia/Tokyo';
  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, 'yyyy/MM/dd HH:mm');
};

export const App = () => {
  const { tasks, createTask, destroyTask } = useTasks();

  const [description, setDescription] = useState('');

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await createTask({ description });
    setDescription('');
  };

  const onDestroy = async (task_id: number) => {
    if (confirm('Are you sure?')) {
      await destroyTask(task_id);
    }
  };

  return (
    <div style={{ width: '480px', margin: '20px auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <form
          onSubmit={onSubmit}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '12px',
          }}
        >
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">ADD TASK</button>
        </form>
      </div>

      <div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((t) => (
            <li key={t.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>{t.description}</div>
                <div>{formatTimestamp(t.created_at)}</div>
                <button
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => onDestroy(t.id)}
                >
                  <BsTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
