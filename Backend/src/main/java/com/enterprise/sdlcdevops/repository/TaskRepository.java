package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByRequirementId(Long requirementId);
}