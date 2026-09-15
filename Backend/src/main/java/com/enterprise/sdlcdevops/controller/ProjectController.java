package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Project;
import com.enterprise.sdlcdevops.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private boolean canCreateOrModifyProjects(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "PROJECT_MANAGER".equals(normalized);
    }

    // Get all projects (role-aware)
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        return ResponseEntity.ok(projectService.getProjectsForRole(userRole, userId));
    }

    // Get project by ID (Enforces Data Isolation for CLIENT and restricted roles)
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        java.util.Optional<Project> projOpt = projectService.getProjectById(id);
        if (projOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!projectService.isProjectAccessible(id, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. You are not authorized to view project ID: " + id));
        }

        return ResponseEntity.ok(projOpt.get());
    }

    // Get projects by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Project>> getProjectsByUserId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long userId) {

        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }

    // Get client projects (Client Data Isolation)
    @GetMapping("/client/{userId}")
    public ResponseEntity<List<Project>> getClientProjects(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long userId) {

        return ResponseEntity.ok(projectService.getProjectsForRole(userRole, userId));
    }

    // Create project (Restricted to ADMIN and PROJECT_MANAGER)
    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Project project) {

        if (!canCreateOrModifyProjects(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to create projects."));
        }

        return ResponseEntity.ok(projectService.createProject(project));
    }

    // Update project (Restricted to ADMIN and PROJECT_MANAGER)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Project project) {

        if (!canCreateOrModifyProjects(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to edit projects."));
        }

        try {
            return ResponseEntity.ok(projectService.updateProject(id, project));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete project (Restricted to ADMIN and PROJECT_MANAGER)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canCreateOrModifyProjects(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to delete projects."));
        }

        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Get Project Members
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getProjectMembers(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectMembers(id));
    }

    // Add Project Member (Restricted to ADMIN and PROJECT_MANAGER)
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addProjectMember(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        if (!canCreateOrModifyProjects(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to manage project members."));
        }

        Object userIdObj = body.get("userId");
        if (userIdObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "userId is required."));
        }

        Long userId = Long.valueOf(userIdObj.toString());
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(projectService.addProjectMember(id, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Remove Project Member (Restricted to ADMIN and PROJECT_MANAGER)
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeProjectMember(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @PathVariable Long userId) {

        if (!canCreateOrModifyProjects(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to manage project members."));
        }

        try {
            projectService.removeProjectMember(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}