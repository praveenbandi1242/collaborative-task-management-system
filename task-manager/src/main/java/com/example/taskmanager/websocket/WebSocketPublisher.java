package com.example.taskmanager.websocket;

import com.example.taskmanager.dto.task.TaskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishTaskCreated(
            Long projectId,
            TaskResponse task
    ) {

        publish(
                projectId,
                new TaskWebSocketEvent(
                        "TASK_CREATED",
                        task
                )
        );
    }

    public void publishTaskUpdated(
            Long projectId,
            TaskResponse task
    ) {

        publish(
                projectId,
                new TaskWebSocketEvent(
                        "TASK_UPDATED",
                        task
                )
        );
    }

    public void publishTaskStatusUpdated(
            Long projectId,
            TaskResponse task
    ) {

        publish(
                projectId,
                new TaskWebSocketEvent(
                        "TASK_STATUS_UPDATED",
                        task
                )
        );
    }

    public void publishTaskDeleted(
            Long projectId,
            Long taskId
    ) {

        TaskResponse deletedTask =
                new TaskResponse(
                        taskId,
                        null,
                        null,
                        null,
                        null,
                        projectId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                );

        publish(
                projectId,
                new TaskWebSocketEvent(
                        "TASK_DELETED",
                        deletedTask
                )
        );
    }

    private void publish(
            Long projectId,
            TaskWebSocketEvent event
    ) {

        messagingTemplate.convertAndSend(
                "/topic/projects/" + projectId,
                event
        );
    }
}