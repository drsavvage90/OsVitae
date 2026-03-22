import { Btn } from "../ui";

export default function AllTasksPage({ filteredTasks, setShowNewTask, TaskRow }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>All Tasks</h1>
        <Btn primary onClick={() => setShowNewTask(true)}>+ New Task</Btn>
      </div>
      {filteredTasks.map((t,i) => <TaskRow key={t.id} task={t} idx={i} />)}
    </div>
  );
}
