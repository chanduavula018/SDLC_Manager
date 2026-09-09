package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Documentation;
import com.enterprise.sdlcdevops.repository.DocumentationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentationService {

    private final DocumentationRepository documentationRepository;

    public DocumentationService(
            DocumentationRepository documentationRepository) {

        this.documentationRepository = documentationRepository;
    }

    public List<Documentation> getAllDocuments() {
        return documentationRepository.findAll();
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