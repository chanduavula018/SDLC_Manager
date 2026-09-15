package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Requirement;
import com.enterprise.sdlcdevops.entity.Task;
import com.enterprise.sdlcdevops.repository.RequirementRepository;
import com.enterprise.sdlcdevops.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.enterprise.sdlcdevops.service.ProjectService;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final RequirementRepository requirementRepository;
    private final ProjectService projectService;

    public TaskController(
            TaskService taskService,
            RequirementRepository requirementRepository,
            ProjectService projectService) {

        this.taskService = taskService;
        this.requirementRepository = requirementRepository;
        this.projectService = projectService;
    }

    private boolean canManageTasks(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "PROJECT_MANAGER".equals(normalized);
    }

    private boolean canUpdateTask(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "PROJECT_MANAGER".equals(normalized) || "DEVELOPER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<Task> all = taskService.getAllTasks();
        if (accessibleIds != null) {
            all = all.stream().filter(t -> accessibleIds.contains(t.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        java.util.Optional<Task> taskOpt = taskService.getTaskById(id);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!projectService.isProjectAccessible(task.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to task in project ID: " + task.getProjectId()));
        }
        return ResponseEntity.ok(task);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getTasksByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                taskService.getTasksByProjectId(projectId)
        );
    }

    @GetMapping("/requirement/{requirementId}")
    public ResponseEntity<?> getTasksByRequirementId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long requirementId) {

        Optional<Requirement> reqOpt = requirementRepository.findById(requirementId);
        if (reqOpt.isPresent()) {
            if (!projectService.isProjectAccessible(reqOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to requirement ID: " + requirementId));
            }
        }

        return ResponseEntity.ok(
                taskService.getTasksByRequirementId(requirementId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Task task) {

        if (!canManageTasks(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Creating tasks is restricted to Administrators and Project Managers."));
        }

        // Relationship Validation
        if (task.getRequirementId() != null && task.getRequirementId() > 0) {
            Optional<Requirement> req = requirementRepository.findById(task.getRequirementId());
            if (req.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Requirement does not exist."));
            }
            if (task.getProjectId() != null && !req.get().getProjectId().equals(task.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Requirement does not belong to the specified project."));
            }
        }

        return ResponseEntity.ok(
                taskService.createTask(task)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Task task) {

        if (!canUpdateTask(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Updating tasks is restricted to Administrators, Project Managers, and Developers."));
        }

        if (task.getRequirementId() != null && task.getRequirementId() > 0 && task.getProjectId() != null) {
            Optional<Requirement> req = requirementRepository.findById(task.getRequirementId());
            if (req.isPresent() && !req.get().getProjectId().equals(task.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Requirement does not belong to the specified project."));
            }
        }

        try {
            return ResponseEntity.ok(
                    taskService.updateTask(id, task)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageTasks(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting tasks is restricted to Administrators and Project Managers."));
        }

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }
}