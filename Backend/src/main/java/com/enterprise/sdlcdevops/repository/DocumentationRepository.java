package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Documentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentationRepository
        extends JpaRepository<Documentation, Long> {

    List<Documentation> findByTaskId(Long taskId);
}