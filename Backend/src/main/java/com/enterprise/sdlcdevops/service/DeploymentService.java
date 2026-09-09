package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Deployment;
import com.enterprise.sdlcdevops.repository.DeploymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;

    public DeploymentService(
            DeploymentRepository deploymentRepository) {

        this.deploymentRepository = deploymentRepository;
    }

    public List<Deployment> getAllDeployments() {
        return deploymentRepository.findAll();
    }

    public Optional<Deployment> getDeploymentById(
            Long deploymentId) {

        return deploymentRepository.findById(deploymentId);
    }

    public List<Deployment> getDeploymentsByProjectId(
            Long projectId) {

        return deploymentRepository.findByProjectId(projectId);
    }

    public List<Deployment> getDeploymentsByVersionId(
            Long versionId) {

        return deploymentRepository.findByVersionId(versionId);
    }

    public List<Deployment> getDeploymentsByBuildId(
            Long buildId) {

        return deploymentRepository.findByBuildId(buildId);
    }

    public List<Deployment> getDeploymentsByEnvironmentId(
            Long environmentId) {

        return deploymentRepository.findByEnvironmentId(environmentId);
    }

    public Deployment createDeployment(
            Deployment deployment) {

        return deploymentRepository.save(deployment);
    }

    public Deployment updateDeployment(
            Long deploymentId,
            Deployment updatedDeployment) {

        Deployment existingDeployment =
                deploymentRepository.findById(deploymentId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Deployment not found"));

        existingDeployment.setDeploymentDate(
                updatedDeployment.getDeploymentDate());

        existingDeployment.setStatus(
                updatedDeployment.getStatus());

        existingDeployment.setProjectId(
                updatedDeployment.getProjectId());

        existingDeployment.setVersionId(
                updatedDeployment.getVersionId());

        existingDeployment.setBuildId(
                updatedDeployment.getBuildId());

        existingDeployment.setEnvironmentId(
                updatedDeployment.getEnvironmentId());

        return deploymentRepository.save(existingDeployment);
    }

    public void deleteDeployment(Long deploymentId) {
        deploymentRepository.deleteById(deploymentId);
    }
}