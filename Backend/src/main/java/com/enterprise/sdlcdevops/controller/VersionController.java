package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Version;
import com.enterprise.sdlcdevops.service.VersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    @GetMapping
    public ResponseEntity<List<Version>> getAllVersions() {
        return ResponseEntity.ok(
                versionService.getAllVersions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Version> getVersionById(
            @PathVariable Long id) {

        return versionService.getVersionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Version>> getVersionsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                versionService.getVersionsByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<Version> createVersion(
            @RequestBody Version version) {

        return ResponseEntity.ok(
                versionService.createVersion(version)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Version> updateVersion(
            @PathVariable Long id,
            @RequestBody Version version) {

        try {
            return ResponseEntity.ok(
                    versionService.updateVersion(id, version)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(
            @PathVariable Long id) {

        versionService.deleteVersion(id);

        return ResponseEntity.noContent().build();
    }
}