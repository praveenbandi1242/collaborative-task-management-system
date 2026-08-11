package com.example.taskmanager.dto.project;

public record ProjectMemberResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String role
) {
}