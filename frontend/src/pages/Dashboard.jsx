import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboard } from "../services/dashboardApi";

import "./Dashboard.css";

export default function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getDashboard();

            setDashboard(data);

        } catch (err) {

            console.error(
                "Dashboard loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard"
            );

        } finally {

            setLoading(false);
        }
    };

    /*
     * Calculate project progress based on
     * task status.
     *
     * TODO        = 0%
     * IN_PROGRESS = 50%
     * DONE        = 100%
     *
     * Example:
     *
     * 1 TODO + 1 IN_PROGRESS + 1 DONE
     * = (0 + 50 + 100) / 3
     * = 50%
     */
    const calculateProgress = (
        total,
        todo,
        inProgress,
        done
    ) => {

        if (!total || total === 0) {
            return 0;
        }

        return Math.round(
            (
                (
                    inProgress * 0.5 +
                    done
                ) /
                total
            ) * 100
        );
    };

    const getStatusLabel = (status) => {

        switch (status) {

            case "TODO":
                return "To Do";

            case "IN_PROGRESS":
                return "In Progress";

            case "DONE":
                return "Done";

            default:
                return status;
        }
    };

    const getPriorityClass = (priority) => {

        return `priority-${priority
            ?.toLowerCase()}`;
    };

    if (loading) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-loading">

                    <div className="loading-spinner" />

                    <p>
                        Loading your workspace...
                    </p>

                </div>

            </div>
        );
    }

    if (error) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-error">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={loadDashboard}
                    >
                        Try again
                    </button>

                </div>

            </div>
        );
    }

    const stats =
        dashboard?.stats;

    const projects =
        dashboard?.projects || [];

    const recentTasks =
        dashboard?.recentTasks || [];

    return (
        <div className="dashboard-page">

            <div className="dashboard-container">

                {/* Header */}

                <header className="dashboard-header">

                    <div>

                        <span className="dashboard-eyebrow">
                            WORKSPACE
                        </span>

                        <h1>
                            Your workspace
                        </h1>

                        <p>
                            Manage your projects and tasks.
                        </p>

                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        <span>+</span>
                        New Project
                    </button>

                </header>

                {/* Statistics */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            P
                        </div>

                        <div>
                            <span>
                                Projects
                            </span>

                            <strong>
                                {stats?.totalProjects ?? 0}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            T
                        </div>

                        <div>
                            <span>
                                Total Tasks
                            </span>

                            <strong>
                                {stats?.totalTasks ?? 0}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon todo">
                            ○
                        </div>

                        <div>
                            <span>
                                To Do
                            </span>

                            <strong>
                                {stats?.todoTasks ?? 0}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon progress">
                            ◐
                        </div>

                        <div>
                            <span>
                                In Progress
                            </span>

                            <strong>
                                {stats?.inProgressTasks ?? 0}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon done">
                            ✓
                        </div>

                        <div>
                            <span>
                                Completed
                            </span>

                            <strong>
                                {stats?.doneTasks ?? 0}
                            </strong>

                        </div>

                    </div>

                </section>

                <div className="dashboard-content">

                    {/* Projects */}

                    <section className="dashboard-section">

                        <div className="section-header">

                            <div>

                                <h2>
                                    Projects
                                </h2>

                                <p>
                                    Your active workspaces
                                </p>

                            </div>

                        </div>

                        {projects.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    +
                                </div>

                                <h3>
                                    No projects yet
                                </h3>

                                <p>
                                    Create your first project
                                    to get started.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate("/projects")
                                    }
                                >
                                    Create Project
                                </button>

                            </div>

                        ) : (

                            <div className="project-grid">

                                {projects.map(
                                    (project) => {

                                        /*
                                         * Calculate the progress
                                         * of this project.
                                         */
                                        const progress =
                                            calculateProgress(
                                                project.totalTasks,
                                                project.todoTasks,
                                                project.inProgressTasks,
                                                project.doneTasks
                                            );

                                        return (
                                            <article
                                                key={project.id}
                                                className="project-card"
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${project.id}`
                                                    )
                                                }
                                            >

                                                <div className="project-card-top">

                                                    <div className="project-avatar">
                                                        {project.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <span className="project-arrow">
                                                        →
                                                    </span>

                                                </div>

                                                <h3>
                                                    {project.name}
                                                </h3>

                                                <p>
                                                    {project.description ||
                                                        "No description provided."}
                                                </p>

                                                <div className="project-owner">
                                                    Owner ·{" "}
                                                    {project.ownerName}
                                                </div>

                                                <div className="project-progress">

                                                    <div className="progress-header">

                                                        <span>
                                                            Tasks
                                                        </span>

                                                        <strong>
                                                            {project.totalTasks}
                                                        </strong>

                                                    </div>

                                                    {/* Progress bar */}

                                                    <div className="progress-bar">

                                                        <div
                                                            className="progress-active"
                                                            style={{
                                                                width:
                                                                    `${progress}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <div className="project-counts">

                                                        <span>
                                                            {project.todoTasks}
                                                            {" "}to do
                                                        </span>

                                                        <span>
                                                            {project.inProgressTasks}
                                                            {" "}in progress
                                                        </span>

                                                        <span>
                                                            {project.doneTasks}
                                                            {" "}done
                                                        </span>

                                                    </div>

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </div>

                        )}

                    </section>

                    {/* Recent Tasks */}

                    <section className="dashboard-section recent-section">

                        <div className="section-header">

                            <div>

                                <h2>
                                    Recent tasks
                                </h2>

                                <p>
                                    Latest activity across your projects
                                </p>

                            </div>

                        </div>

                        {recentTasks.length === 0 ? (

                            <div className="empty-state compact">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No recent tasks
                                </h3>

                                <p>
                                    Tasks will appear here as
                                    you start working.
                                </p>

                            </div>

                        ) : (

                            <div className="recent-task-list">

                                {recentTasks.map(
                                    (task) => (

                                        <div
                                            key={task.id}
                                            className="recent-task"
                                            onClick={() =>
                                                navigate(
                                                    `/projects/${task.projectId}`
                                                )
                                            }
                                        >

                                            <div className="recent-task-main">

                                                <div
                                                    className={`status-dot ${task.status?.toLowerCase()}`}
                                                />

                                                <div>

                                                    <h3>
                                                        {task.title}
                                                    </h3>

                                                    <p>
                                                        {task.projectName}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="recent-task-meta">

                                                <span
                                                    className={`task-status ${task.status?.toLowerCase()}`}
                                                >
                                                    {getStatusLabel(
                                                        task.status
                                                    )}
                                                </span>

                                                <span
                                                    className={`task-priority ${getPriorityClass(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>

                                                {task.assigneeName && (

                                                    <span className="assignee">

                                                        <span className="mini-avatar">
                                                            {task.assigneeName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>

                                                        {task.assigneeName}

                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </div>

            </div>

        </div>
    );
}

