package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.Project;
import com.enterprise.sdlcdevops.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get project by ID
    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    // Get projects belonging to a user
    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId);
    }

    // Create project
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    // Update project
    public Project updateProject(Long projectId, Project updatedProject) {

        Project existingProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        existingProject.setProjectName(updatedProject.getProjectName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setStatus(updatedProject.getStatus());
        existingProject.setStartDate(updatedProject.getStartDate());
        existingProject.setEndDate(updatedProject.getEndDate());
        existingProject.setUserId(updatedProject.getUserId());

        return projectRepository.save(existingProject);
    }

    // Delete project
    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }
}