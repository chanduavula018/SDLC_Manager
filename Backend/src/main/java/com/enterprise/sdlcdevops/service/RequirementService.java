package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Requirement;
import com.enterprise.sdlcdevops.repository.RequirementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;

    public RequirementService(
            RequirementRepository requirementRepository) {

        this.requirementRepository = requirementRepository;
    }

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public Optional<Requirement> getRequirementById(Long requirementId) {
        return requirementRepository.findById(requirementId);
    }

    public List<Requirement> getRequirementsByProjectId(Long projectId) {
        return requirementRepository.findByProjectId(projectId);
    }

    public Requirement createRequirement(Requirement requirement) {
        return requirementRepository.save(requirement);
    }

    public Requirement updateRequirement(
            Long requirementId,
            Requirement updatedRequirement) {

        Requirement existingRequirement =
                requirementRepository.findById(requirementId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Requirement not found"));

        existingRequirement.setTitle(updatedRequirement.getTitle());
        existingRequirement.setDescription(
                updatedRequirement.getDescription());
        existingRequirement.setPriority(
                updatedRequirement.getPriority());
        existingRequirement.setStatus(
                updatedRequirement.getStatus());
        existingRequirement.setProjectId(
                updatedRequirement.getProjectId());

        return requirementRepository.save(existingRequirement);
    }

    public void deleteRequirement(Long requirementId) {
        requirementRepository.deleteById(requirementId);
    }
}