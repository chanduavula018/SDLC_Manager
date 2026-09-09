package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Environment;
import com.enterprise.sdlcdevops.repository.EnvironmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnvironmentService {

    private final EnvironmentRepository environmentRepository;

    public EnvironmentService(
            EnvironmentRepository environmentRepository) {

        this.environmentRepository = environmentRepository;
    }

    public List<Environment> getAllEnvironments() {
        return environmentRepository.findAll();
    }

    public Optional<Environment> getEnvironmentById(
            Long environmentId) {

        return environmentRepository.findById(environmentId);
    }

    public List<Environment> getEnvironmentsByProjectId(
            Long projectId) {

        return environmentRepository.findByProjectId(projectId);
    }

    public Environment createEnvironment(
            Environment environment) {

        return environmentRepository.save(environment);
    }

    public Environment updateEnvironment(
            Long environmentId,
            Environment updatedEnvironment) {

        Environment existingEnvironment =
                environmentRepository.findById(environmentId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Environment not found"));

        existingEnvironment.setProjectId(
                updatedEnvironment.getProjectId());

        existingEnvironment.setEnvironmentName(
                updatedEnvironment.getEnvironmentName());

        existingEnvironment.setDescription(
                updatedEnvironment.getDescription());

        existingEnvironment.setStatus(
                updatedEnvironment.getStatus());

        return environmentRepository.save(existingEnvironment);
    }

    public void deleteEnvironment(Long environmentId) {
        environmentRepository.deleteById(environmentId);
    }
}