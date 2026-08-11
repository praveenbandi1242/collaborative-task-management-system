import axios from "axios";

const API_URL =
    "http://localhost:8080/api";

const getAuthConfig = () => ({
    headers: {
        Authorization:
            `Bearer ${localStorage.getItem("token")}`
    }
});

export const getDashboard = async () => {

    const response = await axios.get(
        `${API_URL}/dashboard`,
        getAuthConfig()
    );

    return response.data;
};