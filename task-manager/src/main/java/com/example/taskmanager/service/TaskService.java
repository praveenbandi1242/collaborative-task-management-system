package com.example.taskmanager.service;

import com.example.taskmanager.dto.task.CreateTaskRequest;
import com.example.taskmanager.dto.task.TaskResponse;
import com.example.taskmanager.dto.task.UpdateTaskRequest;
import com.example.taskmanager.dto.task.UpdateTaskStatusRequest;
import com.example.taskmanager.entity.Project;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.TaskPriority;
import com.example.taskmanager.enums.TaskStatus;
import com.example.taskmanager.exception.BadRequestException;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.exception.UnauthorizedException;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.websocket.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final WebSocketPublisher webSocketPublisher;

    /*
     * ============================================================
     * CREATE TASK
     * ============================================================
     */
    public TaskResponse createTask(
            Long projectId,
            CreateTaskRequest request,
            String email
    ) {

        User currentUser = getUser(email);

        Project project = getProject(projectId);

        checkMembership(
                projectId,
                currentUser.getId()
        );

        User assignee = null;

        if (request.assigneeId() != null) {

            assignee = userRepository.findById(
                    request.assigneeId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Assignee not found"
                    )
            );

            checkMembership(
                    projectId,
                    assignee.getId()
            );
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .priority(
                        request.priority() != null
                                ? request.priority()
                                : TaskPriority.MEDIUM
                )
                .assignee(assignee)
                .project(project)
                .dueDate(request.dueDate())
                .build();

        Task savedTask =
                taskRepository.save(task);

        TaskResponse response =
                toResponse(savedTask);

        webSocketPublisher.publishTaskCreated(
                projectId,
                response
        );

        return response;
    }

    /*
     * ============================================================
     * GET PROJECT TASKS
     * ============================================================
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(
            Long projectId,
            String email
    ) {

        User user = getUser(email);

        getProject(projectId);

        checkProjectAccess(
                projectId,
                user.getId()
        );

        return taskRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * ============================================================
     * SEARCH TASKS
     * ============================================================
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> searchTasks(
            Long projectId,
            String search,
            String email
    ) {

        User currentUser = getUser(email);

        getProject(projectId);

        checkProjectAccess(
                projectId,
                currentUser.getId()
        );

        List<Task> tasks;

        if (search == null || search.isBlank()) {

            tasks = taskRepository
                    .findByProjectIdOrderByCreatedAtDesc(
                            projectId
                    );

        } else {

            tasks = taskRepository
                    .findByProjectIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
                            projectId,
                            search
                    );
        }

        return tasks.stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * ============================================================
     * GET TASK BY ID
     * ============================================================
     */
    public TaskResponse getTaskById(
            Long taskId,
            String email
    ) {

        User currentUser = getUser(email);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with id: " + taskId
                        )
                );

        checkProjectAccess(
                task.getProject().getId(),
                currentUser.getId()
        );

        return taskMapper.toResponse(task);
    }

    /*
     * ============================================================
     * GET TASKS BY STATUS
     * ============================================================
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByStatus(
            Long projectId,
            TaskStatus status,
            String email
    ) {

        User currentUser = getUser(email);

        getProject(projectId);

        checkProjectAccess(
                projectId,
                currentUser.getId()
        );

        return taskRepository
                .findByProjectIdAndStatusOrderByCreatedAtDesc(
                        projectId,
                        status
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * ============================================================
     * UPDATE TASK
     * ============================================================
     */
    public TaskResponse updateTask(
            Long taskId,
            UpdateTaskRequest request,
            String email
    ) {

        User currentUser = getUser(email);

        Task task = getTask(taskId);

        Long projectId =
                task.getProject().getId();

        checkProjectAccess(
                projectId,
                currentUser.getId()
        );

        if (request.title() != null) {
            task.setTitle(request.title());
        }

        if (request.description() != null) {
            task.setDescription(request.description());
        }

        if (request.priority() != null) {
            task.setPriority(request.priority());
        }

        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        if (request.assigneeId() != null) {

            User assignee =
                    userRepository
                            .findById(request.assigneeId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Assignee not found"
                                    )
                            );

            if (!projectMemberRepository
                    .existsByProjectIdAndUserId(
                            projectId,
                            assignee.getId()
                    )
                    &&
                    !task.getProject()
                            .getOwner()
                            .getId()
                            .equals(assignee.getId())) {

                throw new BadRequestException(
                        "Assignee is not a member of this project"
                );
            }

            task.setAssignee(assignee);
        }

        Task savedTask =
                taskRepository.save(task);

        TaskResponse response =
                toResponse(savedTask);

        webSocketPublisher.publishTaskUpdated(
                projectId,
                response
        );

        return response;
    }

    /*
     * ============================================================
     * UPDATE STATUS
     * ============================================================
     */
    public TaskResponse updateStatus(
            Long taskId,
            UpdateTaskStatusRequest request,
            String email
    ) {

        User currentUser = getUser(email);

        Task task = getTask(taskId);

        Long projectId =
                task.getProject().getId();

        checkProjectAccess(
                projectId,
                currentUser.getId()
        );

        task.setStatus(request.status());

        Task savedTask =
                taskRepository.save(task);

        TaskResponse response =
                toResponse(savedTask);

        webSocketPublisher.publishTaskStatusUpdated(
                projectId,
                response
        );

        return response;
    }

    /*
     * ============================================================
     * DELETE TASK
     * ============================================================
     */
    public void deleteTask(
            Long taskId,
            String email
    ) {

        User currentUser = getUser(email);

        Task task = getTask(taskId);

        Project project =
                task.getProject();

        Long projectId =
                project.getId();

        if (!project.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new UnauthorizedException(
                    "Only the project owner can delete tasks"
            );
        }

        taskRepository.delete(task);

        webSocketPublisher.publishTaskDeleted(
                projectId,
                taskId
        );
    }

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    private Project getProject(Long id) {

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );
    }

    private Task getTask(Long id) {

        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found"
                        )
                );
    }

    private void checkMembership(
            Long projectId,
            Long userId
    ) {

        boolean isOwner = projectRepository
                .findById(projectId)
                .map(project ->
                        project.getOwner()
                                .getId()
                                .equals(userId)
                )
                .orElse(false);

        if (isOwner) {
            return;
        }

        boolean isMember =
                projectMemberRepository
                        .existsByProjectIdAndUserId(
                                projectId,
                                userId
                        );

        if (!isMember) {
            throw new UnauthorizedException(
                    "You are not a member of this project"
            );
        }
    }

    /*
     * Owner automatically has access.
     * Project members also have access.
     */
    private void checkProjectAccess(
            Long projectId,
            Long userId
    ) {

        Project project = getProject(projectId);

        if (project.getOwner()
                .getId()
                .equals(userId)) {

            return;
        }

        if (!projectMemberRepository
                .existsByProjectIdAndUserId(
                        projectId,
                        userId
                )) {

            throw new UnauthorizedException(
                    "You are not a member of this project"
            );
        }
    }

    private TaskResponse toResponse(Task task) {

        Long assigneeId = null;
        String assigneeName = null;
        String assigneeEmail = null;

        if (task.getAssignee() != null) {

            assigneeId =
                    task.getAssignee().getId();

            assigneeName =
                    task.getAssignee().getName();

            assigneeEmail =
                    task.getAssignee().getEmail();
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getProject().getId(),
                assigneeId,
                assigneeName,
                assigneeEmail,
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}