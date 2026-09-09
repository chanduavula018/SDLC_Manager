package com.enterprise.sdlcdevops.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "versions")
public class Version {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "version_name")
    private String versionName;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    public Version() {
    }

    public Version(
            Long projectId,
            String versionName,
            String description,
            String status,
            LocalDate releaseDate) {

        this.projectId = projectId;
        this.versionName = versionName;
        this.description = description;
        this.status = status;
        this.releaseDate = releaseDate;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getVersionName() {
        return versionName;
    }

    public void setVersionName(String versionName) {
        this.versionName = versionName;
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

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }
}