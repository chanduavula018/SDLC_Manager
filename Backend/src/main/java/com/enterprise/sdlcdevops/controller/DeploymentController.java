package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Build;
import com.enterprise.sdlcdevops.entity.Deployment;
import com.enterprise.sdlcdevops.entity.Environment;
import com.enterprise.sdlcdevops.entity.Version;
import com.enterprise.sdlcdevops.repository.BuildRepository;
import com.enterprise.sdlcdevops.repository.EnvironmentRepository;
import com.enterprise.sdlcdevops.repository.VersionRepository;
import com.enterprise.sdlcdevops.service.DeploymentService;
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
@RequestMapping("/api/deployments")
public class DeploymentController {

    private final DeploymentService deploymentService;
    private final VersionRepository versionRepository;
    private final BuildRepository buildRepository;
    private final EnvironmentRepository environmentRepository;
    private final ProjectService projectService;

    public DeploymentController(
            DeploymentService deploymentService,
            VersionRepository versionRepository,
            BuildRepository buildRepository,
            EnvironmentRepository environmentRepository,
            ProjectService projectService) {

        this.deploymentService = deploymentService;
        this.versionRepository = versionRepository;
        this.buildRepository = buildRepository;
        this.environmentRepository = environmentRepository;
        this.projectService = projectService;
    }

    private boolean canManageDeployments(String role) {
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
    public ResponseEntity<List<Deployment>> getAllDeployments(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Deployment> all = deploymentService.getAllDeployments();
        if (accessibleIds != null) {
            all = all.stream().filter(d -> accessibleIds.contains(d.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDeploymentById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        Optional<Deployment> depOpt = deploymentService.getDeploymentById(id);
        if (depOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Deployment d = depOpt.get();
        if (!projectService.isProjectAccessible(d.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to deployment in project ID: " + d.getProjectId()));
        }
        return ResponseEntity.ok(d);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getDeploymentsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                deploymentService.getDeploymentsByProjectId(projectId)
        );
    }

    @GetMapping("/version/{versionId}")
    public ResponseEntity<?> getDeploymentsByVersionId(
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
                deploymentService.getDeploymentsByVersionId(versionId)
        );
    }

    @GetMapping("/build/{buildId}")
    public ResponseEntity<?> getDeploymentsByBuildId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long buildId) {

        Optional<Build> bdOpt = buildRepository.findById(buildId);
        if (bdOpt.isPresent()) {
            if (!projectService.isProjectAccessible(bdOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to build ID: " + buildId));
            }
        }

        return ResponseEntity.ok(
                deploymentService.getDeploymentsByBuildId(buildId)
        );
    }

    @GetMapping("/environment/{environmentId}")
    public ResponseEntity<?> getDeploymentsByEnvironmentId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long environmentId) {

        Optional<Environment> envOpt = environmentRepository.findById(environmentId);
        if (envOpt.isPresent()) {
            if (!projectService.isProjectAccessible(envOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to environment ID: " + environmentId));
            }
        }

        return ResponseEntity.ok(
                deploymentService.getDeploymentsByEnvironmentId(environmentId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createDeployment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Deployment deployment) {

        if (!canManageDeployments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deployment operations are restricted to Administrators and DevOps Engineers."));
        }

        // Relationship Validations
        if (deployment.getProjectId() != null) {
            Long projId = deployment.getProjectId();
            
            if (deployment.getVersionId() != null && deployment.getVersionId() > 0) {
                Optional<Version> ver = versionRepository.findById(deployment.getVersionId());
                if (ver.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Version does not exist."));
                }
                if (!ver.get().getProjectId().equals(projId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Version does not belong to the specified project."));
                }
            }

            if (deployment.getBuildId() != null && deployment.getBuildId() > 0) {
                Optional<Build> bd = buildRepository.findById(deployment.getBuildId());
                if (bd.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Build does not exist."));
                }
                if (!bd.get().getProjectId().equals(projId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Build does not belong to the specified project."));
                }
            }

            if (deployment.getEnvironmentId() != null && deployment.getEnvironmentId() > 0) {
                Optional<Environment> env = environmentRepository.findById(deployment.getEnvironmentId());
                if (env.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Environment does not exist."));
                }
                if (!env.get().getProjectId().equals(projId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Selected Environment does not belong to the specified project."));
                }
            }
        }

        return ResponseEntity.ok(
                deploymentService.createDeployment(deployment)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeployment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Deployment deployment) {

        if (!canManageDeployments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deployment operations are restricted to Administrators and DevOps Engineers."));
        }

        try {
            return ResponseEntity.ok(
                    deploymentService
                            .updateDeployment(id, deployment)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeployment(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageDeployments(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting deployments is restricted to Administrators and DevOps Engineers."));
        }

        deploymentService.deleteDeployment(id);

        return ResponseEntity.noContent().build();
    }
}