import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { register as registerApi } from "../services/authApi";

export default function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();
        setError("");

        try {

            await registerApi({
                name,
                email,
                password
            });

            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="brand">
                    TaskFlow
                </div>

                <h1>Create your account</h1>

                <p>
                    Start collaborating with your team.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Your name"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="At least 6 characters"
                            minLength={6}
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-btn full-width"
                    >
                        Create account
                    </button>

                </form>

                <div className="auth-footer">

                    Already have an account?

                    <Link to="/login">
                        Sign in
                    </Link>

                </div>

            </div>

        </div>
    );
}