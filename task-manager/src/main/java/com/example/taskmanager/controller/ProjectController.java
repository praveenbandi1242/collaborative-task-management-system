package com.example.taskmanager.controller;

import com.example.taskmanager.dto.project.CreateProjectRequest;
import com.example.taskmanager.dto.project.ProjectResponse;
import com.example.taskmanager.dto.project.UpdateProjectRequest;
import com.example.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectService.createProject(
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService.getMyProjects(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService.getProject(
                        projectId,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                projectService.updateProject(
                        projectId,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        projectService.deleteProject(
                projectId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}