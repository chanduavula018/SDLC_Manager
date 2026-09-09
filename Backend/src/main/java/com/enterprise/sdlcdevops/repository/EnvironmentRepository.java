package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentRepository
        extends JpaRepository<Environment, Long> {

    List<Environment> findByProjectId(Long projectId);
}