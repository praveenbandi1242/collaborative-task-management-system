package com.example.taskmanager.service;

import com.example.taskmanager.dto.project.AddProjectMemberRequest;
import com.example.taskmanager.dto.project.ProjectMemberResponse;
import com.example.taskmanager.entity.Project;
import com.example.taskmanager.entity.ProjectMember;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.ProjectRole;
import com.example.taskmanager.exception.BadRequestException;
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
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectMemberResponse> getMembers(
            Long projectId,
            Long currentUserId
    ) {

        Project project = getProject(projectId);

        checkProjectAccess(project, currentUserId);

        return projectMemberRepository
                .findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectMemberResponse addMember(
            Long projectId,
            AddProjectMemberRequest request,
            Long currentUserId
    ) {

        Project project = getProject(projectId);

        checkOwner(project, currentUserId);

        User user = userRepository
                .findByEmail(request.email())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: "
                                        + request.email()
                        )
                );

        if (project.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "Project owner is already a member"
            );
        }

        if (projectMemberRepository.existsByProjectIdAndUserId(
                projectId,
                user.getId()
        )) {

            throw new BadRequestException(
                    "User is already a project member"
            );
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectRole.MEMBER)
                .build();

        return toResponse(
                projectMemberRepository.save(member)
        );
    }

    public void removeMember(
            Long projectId,
            Long userId,
            Long currentUserId
    ) {

        Project project = getProject(projectId);

        checkOwner(project, currentUserId);

        if (project.getOwner().getId().equals(userId)) {
            throw new BadRequestException(
                    "Project owner cannot be removed"
            );
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(
                projectId,
                userId
        )) {

            throw new ResourceNotFoundException(
                    "Project member not found"
            );
        }

        projectMemberRepository.deleteByProjectIdAndUserId(
                projectId,
                userId
        );
    }

    private Project getProject(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with id: "
                                        + projectId
                        )
                );
    }

    private void checkProjectAccess(
            Project project,
            Long userId
    ) {

        if (project.getOwner().getId().equals(userId)) {
            return;
        }

        boolean member =
                projectMemberRepository
                        .existsByProjectIdAndUserId(
                                project.getId(),
                                userId
                        );

        if (!member) {
            throw new UnauthorizedException(
                    "You are not a member of this project"
            );
        }
    }

    private void checkOwner(
            Project project,
            Long userId
    ) {

        if (!project.getOwner().getId().equals(userId)) {

            throw new UnauthorizedException(
                    "Only the project owner can perform this action"
            );
        }
    }

    private ProjectMemberResponse toResponse(
            ProjectMember member
    ) {

        return new ProjectMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getRole().name()
        );
    }
}