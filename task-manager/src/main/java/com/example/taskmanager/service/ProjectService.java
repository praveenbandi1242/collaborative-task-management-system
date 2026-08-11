package com.example.taskmanager.service;

import com.example.taskmanager.dto.project.CreateProjectRequest;
import com.example.taskmanager.dto.project.ProjectResponse;
import com.example.taskmanager.dto.project.UpdateProjectRequest;
import com.example.taskmanager.entity.Project;
import com.example.taskmanager.entity.ProjectMember;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.ProjectRole;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.exception.UnauthorizedException;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectResponse createProject(
            CreateProjectRequest request,
            String email
    ) {

        User owner = getUser(email);

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .owner(owner)
                .build();

        Project savedProject = projectRepository.save(project);

        ProjectMember ownerMembership = ProjectMember.builder()
                .project(savedProject)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build();

        projectMemberRepository.save(ownerMembership);

        return toResponse(savedProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects(String email) {

        User user = getUser(email);

        return projectRepository
                .findByOwnerId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(
            Long projectId,
            String email
    ) {

        User user = getUser(email);

        Project project = getProjectEntity(projectId);

        checkProjectAccess(project, user.getId());

        return toResponse(project);
    }

    public ProjectResponse updateProject(
            Long projectId,
            UpdateProjectRequest request,
            String email
    ) {

        User user = getUser(email);

        Project project = getProjectEntity(projectId);

        if (!project.getOwner().getId().equals(user.getId())) {
            throw new SecurityException(
                    "Only the project owner can update the project"
            );
        }

        project.setName(request.name());
        project.setDescription(request.description());

        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(
            Long projectId,
            String email
    ) {

        User user = getUser(email);

        Project project = getProjectEntity(projectId);

        if (!project.getOwner().getId().equals(user.getId())) {
            throw new SecurityException(
                    "Only the project owner can delete the project"
            );
        }

        projectRepository.delete(project);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    private Project getProjectEntity(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );
    }

    private ProjectResponse toResponse(Project project) {

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getOwner().getName(),
                project.getCreatedAt()
        );
    }

    private void checkProjectAccess(
            Project project,
            Long userId
    ) {

        if (project.getOwner().getId().equals(userId)) {
            return;
        }

        if (!projectMemberRepository
                .existsByProjectIdAndUserId(
                        project.getId(),
                        userId
                )) {

            throw new UnauthorizedException(
                    "You are not a member of this project"
            );
        }
    }
}