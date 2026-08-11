package com.example.taskmanager.controller;

import com.example.taskmanager.dto.project.AddProjectMemberRequest;
import com.example.taskmanager.dto.project.ProjectMemberResponse;
import com.example.taskmanager.service.ProjectMemberService;
import com.example.taskmanager.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<ProjectMemberResponse>> getMembers(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                projectMemberService.getMembers(
                        projectId,
                        securityUtil.getCurrentUserId()
                )
        );
    }

    @PostMapping
    public ResponseEntity<ProjectMemberResponse> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody AddProjectMemberRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        projectMemberService.addMember(
                                projectId,
                                request,
                                securityUtil.getCurrentUserId()
                        )
                );
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {

        projectMemberService.removeMember(
                projectId,
                userId,
                securityUtil.getCurrentUserId()
        );

        return ResponseEntity.noContent().build();
    }
}