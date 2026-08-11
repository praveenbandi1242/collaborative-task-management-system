package com.example.taskmanager.repository;

import com.example.taskmanager.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository
        extends JpaRepository<ProjectMember, Long> {

    boolean existsByProjectIdAndUserId(
            Long projectId,
            Long userId
    );

    Optional<ProjectMember> findByProjectIdAndUserId(
            Long projectId,
            Long userId
    );

    List<ProjectMember> findByProjectId(
            Long projectId
    );

    List<ProjectMember> findByUserId(
            Long userId
    );

    void deleteByProjectIdAndUserId(
            Long projectId,
            Long userId
    );

    Optional<ProjectMember> findByProjectIdAndUserEmail(
            Long projectId,
            String email
    );
}