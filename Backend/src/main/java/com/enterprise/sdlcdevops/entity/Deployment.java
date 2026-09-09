package com.enterprise.sdlcdevops.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deployments")
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deployment_id")
    private Long deploymentId;

    @Column(name = "deployment_date")
    private LocalDateTime deploymentDate;

    @Column(name = "status")
    private String status;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "build_id")
    private Long buildId;

    @Column(name = "environment_id")
    private Long environmentId;

    public Deployment() {
    }

    public Deployment(
            LocalDateTime deploymentDate,
            String status,
            Long projectId,
            Long versionId,
            Long buildId,
            Long environmentId) {

        this.deploymentDate = deploymentDate;
        this.status = status;
        this.projectId = projectId;
        this.versionId = versionId;
        this.buildId = buildId;
        this.environmentId = environmentId;
    }

    public Long getDeploymentId() {
        return deploymentId;
    }

    public void setDeploymentId(Long deploymentId) {
        this.deploymentId = deploymentId;
    }

    public LocalDateTime getDeploymentDate() {
        return deploymentDate;
    }

    public void setDeploymentDate(LocalDateTime deploymentDate) {
        this.deploymentDate = deploymentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public Long getBuildId() {
        return buildId;
    }

    public void setBuildId(Long buildId) {
        this.buildId = buildId;
    }

    public Long getEnvironmentId() {
        return environmentId;
    }

    public void setEnvironmentId(Long environmentId) {
        this.environmentId = environmentId;
    }
}