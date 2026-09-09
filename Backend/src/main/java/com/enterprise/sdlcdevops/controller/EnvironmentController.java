package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Environment;
import com.enterprise.sdlcdevops.service.EnvironmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/environments")
public class EnvironmentController {

    private final EnvironmentService environmentService;

    public EnvironmentController(
            EnvironmentService environmentService) {

        this.environmentService = environmentService;
    }

    @GetMapping
    public ResponseEntity<List<Environment>> getAllEnvironments() {
        return ResponseEntity.ok(
                environmentService.getAllEnvironments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Environment> getEnvironmentById(
            @PathVariable Long id) {

        return environmentService
                .getEnvironmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Environment>>
    getEnvironmentsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                environmentService
                        .getEnvironmentsByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<Environment> createEnvironment(
            @RequestBody Environment environment) {

        return ResponseEntity.ok(
                environmentService
                        .createEnvironment(environment)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Environment> updateEnvironment(
            @PathVariable Long id,
            @RequestBody Environment environment) {

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
    public ResponseEntity<Void> deleteEnvironment(
            @PathVariable Long id) {

        environmentService.deleteEnvironment(id);

        return ResponseEntity.noContent().build();
    }
}