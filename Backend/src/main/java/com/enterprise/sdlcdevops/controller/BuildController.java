package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Build;
import com.enterprise.sdlcdevops.entity.Version;
import com.enterprise.sdlcdevops.repository.VersionRepository;
import com.enterprise.sdlcdevops.service.BuildService;
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
@RequestMapping("/api/builds")
public class BuildController {

    private final BuildService buildService;
    private final VersionRepository versionRepository;
    private final ProjectService projectService;

    public BuildController(BuildService buildService, VersionRepository versionRepository, ProjectService projectService) {
        this.buildService = buildService;
        this.versionRepository = versionRepository;
        this.projectService = projectService;
    }

    private boolean canManageBuilds(String role) {
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
    public ResponseEntity<List<Build>> getAllBuilds(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Build> all = buildService.getAllBuilds();
        if (accessibleIds != null) {
            all = all.stream().filter(b -> accessibleIds.contains(b.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBuildById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        Optional<Build> buildOpt = buildService.getBuildById(id);
        if (buildOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Build b = buildOpt.get();
        if (!projectService.isProjectAccessible(b.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to build in project ID: " + b.getProjectId()));
        }
        return ResponseEntity.ok(b);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getBuildsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                buildService.getBuildsByProjectId(projectId)
        );
    }

    @GetMapping("/version/{versionId}")
    public ResponseEntity<?> getBuildsByVersionId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long versionId) {

        Optional<Version> verOpt = versionRepository.findById(versionId);
        if (verOpt.isPresent()) {
            if (!projectService.isProjectAccessible(verOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to version ID: " + versionId));
            }
        }

        return ResponseEntity.ok(
                buildService.getBuildsByVersionId(versionId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createBuild(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Build build) {

        if (!canManageBuilds(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Build operations are restricted to Administrators and DevOps Engineers."));
        }

        // Relationship Validation
        if (build.getVersionId() != null && build.getVersionId() > 0) {
            Optional<Version> ver = versionRepository.findById(build.getVersionId());
            if (ver.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Version does not exist."));
            }
            if (build.getProjectId() != null && !ver.get().getProjectId().equals(build.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Version does not belong to the specified project."));
            }
        }

        return ResponseEntity.ok(
                buildService.createBuild(build)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBuild(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Build build) {

        if (!canManageBuilds(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Build operations are restricted to Administrators and DevOps Engineers."));
        }

        if (build.getVersionId() != null && build.getVersionId() > 0 && build.getProjectId() != null) {
            Optional<Version> ver = versionRepository.findById(build.getVersionId());
            if (ver.isPresent() && !ver.get().getProjectId().equals(build.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Version does not belong to the specified project."));
            }
        }

        try {
            return ResponseEntity.ok(
                    buildService.updateBuild(id, build)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBuild(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageBuilds(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting builds is restricted to Administrators and DevOps Engineers."));
        }

        buildService.deleteBuild(id);

        return ResponseEntity.noContent().build();
    }
}