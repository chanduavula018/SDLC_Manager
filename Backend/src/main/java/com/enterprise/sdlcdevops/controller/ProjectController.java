package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Project;
import com.enterprise.sdlcdevops.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // Get all projects
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // Get project by ID
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {

        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get projects by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Project>> getProjectsByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                projectService.getProjectsByUserId(userId)
        );
    }

    // Create project
    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody Project project) {

        return ResponseEntity.ok(
                projectService.createProject(project)
        );
    }

    // Update project
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @RequestBody Project project) {

        try {
            return ResponseEntity.ok(
                    projectService.updateProject(id, project)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id) {

        projectService.deleteProject(id);

        return ResponseEntity.noContent().build();
    }
}