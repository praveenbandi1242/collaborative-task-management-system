package com.example.taskmanager.dto.dashboard;

public record DashboardStats(
        long totalProjects,
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long doneTasks
) {
}