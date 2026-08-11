package com.example.taskmanager.dto.task;

import com.example.taskmanager.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateTaskRequest(

        @NotBlank(message = "Task title is required")
        @Size(max = 200, message = "Task title cannot exceed 200 characters")
        String title,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description,

        TaskPriority priority,

        Long assigneeId,

        LocalDate dueDate
) {
}