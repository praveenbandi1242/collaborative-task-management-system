import TaskCard from "./TaskCard";

const columnStyles = {
    TODO: {
        title: "To Do",
        description: "Tasks waiting to be started",
    },

    IN_PROGRESS: {
        title: "In Progress",
        description: "Currently being worked on",
    },

    DONE: {
        title: "Done",
        description: "Completed tasks",
    },
};

export default function TaskColumn({
    status,
    tasks,
    onTaskClick,
}) {

    const column = columnStyles[status];

    return (
        <section className="task-column">

            <div className="task-column-header">

                <div>
                    <h3>{column.title}</h3>

                    <p>
                        {column.description}
                    </p>
                </div>

                <span className="task-count">
                    {tasks.length}
                </span>

            </div>

            <div className="task-column-content">

                {tasks.length === 0 ? (

                    <div className="empty-column">
                        <div className="empty-icon">
                            ✓
                        </div>

                        <span>
                            No tasks
                        </span>
                    </div>

                ) : (

                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() =>
                                onTaskClick(task)
                            }
                        />
                    ))

                )}

            </div>

        </section>
    );
}