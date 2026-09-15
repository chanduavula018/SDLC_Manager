package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Version;
import com.enterprise.sdlcdevops.service.ProjectService;
import com.enterprise.sdlcdevops.service.VersionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/versions")
public class VersionController {

    private final VersionService versionService;
    private final ProjectService projectService;

    public VersionController(VersionService versionService, ProjectService projectService) {
        this.versionService = versionService;
        this.projectService = projectService;
    }

    private boolean canManageVersions(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "PROJECT_MANAGER".equals(normalized) || "DEVOPS_ENGINEER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<Version>> getAllVersions(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Version> all = versionService.getAllVersions();
        if (accessibleIds != null) {
            all = all.stream().filter(v -> accessibleIds.contains(v.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVersionById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        Optional<Version> verOpt = versionService.getVersionById(id);
        if (verOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Version v = verOpt.get();
        if (!projectService.isProjectAccessible(v.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to version in project ID: " + v.getProjectId()));
        }
        return ResponseEntity.ok(v);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getVersionsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                versionService.getVersionsByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createVersion(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Version version) {

        if (!canManageVersions(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Version management is restricted to Administrators, Project Managers, and DevOps Engineers."));
        }

        return ResponseEntity.ok(
                versionService.createVersion(version)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVersion(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Version version) {

        if (!canManageVersions(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Version management is restricted to Administrators, Project Managers, and DevOps Engineers."));
        }

        try {
            return ResponseEntity.ok(
                    versionService.updateVersion(id, version)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVersion(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageVersions(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting versions is restricted to Administrators, Project Managers, and DevOps Engineers."));
        }

        versionService.deleteVersion(id);

        return ResponseEntity.noContent().build();
    }
}