import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getProject,
    getProjectMembers
} from "../services/projectApi";

import {
    createTask
} from "../services/taskApi";

import ProjectMembers from "../components/ProjectMembers";
import TaskBoard from "../components/TaskBoard";

export default function ProjectDetails() {

    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] =
        useState(null);

    const [members, setMembers] =
        useState([]);

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [priority, setPriority] =
        useState("MEDIUM");

    const [showCreateTask, setShowCreateTask] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadProject = async () => {

            try {

                setLoading(true);
                setError("");

                const [projectData, membersData] =
                    await Promise.all([
                        getProject(projectId),
                        getProjectMembers(projectId)
                    ]);

                setProject(projectData);

                setMembers(
                    Array.isArray(membersData)
                        ? membersData
                        : []
                );

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Unable to load project"
                );

            } finally {

                setLoading(false);
            }
        };

        loadProject();

    }, [projectId]);

    const handleCreateTask = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        try {

            setError("");

            await createTask(
                projectId,
                {
                    title: title.trim(),
                    description,
                    priority
                }
            );

            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setShowCreateTask(false);

            /*
             * TaskBoard loads its own task data.
             * Reloading the page makes the newly
             * created task immediately visible.
             */
            window.location.reload();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to create task"
            );
        }
    };

    if (loading) {

        return (
            <div className="loading-state">
                Loading project...
            </div>
        );
    }

    if (!project) {

        return (
            <div className="error-banner">
                {error || "Project not found"}
            </div>
        );
    }

    return (
        <div className="project-details">

            <div className="project-details-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Back
                    </button>

                    <h1>
                        {project.name}
                    </h1>

                    <p>
                        {project.description}
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        setShowCreateTask(true)
                    }
                >
                    + New Task
                </button>

            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            {showCreateTask && (

                <div className="task-create-panel">

                    <h2>
                        Create task
                    </h2>

                    <form
                        onSubmit={handleCreateTask}
                    >

                        <input
                            placeholder="Task title"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                        />

                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                        />

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

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowCreateTask(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                Create Task
                            </button>

                        </div>

                    </form>

                </div>
            )}

            <TaskBoard
                projectId={projectId}
                members={members}
            />

            <ProjectMembers
                projectId={projectId}
            />

        </div>
    );
}

