package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Build;
import com.enterprise.sdlcdevops.repository.BuildRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BuildService {

    private final BuildRepository buildRepository;

    public BuildService(BuildRepository buildRepository) {
        this.buildRepository = buildRepository;
    }

    public List<Build> getAllBuilds() {
        return buildRepository.findAll();
    }

    public Optional<Build> getBuildById(Long buildId) {
        return buildRepository.findById(buildId);
    }

    public List<Build> getBuildsByProjectId(Long projectId) {
        return buildRepository.findByProjectId(projectId);
    }

    public List<Build> getBuildsByVersionId(Long versionId) {
        return buildRepository.findByVersionId(versionId);
    }

    public Build createBuild(Build build) {
        return buildRepository.save(build);
    }

    public Build updateBuild(
            Long buildId,
            Build updatedBuild) {

        Build existingBuild =
                buildRepository.findById(buildId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Build not found"));

        existingBuild.setProjectId(
                updatedBuild.getProjectId());

        existingBuild.setVersionId(
                updatedBuild.getVersionId());

        existingBuild.setBuildNumber(
                updatedBuild.getBuildNumber());

        existingBuild.setStatus(
                updatedBuild.getStatus());

        existingBuild.setBuildDate(
                updatedBuild.getBuildDate());

        return buildRepository.save(existingBuild);
    }

    public void deleteBuild(Long buildId) {
        buildRepository.deleteById(buildId);
    }
}