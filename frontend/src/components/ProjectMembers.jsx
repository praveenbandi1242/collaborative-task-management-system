import { useEffect, useState } from "react";
import {
    addProjectMember,
    getProjectMembers,
    removeProjectMember
} from "../services/projectApi";

export default function ProjectMembers({
    projectId
}) {

    const [members, setMembers] = useState([]);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadMembers = async () => {

        try {

            const data =
                await getProjectMembers(projectId);

            setMembers(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load members"
            );
        }
    };

    useEffect(() => {
        loadMembers();
    }, [projectId]);

    const handleAdd = async (e) => {

        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            await addProjectMember(
                projectId,
                email
            );

            setEmail("");

            await loadMembers();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to add member"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId) => {

        try {

            await removeProjectMember(
                projectId,
                userId
            );

            await loadMembers();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to remove member"
            );
        }
    };

    return (
        <section className="project-members">

            <div className="section-header">
                <div>
                    <h2>Members</h2>
                    <p>
                        Collaborators working on this project
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleAdd}
                className="member-form"
            >

                <input
                    type="email"
                    placeholder="Enter user's email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add member"}
                </button>

            </form>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <div className="members-list">

                {members.map((member) => (

                    <div
                        className="member-row"
                        key={member.id}
                    >

                        <div className="member-avatar">
                            {member.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="member-info">

                            <strong>
                                {member.name}
                            </strong>

                            <span>
                                {member.email}
                            </span>

                        </div>

                        <span className="member-role">
                            {member.role}
                        </span>

                        {member.role !== "OWNER" && (
                            <button
                                onClick={() =>
                                    handleRemove(
                                        member.userId
                                    )
                                }
                            >
                                Remove
                            </button>
                        )}

                    </div>

                ))}

            </div>

        </section>
    );
}