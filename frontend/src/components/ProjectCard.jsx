import { useNavigate } from "react-router-dom";

export default function ProjectCard({
    project
}) {

    const navigate = useNavigate();

    return (
        <div
            className="project-card"
            onClick={() =>
                navigate(`/projects/${project.id}`)
            }
        >

            <div className="project-card-top">

                <div className="project-icon">
                    {project.name
                        .charAt(0)
                        .toUpperCase()}
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
                    "No description provided"}
            </p>

            <div className="project-card-footer">

                <span>
                    Owner
                </span>

                <strong>
                    {project.ownerName}
                </strong>

            </div>

        </div>
    );
}