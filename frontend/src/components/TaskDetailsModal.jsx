import { useEffect, useState } from "react";

import {
    getTask,
    updateTask,
    updateTaskStatus,
    deleteTask
} from "../services/taskApi";

const STATUSES = [
    "TODO",
    "IN_PROGRESS",
    "DONE"
];

const PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH"
];

export default function TaskDetailsModal({
    taskId,
    members = [],
    onClose,
    onTaskUpdated,
    onTaskDeleted
}) {

    const [task, setTask] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MEDIUM");
    const [assigneeId, setAssigneeId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {

        const loadTask = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getTask(taskId);

                setTask(data);

                setTitle(data.title || "");
                setDescription(data.description || "");
                setStatus(data.status || "TODO");
                setPriority(data.priority || "MEDIUM");
                setAssigneeId(
                    data.assigneeId
                        ? String(data.assigneeId)
                        : ""
                );
                setDueDate(data.dueDate || "");

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Unable to load task"
                );

            } finally {

                setLoading(false);
            }
        };

        if (taskId) {
            loadTask();
        }

    }, [taskId]);

    const handleSave = async () => {

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        try {

            setSaving(true);
            setError("");

            const updatedTask = await updateTask(
                taskId,
                {
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    dueDate: dueDate || null,
                    assigneeId: assigneeId
                        ? Number(assigneeId)
                        : null
                }
            );

            let finalTask = updatedTask;

            if (status !== updatedTask.status) {

                finalTask = await updateTaskStatus(
                    taskId,
                    status
                );
            }

            onTaskUpdated(finalTask);

            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update task"
            );

        } finally {

            setSaving(false);
        }
    };

    const handleDelete = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this task?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeleting(true);
            setError("");

            await deleteTask(taskId);

            onTaskDeleted(taskId);

            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to delete task"
            );

        } finally {

            setDeleting(false);
        }
    };

    if (loading) {

        return (
            <div className="modal-backdrop">

                <div className="task-modal">

                    <div className="modal-loading">
                        Loading task...
                    </div>

                </div>

            </div>
        );
    }

    if (!task) {

        return (
            <div className="modal-backdrop">

                <div className="task-modal">

                    <div className="modal-header">

                        <h2>Task</h2>

                        <button
                            className="modal-close"
                            onClick={onClose}
                        >
                            ×
                        </button>

                    </div>

                    <div className="error-banner">
                        {error || "Task not found"}
                    </div>

                </div>

            </div>
        );
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div className="task-modal">

                <div className="modal-header">

                    <div>

                        <span className="modal-eyebrow">
                            TASK DETAILS
                        </span>

                        <h2>
                            Edit task
                        </h2>

                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        ×
                    </button>

                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="task-modal-body">

                    <div className="form-group">

                        <label>
                            Task title
                        </label>

                        <input
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value
                                )
                            }
                            placeholder="Enter task title"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder="Describe the task..."
                            rows={5}
                        />

                    </div>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                            >

                                {STATUSES.map(
                                    (item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item ===
                                            "IN_PROGRESS"
                                                ? "In Progress"
                                                : item ===
                                                  "TODO"
                                                    ? "To Do"
                                                    : "Done"}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value
                                    )
                                }
                            >

                                {PRIORITIES.map(
                                    (item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item.charAt(0) +
                                                item
                                                    .slice(1)
                                                    .toLowerCase()}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Assignee
                            </label>

                            <select
                                value={assigneeId}
                                onChange={(event) =>
                                    setAssigneeId(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Unassigned
                                </option>

                                {members.map(
                                    (member) => (

                                        <option
                                            key={member.userId}
                                            value={member.userId}
                                        >
                                            {member.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Due date
                            </label>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(event) =>
                                    setDueDate(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    <div className="task-meta">

                        <div>
                            <span>
                                Created
                            </span>

                            <strong>
                                {task.createdAt
                                    ? new Date(
                                          task.createdAt
                                      ).toLocaleDateString()
                                    : "—"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Task ID
                            </span>

                            <strong>
                                #{task.id}
                            </strong>
                        </div>

                    </div>

                </div>

                <div className="modal-footer">

                    <button
                        type="button"
                        className="danger-button"
                        onClick={handleDelete}
                        disabled={
                            saving ||
                            deleting
                        }
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                    <div className="modal-footer-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={
                                saving ||
                                deleting
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={handleSave}
                            disabled={
                                saving ||
                                deleting
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save changes"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}