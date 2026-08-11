package com.example.taskmanager.repository;

import com.example.taskmanager.entity.Task;
import com.example.taskmanager.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Task> findByProjectIdAndStatusOrderByCreatedAtDesc(
            Long projectId,
            TaskStatus status
    );

    List<Task> findByProjectIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
            Long projectId,
            String title
    );

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(
            Long projectId,
            TaskStatus status
    );

    List<Task> findTop10ByOrderByCreatedAtDesc();
}