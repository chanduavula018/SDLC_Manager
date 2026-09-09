package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Documentation;
import com.enterprise.sdlcdevops.service.DocumentationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documentation")
public class DocumentationController {

    private final DocumentationService documentationService;

    public DocumentationController(
            DocumentationService documentationService) {

        this.documentationService = documentationService;
    }

    @GetMapping
    public ResponseEntity<List<Documentation>> getAllDocuments() {
        return ResponseEntity.ok(
                documentationService.getAllDocuments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Documentation> getDocumentById(
            @PathVariable Long id) {

        return documentationService
                .getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Documentation>>
    getDocumentsByTaskId(
            @PathVariable Long taskId) {

        return ResponseEntity.ok(
                documentationService
                        .getDocumentsByTaskId(taskId)
        );
    }

    @PostMapping
    public ResponseEntity<Documentation> createDocument(
            @RequestBody Documentation documentation) {

        return ResponseEntity.ok(
                documentationService
                        .createDocument(documentation)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Documentation> updateDocument(
            @PathVariable Long id,
            @RequestBody Documentation documentation) {

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
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id) {

        documentationService.deleteDocument(id);

        return ResponseEntity.noContent().build();
    }
}