package com.example.taskmanager.dto.task;

import com.example.taskmanager.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(

        @NotNull(message = "Status is required")
        TaskStatus status
) {
}