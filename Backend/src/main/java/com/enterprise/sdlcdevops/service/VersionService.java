package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Version;
import com.enterprise.sdlcdevops.repository.VersionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VersionService {

    private final VersionRepository versionRepository;

    public VersionService(
            VersionRepository versionRepository) {

        this.versionRepository = versionRepository;
    }

    public List<Version> getAllVersions() {
        return versionRepository.findAll();
    }

    public Optional<Version> getVersionById(Long versionId) {
        return versionRepository.findById(versionId);
    }

    public List<Version> getVersionsByProjectId(Long projectId) {
        return versionRepository.findByProjectId(projectId);
    }

    public Version createVersion(Version version) {
        return versionRepository.save(version);
    }

    public Version updateVersion(
            Long versionId,
            Version updatedVersion) {

        Version existingVersion =
                versionRepository.findById(versionId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Version not found"));

        existingVersion.setProjectId(
                updatedVersion.getProjectId());

        existingVersion.setVersionName(
                updatedVersion.getVersionName());

        existingVersion.setDescription(
                updatedVersion.getDescription());

        existingVersion.setStatus(
                updatedVersion.getStatus());

        existingVersion.setReleaseDate(
                updatedVersion.getReleaseDate());

        return versionRepository.save(existingVersion);
    }

    public void deleteVersion(Long versionId) {
        versionRepository.deleteById(versionId);
    }
}