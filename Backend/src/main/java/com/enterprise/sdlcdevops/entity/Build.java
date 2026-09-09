package com.enterprise.sdlcdevops.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "builds")
public class Build {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "build_id")
    private Long buildId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "build_number", nullable = false)
    private String buildNumber;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "build_date")
    private LocalDateTime buildDate;

    public Build() {
    }

    public Build(
            Long projectId,
            Long versionId,
            String buildNumber,
            String status,
            LocalDateTime buildDate) {

        this.projectId = projectId;
        this.versionId = versionId;
        this.buildNumber = buildNumber;
        this.status = status;
        this.buildDate = buildDate;
    }

    public Long getBuildId() {
        return buildId;
    }

    public void setBuildId(Long buildId) {
        this.buildId = buildId;
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

    public String getBuildNumber() {
        return buildNumber;
    }

    public void setBuildNumber(String buildNumber) {
        this.buildNumber = buildNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getBuildDate() {
        return buildDate;
    }

    public void setBuildDate(LocalDateTime buildDate) {
        this.buildDate = buildDate;
    }
}