import { useState } from "react";
import { createProject } from "../services/projectApi";

export default function CreateProjectModal({
    onClose,
    onCreated
}) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!name.trim()) {
            setError("Project name is required");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const project = await createProject({
                name,
                description
            });

            onCreated(project);
            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to create project"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">

            <div className="modal">

                <div className="modal-header">

                    <div>
                        <h2>Create project</h2>
                        <p>
                            Start organizing work with your team.
                        </p>
                    </div>

                    <button
                        className="icon-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <label>
                        Project name
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Website Redesign"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <label>
                        Description
                    </label>

                    <textarea
                        placeholder="What is this project about?"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create project"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}