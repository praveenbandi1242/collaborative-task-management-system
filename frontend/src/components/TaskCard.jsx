const priorityStyles = {
    LOW: "priority-low",
    MEDIUM: "priority-medium",
    HIGH: "priority-high",
};

export default function TaskCard({
    task,
    onClick,
}) {

    return (
        <article
            className="task-card"
            onClick={onClick}
        >

            <div className="task-card-top">

                <span
                    className={`priority-badge ${
                        priorityStyles[task.priority]
                    }`}
                >
                    {task.priority}
                </span>

                <button
                    type="button"
                    className="task-menu"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    ⋮
                </button>

            </div>

            <h4>
                {task.title}
            </h4>

            {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
            )}

            <div className="task-card-footer">

                <div className="task-assignee">

                    {task.assigneeName ? (
                        <>
                            <div className="avatar">
                                {task.assigneeName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <span>
                                {task.assigneeName}
                            </span>
                        </>
                    ) : (
                        <span className="unassigned">
                            Unassigned
                        </span>
                    )}

                </div>

                {task.dueDate && (
                    <span className="due-date">
                        📅 {task.dueDate}
                    </span>
                )}

            </div>

        </article>
    );
}