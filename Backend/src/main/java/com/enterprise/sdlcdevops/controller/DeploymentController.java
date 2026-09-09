package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Deployment;
import com.enterprise.sdlcdevops.service.DeploymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deployments")
public class DeploymentController {

    private final DeploymentService deploymentService;

    public DeploymentController(
            DeploymentService deploymentService) {

        this.deploymentService = deploymentService;
    }

    @GetMapping
    public ResponseEntity<List<Deployment>> getAllDeployments() {
        return ResponseEntity.ok(
                deploymentService.getAllDeployments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deployment> getDeploymentById(
            @PathVariable Long id) {

        return deploymentService
                .getDeploymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Deployment>>
    getDeploymentsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                deploymentService
                        .getDeploymentsByProjectId(projectId)
        );
    }

    @GetMapping("/version/{versionId}")
    public ResponseEntity<List<Deployment>>
    getDeploymentsByVersionId(
            @PathVariable Long versionId) {

        return ResponseEntity.ok(
                deploymentService
                        .getDeploymentsByVersionId(versionId)
        );
    }

    @GetMapping("/build/{buildId}")
    public ResponseEntity<List<Deployment>>
    getDeploymentsByBuildId(
            @PathVariable Long buildId) {

        return ResponseEntity.ok(
                deploymentService
                        .getDeploymentsByBuildId(buildId)
        );
    }

    @GetMapping("/environment/{environmentId}")
    public ResponseEntity<List<Deployment>>
    getDeploymentsByEnvironmentId(
            @PathVariable Long environmentId) {

        return ResponseEntity.ok(
                deploymentService
                        .getDeploymentsByEnvironmentId(environmentId)
        );
    }

    @PostMapping
    public ResponseEntity<Deployment> createDeployment(
            @RequestBody Deployment deployment) {

        return ResponseEntity.ok(
                deploymentService.createDeployment(deployment)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deployment> updateDeployment(
            @PathVariable Long id,
            @RequestBody Deployment deployment) {

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
    public ResponseEntity<Void> deleteDeployment(
            @PathVariable Long id) {

        deploymentService.deleteDeployment(id);

        return ResponseEntity.noContent().build();
    }
}