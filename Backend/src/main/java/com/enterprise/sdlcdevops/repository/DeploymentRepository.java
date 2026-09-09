package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeploymentRepository
        extends JpaRepository<Deployment, Long> {

    List<Deployment> findByProjectId(Long projectId);

    List<Deployment> findByVersionId(Long versionId);

    List<Deployment> findByBuildId(Long buildId);

    List<Deployment> findByEnvironmentId(Long environmentId);
}