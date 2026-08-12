import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboard } from "../services/dashboardApi";
import CreateProjectModal from "../components/CreateProjectModal";

import "./Dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateProject, setShowCreateProject] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDashboard();

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
        return `priority-${priority?.toLowerCase()}`;
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

    const stats = dashboard?.stats;

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
                            setShowCreateProject(true)
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

                        <div className="stat-icon completed">
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

                            <div className="empty-state-icon">
                                -
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
                                    setShowCreateProject(true)
                                }
                            >
                                Create Project
                            </button>

                        </div>

                    ) : (

                        <div className="projects-grid">

                            {projects.map((project) => {

                                const progress =
                                    calculateProgress(
                                        project.totalTasks,
                                        project.todoTasks,
                                        project.inProgressTasks,
                                        project.doneTasks
                                    );

                                return (
                                    <div
                                        key={project.id}
                                        className="project-card"
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project.id}`
                                            )
                                        }
                                    >

                                        <div className="project-card-header">

                                            <div>
                                                <h3>
                                                    {project.name}
                                                </h3>

                                                <p>
                                                    {project.description ||
                                                        "No description"}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="project-progress">

                                            <div className="progress-header">

                                                <span>
                                                    Progress
                                                </span>

                                                <strong>
                                                    {progress}%
                                                </strong>

                                            </div>

                                            <div className="progress-bar">

                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${progress}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                        <div className="project-card-footer">

                                            <span>
                                                {project.totalTasks ?? 0} tasks
                                            </span>

                                            <span>
                                                Open →
                                            </span>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </section>

                {/* Recent Tasks */}

                <section className="dashboard-section">

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

                        <div className="empty-state recent-tasks-empty">

                            <div className="empty-state-icon">
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

                        <div className="recent-tasks-list">

                            {recentTasks.map((task) => (

                                <div
                                    key={task.id}
                                    className="recent-task"
                                >

                                    <div className="recent-task-main">

                                        <h3>
                                            {task.title}
                                        </h3>

                                        <span>
                                            {task.projectName}
                                        </span>

                                    </div>

                                    <div className="recent-task-meta">

                                        <span
                                            className={`task-status status-${task.status?.toLowerCase()}`}
                                        >
                                            {getStatusLabel(
                                                task.status
                                            )}
                                        </span>

                                        {task.priority && (
                                            <span
                                                className={`task-priority ${getPriorityClass(
                                                    task.priority
                                                )}`}
                                            >
                                                {task.priority}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                </section>

            </div>

            {/* Create Project Modal */}

            {showCreateProject && (
                <CreateProjectModal
                    onClose={() =>
                        setShowCreateProject(false)
                    }
                    onCreated={() => {
                        setShowCreateProject(false);
                        loadDashboard();
                    }}
                />
            )}

        </div>
    );
}