import { useState } from "react";
import { updateTask } from "../services/taskApi";

export default function EditTaskModal({
    task,
    members,
    onClose,
    onUpdated
}) {

    const [title, setTitle] =
        useState(task.title);

    const [description, setDescription] =
        useState(task.description || "");

    const [priority, setPriority] =
        useState(task.priority);

    const [dueDate, setDueDate] =
        useState(task.dueDate || "");

    const [assigneeId, setAssigneeId] =
        useState(task.assignee?.id || "");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const updated = await updateTask(
                task.id,
                {
                    title: title.trim(),
                    description,
                    priority,
                    dueDate: dueDate || null,
                    assigneeId:
                        assigneeId
                            ? Number(assigneeId)
                            : null
                }
            );

            onUpdated(updated);
            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update task"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h2>
                        Edit task
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Title
                    </label>

                    <input
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        required
                    />

                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                    />

                    <label>
                        Priority
                    </label>

                    <select
                        value={priority}
                        onChange={(e) =>
                            setPriority(
                                e.target.value
                            )
                        }
                    >
                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>
                    </select>

                    <label>
                        Due date
                    </label>

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) =>
                            setDueDate(
                                e.target.value
                            )
                        }
                    />

                    <label>
                        Assignee
                    </label>

                    <select
                        value={assigneeId}
                        onChange={(e) =>
                            setAssigneeId(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Unassigned
                        </option>

                        {members.map((member) => (

                            <option
                                key={member.userId}
                                value={member.userId}
                            >
                                {member.name}
                            </option>

                        ))}

                    </select>

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}