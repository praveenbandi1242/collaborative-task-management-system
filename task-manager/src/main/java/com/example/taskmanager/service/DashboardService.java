package com.example.taskmanager.service;

import com.example.taskmanager.dto.dashboard.DashboardResponse;
import com.example.taskmanager.dto.dashboard.DashboardStats;
import com.example.taskmanager.dto.dashboard.ProjectSummaryResponse;
import com.example.taskmanager.dto.dashboard.RecentTaskResponse;
import com.example.taskmanager.entity.Project;
import com.example.taskmanager.entity.ProjectMember;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.TaskStatus;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    public DashboardResponse getDashboard(
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        /*
         * Projects owned by the current user.
         */
        List<Project> ownedProjects =
                projectRepository
                        .findByOwnerIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        /*
         * Projects where the current user is a member.
         */
        List<ProjectMember> memberships =
                projectMemberRepository
                        .findByUserId(user.getId());

        /*
         * Use a Set so an owned project and a membership
         * don't produce duplicate projects.
         */
        Map<Long, Project> projectMap =
                new HashMap<>();

        for (Project project : ownedProjects) {
            projectMap.put(project.getId(), project);
        }

        for (ProjectMember membership : memberships) {

            Project project =
                    membership.getProject();

            projectMap.put(
                    project.getId(),
                    project
            );
        }

        List<Project> projects =
                new ArrayList<>(projectMap.values());

        projects.sort(
                Comparator.comparing(
                        Project::getCreatedAt,
                        Comparator.reverseOrder()
                )
        );

        long totalTasks = 0;
        long todoTasks = 0;
        long inProgressTasks = 0;
        long doneTasks = 0;

        List<ProjectSummaryResponse> projectSummaries =
                new ArrayList<>();

        for (Project project : projects) {

            long projectTotal =
                    taskRepository.countByProjectId(
                            project.getId()
                    );

            long projectTodo =
                    taskRepository.countByProjectIdAndStatus(
                            project.getId(),
                            TaskStatus.TODO
                    );

            long projectInProgress =
                    taskRepository.countByProjectIdAndStatus(
                            project.getId(),
                            TaskStatus.IN_PROGRESS
                    );

            long projectDone =
                    taskRepository.countByProjectIdAndStatus(
                            project.getId(),
                            TaskStatus.DONE
                    );

            totalTasks += projectTotal;
            todoTasks += projectTodo;
            inProgressTasks += projectInProgress;
            doneTasks += projectDone;

            projectSummaries.add(
                    new ProjectSummaryResponse(
                            project.getId(),
                            project.getName(),
                            project.getDescription(),
                            project.getOwner().getName(),
                            projectTotal,
                            projectTodo,
                            projectInProgress,
                            projectDone
                    )
            );
        }

        /*
         * Fetch recent tasks and only expose tasks belonging
         * to projects the current user can access.
         */
        Set<Long> accessibleProjectIds =
                new HashSet<>(projectMap.keySet());

        List<RecentTaskResponse> recentTasks =
                taskRepository
                        .findTop10ByOrderByCreatedAtDesc()
                        .stream()
                        .filter(task ->
                                accessibleProjectIds.contains(
                                        task.getProject().getId()
                                )
                        )
                        .limit(5)
                        .map(this::toRecentTaskResponse)
                        .toList();

        DashboardStats stats =
                new DashboardStats(
                        projects.size(),
                        totalTasks,
                        todoTasks,
                        inProgressTasks,
                        doneTasks
                );

        return new DashboardResponse(
                stats,
                projectSummaries,
                recentTasks
        );
    }

    private RecentTaskResponse toRecentTaskResponse(
            Task task
    ) {

        String assigneeName = null;

        if (task.getAssignee() != null) {
            assigneeName =
                    task.getAssignee().getName();
        }

        return new RecentTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getProject().getName(),
                task.getProject().getId(),
                task.getStatus(),
                task.getPriority(),
                assigneeName,
                task.getDueDate(),
                task.getCreatedAt()
        );
    }
}