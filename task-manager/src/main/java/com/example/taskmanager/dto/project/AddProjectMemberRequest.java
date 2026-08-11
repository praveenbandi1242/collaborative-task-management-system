package com.example.taskmanager.dto.project;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddProjectMemberRequest(

        @NotBlank
        @Email
        String email
) {
}