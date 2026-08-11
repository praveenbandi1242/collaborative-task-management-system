import { useEffect, useMemo, useState } from "react";

import {
    getProjectTasks
} from "../services/taskApi";

import {
    createProjectWebSocket
} from "../services/websocket";

import TaskDetailsModal from "./TaskDetailsModal";

const COLUMNS = [
    {
        key: "TODO",
        title: "To Do"
    },
    {
        key: "IN_PROGRESS",
        title: "In Progress"
    },
    {
        key: "DONE",
        title: "Done"
    }
];

const formatPriority = (priority) => {

    if (!priority) {
        return "Medium";
    }

    return (
        priority.charAt(0) +
        priority.slice(1).toLowerCase()
    );
};

const getInitials = (name) => {

    if (!name) {
        return "?";
    }

    return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export default function TaskBoard({
    projectId,
    members = []
}) {

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedTaskId, setSelectedTaskId] =
        useState(null);

    const [search, setSearch] = useState("");

    const [connectionStatus, setConnectionStatus] =
        useState("connecting");

    /*
     * Load tasks from the REST API.
     */
    const loadTasks = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getProjectTasks(projectId);

            setTasks(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load project tasks."
            );

        } finally {

            setLoading(false);
        }
    };

    /*
     * Initial task loading.
     */
    useEffect(() => {

        if (!projectId) {
            return;
        }

        loadTasks();

    }, [projectId]);

    /*
     * WebSocket connection.
     *
     * Keeps this board synchronized with other
     * users working on the same project.
     */
    useEffect(() => {

        if (!projectId) {
            return;
        }

        console.log(
            "TaskBoard WebSocket effect START:",
            projectId
        );

        setConnectionStatus("connecting");

        const client =
            createProjectWebSocket(
                projectId,

                (event) => {

                    console.log(
                        "WebSocket event:",
                        event
                    );

                    if (!event || !event.type) {
                        return;
                    }

                    /*
                     * TASK CREATED
                     *
                     * Add the new task to the board
                     * without refreshing the page.
                     */
                    if (
                        event.type ===
                        "TASK_CREATED"
                    ) {

                        if (!event.task) {
                            return;
                        }

                        setTasks((currentTasks) => {

                            const exists =
                                currentTasks.some(
                                    (task) =>
                                        task.id ===
                                        event.task.id
                                );

                            if (exists) {
                                return currentTasks;
                            }

                            return [
                                event.task,
                                ...currentTasks
                            ];
                        });

                        return;
                    }

                    /*
                     * TASK UPDATED
                     *
                     * Replace the existing task
                     * with the updated version.
                     */
                    if (
                        event.type ===
                            "TASK_UPDATED" ||
                        event.type ===
                            "TASK_STATUS_UPDATED"
                    ) {

                        if (!event.task) {
                            return;
                        }

                        setTasks((currentTasks) =>
                            currentTasks.map(
                                (task) =>
                                    task.id ===
                                    event.task.id
                                        ? event.task
                                        : task
                            )
                        );

                        return;
                    }

                    /*
                     * TASK DELETED
                     *
                     * Remove the task immediately.
                     */
                    if (
                        event.type ===
                        "TASK_DELETED"
                    ) {

                        if (!event.task) {
                            return;
                        }

                        setTasks((currentTasks) =>
                            currentTasks.filter(
                                (task) =>
                                    task.id !==
                                    event.task.id
                            )
                        );
                    }
                },

                (status) => {

                    console.log(
                        "WebSocket status:",
                        status
                    );

                    setConnectionStatus(status);
                }
            );

        /*
         * Disconnect only when this component
         * is actually removed or the project changes.
         */
        return () => {

            console.log(
                "TaskBoard WebSocket CLEANUP:",
                projectId
            );

            if (client) {

                console.log(
                    "Deactivating WebSocket client:",
                    projectId
                );

                client.deactivate();
            }

        };

    }, [projectId]);

    /*
     * Search tasks locally.
     */
    const filteredTasks = useMemo(() => {

        if (!search.trim()) {
            return tasks;
        }

        const query =
            search.trim().toLowerCase();

        return tasks.filter((task) =>
            task.title
                ?.toLowerCase()
                .includes(query)
        );

    }, [tasks, search]);

    /*
     * Group tasks into board columns.
     */
    const tasksByStatus = useMemo(() => {

        return COLUMNS.reduce(
            (result, column) => {

                result[column.key] =
                    filteredTasks.filter(
                        (task) =>
                            task.status ===
                            column.key
                    );

                return result;

            },
            {}
        );

    }, [filteredTasks]);

    /*
     * Update a task immediately
     * in the local board.
     */
    const handleTaskUpdated = (updatedTask) => {

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id
                    ? updatedTask
                    : task
            )
        );
    };

    /*
     * Remove a deleted task immediately
     * from the local board.
     */
    const handleTaskDeleted = (taskId) => {

        setTasks((currentTasks) =>
            currentTasks.filter(
                (task) =>
                    task.id !== taskId
            )
        );
    };

    /*
     * Loading state.
     */
    if (loading) {

        return (
            <section className="task-board-section">

                <div className="section-header">

                    <div>

                        <span className="section-eyebrow">
                            PROJECT WORK
                        </span>

                        <h2>
                            Tasks
                        </h2>

                    </div>

                </div>

                <div className="task-board-loading">

                    <div className="loading-spinner" />

                    <span>
                        Loading tasks...
                    </span>

                </div>

            </section>
        );
    }

    return (
        <section className="task-board-section">

            {/* =========================
                TASK BOARD TOOLBAR
               ========================= */}

            <div className="task-board-toolbar">

                <div className="task-board-title">

                    <h2>
                        Tasks
                    </h2>

                    <span className="task-count">
                        {tasks.length}{" "}
                        {tasks.length === 1
                            ? "task"
                            : "tasks"}
                    </span>

                </div>

                <div
                    className={`live-status ${connectionStatus}`}
                >

                    <span className="live-status-dot" />

                    {connectionStatus ===
                    "connected"
                        ? "Live"
                        : connectionStatus ===
                          "connecting"
                            ? "Connecting..."
                            : "Offline"}

                </div>

            </div>

            {/* =========================
                SECTION HEADER
               ========================= */}

            <div className="section-header">

                <div>

                    <span className="section-eyebrow">
                        PROJECT WORK
                    </span>

                    <div className="section-title-row">

                        <h2>
                            Tasks
                        </h2>

                        <span className="task-count">
                            {tasks.length}{" "}
                            {tasks.length === 1
                                ? "task"
                                : "tasks"}
                        </span>

                    </div>

                </div>

                <div className="task-search">

                    <span className="search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            className="search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>

            </div>

            {/* =========================
                ERROR
               ========================= */}

            {error && (

                <div className="error-banner">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        className="retry-button"
                        onClick={loadTasks}
                    >
                        Retry
                    </button>

                </div>

            )}

            {/* =========================
                TASK BOARD
               ========================= */}

            <div className="task-board">

                {COLUMNS.map((column) => {

                    const columnTasks =
                        tasksByStatus[
                            column.key
                        ] || [];

                    return (

                        <div
                            className="task-column"
                            key={column.key}
                        >

                            <div className="task-column-header">

                                <div className="column-title">

                                    <span
                                        className={`status-dot status-${column.key.toLowerCase()}`}
                                    />

                                    <h3>
                                        {column.title}
                                    </h3>

                                    <span className="column-count">
                                        {
                                            columnTasks.length
                                        }
                                    </span>

                                </div>

                            </div>

                            <div className="task-column-body">

                                {columnTasks.length ===
                                0 ? (

                                    <div className="empty-column">

                                        <div className="empty-column-icon">
                                            ✓
                                        </div>

                                        <span>
                                            No tasks
                                        </span>

                                    </div>

                                ) : (

                                    columnTasks.map(
                                        (task) => (

                                            <button
                                                type="button"
                                                className="task-card"
                                                key={task.id}
                                                onClick={() =>
                                                    setSelectedTaskId(
                                                        task.id
                                                    )
                                                }
                                            >

                                                <div className="task-card-top">

                                                    <span
                                                        className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                                                    >
                                                        {formatPriority(
                                                            task.priority
                                                        )}
                                                    </span>

                                                    <span className="task-menu">
                                                        ···
                                                    </span>

                                                </div>

                                                <h4>
                                                    {
                                                        task.title
                                                    }
                                                </h4>

                                                {task.description && (

                                                    <p className="task-description">
                                                        {
                                                            task.description
                                                        }
                                                    </p>

                                                )}

                                                <div className="task-card-footer">

                                                    <div className="assignee">

                                                        {task.assigneeName ? (

                                                            <>

                                                                <span className="avatar">

                                                                    {
                                                                        getInitials(
                                                                            task.assigneeName
                                                                        )
                                                                    }

                                                                </span>

                                                                <span>
                                                                    {
                                                                        task.assigneeName
                                                                    }
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

                                                            {new Date(
                                                                `${task.dueDate}T00:00:00`
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    month: "short",
                                                                    day: "numeric"
                                                                }
                                                            )}

                                                        </span>

                                                    )}

                                                </div>

                                            </button>

                                        )
                                    )

                                )}

                            </div>

                        </div>

                    );

                })}

            </div>

            {/* =========================
                TASK DETAILS MODAL
               ========================= */}

            {selectedTaskId && (

                <TaskDetailsModal
                    taskId={selectedTaskId}
                    members={members}

                    onClose={() =>
                        setSelectedTaskId(null)
                    }

                    onTaskUpdated={
                        handleTaskUpdated
                    }

                    onTaskDeleted={
                        handleTaskDeleted
                    }
                />

            )}

        </section>
    );
}

