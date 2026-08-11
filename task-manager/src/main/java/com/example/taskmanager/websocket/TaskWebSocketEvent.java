package com.example.taskmanager.websocket;

import com.example.taskmanager.dto.task.TaskResponse;

public record TaskWebSocketEvent(
        String type,
        TaskResponse task
) {
}