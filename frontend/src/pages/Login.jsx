import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login as loginApi } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

export default function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();
        setError("");

        try {

            const response = await loginApi({
                email,
                password
            });

            login(response.data.token);

            navigate("/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="brand">
                    TaskFlow
                </div>

                <h1>Welcome back</h1>

                <p>
                    Sign in to continue to your workspace.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

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
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="primary-btn full-width"
                    >
                        Sign in
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>

            </div>

        </div>
    );
}