package com.example.taskmanager.mapper;

import com.example.taskmanager.dto.task.TaskResponse;
import com.example.taskmanager.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getProject().getId(),

                task.getAssignee() != null
                        ? task.getAssignee().getId()
                        : null,

                task.getAssignee() != null
                        ? task.getAssignee().getName()
                        : null,

                task.getAssignee() != null
                        ? task.getAssignee().getEmail()
                        : null,

                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}