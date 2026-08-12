import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/projects`;

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getProjects = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

export const getProject = async (projectId) => {
    const response = await axios.get(
        `${API_URL}/${projectId}`,
        getAuthConfig()
    );

    return response.data;
};

export const createProject = async (data) => {
    const response = await axios.post(
        API_URL,
        data,
        getAuthConfig()
    );

    return response.data;
};

export const updateProject = async (
    projectId,
    data
) => {

    const response = await axios.put(
        `${API_URL}/${projectId}`,
        data,
        getAuthConfig()
    );

    return response.data;
};

export const deleteProject = async (
    projectId
) => {

    await axios.delete(
        `${API_URL}/${projectId}`,
        getAuthConfig()
    );
};

export const getProjectMembers = async (projectId) => {
    const response = await axios.get(
        `${API_URL}/${projectId}/members`,
        getAuthConfig()
    );

    return response.data;
};

export const addProjectMember = async (
    projectId,
    email
) => {

    const response = await axios.post(
        `${API_URL}/${projectId}/members`,
        { email },
        getAuthConfig()
    );

    return response.data;
};

export const removeProjectMember = async (
    projectId,
    userId
) => {

    await axios.delete(
        `${API_URL}/${projectId}/members/${userId}`,
        getAuthConfig()
    );
};