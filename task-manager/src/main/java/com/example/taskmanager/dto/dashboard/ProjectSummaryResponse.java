package com.example.taskmanager.dto.dashboard;

public record ProjectSummaryResponse(
        Long id,
        String name,
        String description,
        String ownerName,
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long doneTasks
) {
}