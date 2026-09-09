package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Build;
import com.enterprise.sdlcdevops.service.BuildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/builds")
public class BuildController {

    private final BuildService buildService;

    public BuildController(BuildService buildService) {
        this.buildService = buildService;
    }

    @GetMapping
    public ResponseEntity<List<Build>> getAllBuilds() {
        return ResponseEntity.ok(
                buildService.getAllBuilds()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Build> getBuildById(
            @PathVariable Long id) {

        return buildService.getBuildById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Build>> getBuildsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                buildService.getBuildsByProjectId(projectId)
        );
    }

    @GetMapping("/version/{versionId}")
    public ResponseEntity<List<Build>> getBuildsByVersionId(
            @PathVariable Long versionId) {

        return ResponseEntity.ok(
                buildService.getBuildsByVersionId(versionId)
        );
    }

    @PostMapping
    public ResponseEntity<Build> createBuild(
            @RequestBody Build build) {

        return ResponseEntity.ok(
                buildService.createBuild(build)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Build> updateBuild(
            @PathVariable Long id,
            @RequestBody Build build) {

        try {
            return ResponseEntity.ok(
                    buildService.updateBuild(id, build)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuild(
            @PathVariable Long id) {

        buildService.deleteBuild(id);

        return ResponseEntity.noContent().build();
    }
}