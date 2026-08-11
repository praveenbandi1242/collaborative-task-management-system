import axios from "axios";

const API_URL =
    "http://localhost:8080/api";

const getAuthConfig = () => ({
    headers: {
        Authorization:
            `Bearer ${localStorage.getItem("token")}`
    }
});


/*
 * ============================
 * PROJECT TASKS
 * ============================
 */

export const getProjectTasks = async (
    projectId
) => {

    const response = await axios.get(
        `${API_URL}/projects/${projectId}/tasks`,
        getAuthConfig()
    );

    return response.data;
};


/*
 * ============================
 * CREATE TASK
 * ============================
 */

export const createTask = async (
    projectId,
    data
) => {

    const response = await axios.post(
        `${API_URL}/projects/${projectId}/tasks`,
        data,
        getAuthConfig()
    );

    return response.data;
};


/*
 * ============================
 * GET TASK BY ID
 * ============================
 */

export const getTask = async (
    taskId
) => {

    const response = await axios.get(
        `${API_URL}/tasks/${taskId}`,
        getAuthConfig()
    );

    return response.data;
};


/*
 * ============================
 * UPDATE TASK
 * ============================
 */

export const updateTask = async (
    taskId,
    data
) => {

    const response = await axios.put(
        `${API_URL}/tasks/${taskId}`,
        data,
        getAuthConfig()
    );

    return response.data;
};


/*
 * ============================
 * UPDATE TASK STATUS
 * ============================
 */

export const updateTaskStatus = async (
    taskId,
    status
) => {

    const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        {
            status
        },
        getAuthConfig()
    );

    return response.data;
};


/*
 * ============================
 * DELETE TASK
 * ============================
 */

export const deleteTask = async (
    taskId
) => {

    await axios.delete(
        `${API_URL}/tasks/${taskId}`,
        getAuthConfig()
    );
};


/*
 * ============================
 * SEARCH PROJECT TASKS
 * ============================
 *
 * Backend:
 *
 * GET /api/project/{projectId}/search
 *
 */

export const searchProjectTasks = async (
    projectId,
    search
) => {

    const response = await axios.get(
        `${API_URL}/project/${projectId}/search`,
        {
            ...getAuthConfig(),

            params: {
                search
            }
        }
    );

    return response.data;
};


/*
 * ============================
 * GET TASKS BY STATUS
 * ============================
 *
 * Backend:
 *
 * GET /api/project/{projectId}/status/{status}
 *
 */

export const getTasksByStatus = async (
    projectId,
    status
) => {

    const response = await axios.get(
        `${API_URL}/project/${projectId}/status/${status}`,
        getAuthConfig()
    );

    return response.data;
};

