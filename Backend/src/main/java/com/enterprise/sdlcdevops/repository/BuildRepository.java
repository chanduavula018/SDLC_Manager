package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Build;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BuildRepository extends JpaRepository<Build, Long> {

    List<Build> findByProjectId(Long projectId);

    List<Build> findByVersionId(Long versionId);
}