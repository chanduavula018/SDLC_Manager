package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Documentation;
import com.enterprise.sdlcdevops.entity.Task;
import com.enterprise.sdlcdevops.repository.DocumentationRepository;
import com.enterprise.sdlcdevops.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DocumentationService {

    private final DocumentationRepository documentationRepository;
    private final TaskRepository taskRepository;

    public DocumentationService(
            DocumentationRepository documentationRepository,
            TaskRepository taskRepository) {

        this.documentationRepository = documentationRepository;
        this.taskRepository = taskRepository;
    }

    public List<Documentation> getAllDocuments() {
        return documentationRepository.findAll();
    }

    public List<Documentation> getDocumentsForRole(String role, Long userId, Set<Long> accessibleProjectIds) {
        if (accessibleProjectIds == null) {
            return documentationRepository.findAll();
        }
        if (accessibleProjectIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<Task> allTasks = taskRepository.findAll();
        Set<Long> taskIds = allTasks.stream()
                .filter(t -> accessibleProjectIds.contains(t.getProjectId()))
                .map(Task::getTaskId)
                .collect(Collectors.toSet());
        if (taskIds.isEmpty()) {
            return Collections.emptyList();
        }
        return documentationRepository.findAll().stream()
                .filter(d -> d.getTaskId() != null && taskIds.contains(d.getTaskId()))
                .collect(Collectors.toList());
    }

    public Optional<Documentation> getDocumentById(Long documentId) {
        return documentationRepository.findById(documentId);
    }

    public List<Documentation> getDocumentsByTaskId(Long taskId) {
        return documentationRepository.findByTaskId(taskId);
    }

    public Documentation createDocument(
            Documentation documentation) {

        return documentationRepository.save(documentation);
    }

    public Documentation updateDocument(
            Long documentId,
            Documentation updatedDocumentation) {

        Documentation existingDocumentation =
                documentationRepository.findById(documentId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Documentation not found"));

        existingDocumentation.setTitle(
                updatedDocumentation.getTitle());

        existingDocumentation.setContent(
                updatedDocumentation.getContent());

        existingDocumentation.setCreatedDate(
                updatedDocumentation.getCreatedDate());

        existingDocumentation.setTaskId(
                updatedDocumentation.getTaskId());

        return documentationRepository.save(
                existingDocumentation);
    }

    public void deleteDocument(Long documentId) {
        documentationRepository.deleteById(documentId);
    }
}