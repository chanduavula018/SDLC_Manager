package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Version;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VersionRepository
        extends JpaRepository<Version, Long> {

    List<Version> findByProjectId(Long projectId);
}