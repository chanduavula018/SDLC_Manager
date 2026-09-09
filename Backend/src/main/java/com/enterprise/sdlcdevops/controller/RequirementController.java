package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Requirement;
import com.enterprise.sdlcdevops.service.RequirementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementService requirementService;

    public RequirementController(
            RequirementService requirementService) {

        this.requirementService = requirementService;
    }

    @GetMapping
    public ResponseEntity<List<Requirement>> getAllRequirements() {
        return ResponseEntity.ok(
                requirementService.getAllRequirements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Requirement> getRequirementById(
            @PathVariable Long id) {

        return requirementService.getRequirementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Requirement>>
    getRequirementsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                requirementService
                        .getRequirementsByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<Requirement> createRequirement(
            @RequestBody Requirement requirement) {

        return ResponseEntity.ok(
                requirementService
                        .createRequirement(requirement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Requirement> updateRequirement(
            @PathVariable Long id,
            @RequestBody Requirement requirement) {

        try {
            return ResponseEntity.ok(
                    requirementService
                            .updateRequirement(id, requirement));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequirement(
            @PathVariable Long id) {

        requirementService.deleteRequirement(id);

        return ResponseEntity.noContent().build();
    }
}