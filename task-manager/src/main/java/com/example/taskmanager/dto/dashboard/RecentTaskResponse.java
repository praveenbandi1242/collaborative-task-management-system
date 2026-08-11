package com.example.taskmanager.dto.dashboard;

import com.example.taskmanager.enums.TaskPriority;
import com.example.taskmanager.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RecentTaskResponse(
        Long id,
        String title,
        String projectName,
        Long projectId,
        TaskStatus status,
        TaskPriority priority,
        String assigneeName,
        LocalDate dueDate,
        LocalDateTime createdAt
) {
}