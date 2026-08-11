package com.example.taskmanager.controller;

import com.example.taskmanager.dto.task.CreateTaskRequest;
import com.example.taskmanager.dto.task.TaskResponse;
import com.example.taskmanager.dto.task.UpdateTaskRequest;
import com.example.taskmanager.dto.task.UpdateTaskStatusRequest;
import com.example.taskmanager.enums.TaskStatus;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /*
     * ============================================================
     * CREATE TASK
     * POST /api/projects/{projectId}/tasks
     * ============================================================
     */
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        taskService.createTask(
                                projectId,
                                request,
                                authentication.getName()
                        )
                );
    }

    /*
     * ============================================================
     * GET PROJECT TASKS
     * GET /api/projects/{projectId}/tasks
     * ============================================================
     */
    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.getProjectTasks(
                        projectId,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * SEARCH PROJECT TASKS
     * GET /api/projects/{projectId}/tasks/search
     * ============================================================
     */
    @GetMapping("/project/{projectId}/search")
    public ResponseEntity<List<TaskResponse>> searchTasks(
            @PathVariable Long projectId,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.searchTasks(
                        projectId,
                        search,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * GET TASK BY ID
     * GET /api/tasks/{taskId}
     * ============================================================
     */
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long taskId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.getTaskById(
                        taskId,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * GET TASKS BY STATUS
     * GET /api/projects/{projectId}/tasks/status/{status}
     * ============================================================
     */
    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @PathVariable Long projectId,
            @PathVariable TaskStatus status,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.getTasksByStatus(
                        projectId,
                        status,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * UPDATE TASK
     * PUT /api/tasks/{taskId}
     * ============================================================
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.updateTask(
                        taskId,
                        request,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * UPDATE TASK STATUS
     * PATCH /api/tasks/{taskId}/status
     * ============================================================
     */
    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                taskService.updateStatus(
                        taskId,
                        request,
                        authentication.getName()
                )
        );
    }

    /*
     * ============================================================
     * DELETE TASK
     * DELETE /api/tasks/{taskId}
     * ============================================================
     */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {

        taskService.deleteTask(
                taskId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}