package com.enterprise.sdlcdevops.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "environments")
public class Environment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "environment_id")
    private Long environmentId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "environment_name")
    private String environmentName;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    public Environment() {
    }

    public Environment(
            Long projectId,
            String environmentName,
            String description,
            String status) {

        this.projectId = projectId;
        this.environmentName = environmentName;
        this.description = description;
        this.status = status;
    }

    public Long getEnvironmentId() {
        return environmentId;
    }

    public void setEnvironmentId(Long environmentId) {
        this.environmentId = environmentId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getEnvironmentName() {
        return environmentName;
    }

    public void setEnvironmentName(String environmentName) {
        this.environmentName = environmentName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}