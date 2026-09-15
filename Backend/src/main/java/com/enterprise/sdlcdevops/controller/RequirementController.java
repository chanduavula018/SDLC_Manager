package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Requirement;
import com.enterprise.sdlcdevops.service.RequirementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.enterprise.sdlcdevops.service.ProjectService;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementService requirementService;
    private final ProjectService projectService;

    public RequirementController(
            RequirementService requirementService,
            ProjectService projectService) {

        this.requirementService = requirementService;
        this.projectService = projectService;
    }

    private boolean canManageRequirements(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "PROJECT_MANAGER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<Requirement>> getAllRequirements(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Requirement> all = requirementService.getAllRequirements();
        if (accessibleIds != null) {
            all = all.stream().filter(r -> accessibleIds.contains(r.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequirementById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        java.util.Optional<Requirement> reqOpt = requirementService.getRequirementById(id);
        if (reqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Requirement req = reqOpt.get();
        if (!projectService.isProjectAccessible(req.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to requirement in project ID: " + req.getProjectId()));
        }
        return ResponseEntity.ok(req);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getRequirementsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                requirementService
                        .getRequirementsByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<?> createRequirement(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Requirement requirement) {

        if (!canManageRequirements(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Requirement management is restricted to Administrators and Project Managers."));
        }

        return ResponseEntity.ok(
                requirementService
                        .createRequirement(requirement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequirement(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Requirement requirement) {

        if (!canManageRequirements(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Requirement management is restricted to Administrators and Project Managers."));
        }

        try {
            return ResponseEntity.ok(
                    requirementService
                            .updateRequirement(id, requirement));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequirement(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageRequirements(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Requirement deletion is restricted to Administrators and Project Managers."));
        }

        requirementService.deleteRequirement(id);

        return ResponseEntity.noContent().build();
    }
}