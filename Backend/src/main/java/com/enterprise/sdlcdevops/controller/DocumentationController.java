package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Documentation;
import com.enterprise.sdlcdevops.entity.Task;
import com.enterprise.sdlcdevops.repository.TaskRepository;
import com.enterprise.sdlcdevops.service.DocumentationService;
import com.enterprise.sdlcdevops.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/documentation")
public class DocumentationController {

    private final DocumentationService documentationService;
    private final ProjectService projectService;
    private final TaskRepository taskRepository;

    public DocumentationController(
            DocumentationService documentationService,
            ProjectService projectService,
            TaskRepository taskRepository) {

        this.documentationService = documentationService;
        this.projectService = projectService;
        this.taskRepository = taskRepository;
    }

    private boolean canManageDocumentation(String role) {
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
    public ResponseEntity<List<Documentation>> getAllDocuments(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        return ResponseEntity.ok(
                documentationService.getDocumentsForRole(userRole, userId, accessibleIds)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        Optional<Documentation> docOpt = documentationService.getDocumentById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Documentation doc = docOpt.get();
        Set<Long> accessibleProjectIds = projectService.getAccessibleProjectIds(userRole, userId);
        if (accessibleProjectIds != null) {
            if (doc.getTaskId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to document without assigned project task."));
            }
            Optional<Task> taskOpt = taskRepository.findById(doc.getTaskId());
            if (taskOpt.isEmpty() || !accessibleProjectIds.contains(taskOpt.get().getProjectId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to document."));
            }
        }
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getDocumentsByTaskId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long taskId) {

        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            if (!projectService.isProjectAccessible(taskOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to task ID: " + taskId));
            }
        }
        return ResponseEntity.ok(
                documentationService.getDocumentsByTaskId(taskId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createDocument(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody Documentation documentation) {

        if (!canManageDocumentation(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Managing documentation is restricted to Administrators, Project Managers, and Developers."));
        }

        return ResponseEntity.ok(
                documentationService
                        .createDocument(documentation)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody Documentation documentation) {

        if (!canManageDocumentation(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Managing documentation is restricted to Administrators, Project Managers, and Developers."));
        }

        try {
            return ResponseEntity.ok(
                    documentationService
                            .updateDocument(id, documentation)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageDocumentation(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting documentation is restricted to Administrators, Project Managers, and Developers."));
        }

        documentationService.deleteDocument(id);

        return ResponseEntity.noContent().build();
    }
}