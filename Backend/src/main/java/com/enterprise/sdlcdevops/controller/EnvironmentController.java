package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Environment;
import com.enterprise.sdlcdevops.service.EnvironmentService;
import com.enterprise.sdlcdevops.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/environments")
public class EnvironmentController {

    private final EnvironmentService environmentService;
    private final ProjectService projectService;

    public EnvironmentController(
            EnvironmentService environmentService,
            ProjectService projectService) {

        this.environmentService = environmentService;
        this.projectService = projectService;
    }

    private boolean canManageEnvironments(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "DEVOPS_ENGINEER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<Environment>> getAllEnvironments(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Environment> all = environmentService.getAllEnvironments();
        if (accessibleIds != null) {
            all = all.stream().filter(e -> accessibleIds.contains(e.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEnvironmentById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        Optional<Environment> envOpt = environmentService.getEnvironmentById(id);
        if (envOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Environment env = envOpt.get();
        if (!projectService.isProjectAccessible(env.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to environment in project ID: " + env.getProjectId()));
        }
        return ResponseEntity.ok(env);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getEnvironmentsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                environmentService.getEnvironmentsByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createEnvironment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Environment environment) {

        if (!canManageEnvironments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Environment management is restricted to Administrators and DevOps Engineers."));
        }

        return ResponseEntity.ok(
                environmentService
                        .createEnvironment(environment)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEnvironment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Environment environment) {

        if (!canManageEnvironments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Environment management is restricted to Administrators and DevOps Engineers."));
        }

        try {
            return ResponseEntity.ok(
                    environmentService
                            .updateEnvironment(id, environment)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnvironment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageEnvironments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting environments is restricted to Administrators and DevOps Engineers."));
        }

        environmentService.deleteEnvironment(id);

        return ResponseEntity.noContent().build();
    }
}