package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.*;
import com.enterprise.sdlcdevops.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final RequirementRepository requirementRepository;
    private final TaskRepository taskRepository;
    private final TestCaseRepository testCaseRepository;
    private final BugReportRepository bugReportRepository;
    private final DocumentationRepository documentationRepository;
    private final VersionRepository versionRepository;
    private final BuildRepository buildRepository;
    private final EnvironmentRepository environmentRepository;
    private final DeploymentRepository deploymentRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            RequirementRepository requirementRepository,
            TaskRepository taskRepository,
            TestCaseRepository testCaseRepository,
            BugReportRepository bugReportRepository,
            DocumentationRepository documentationRepository,
            VersionRepository versionRepository,
            BuildRepository buildRepository,
            EnvironmentRepository environmentRepository,
            DeploymentRepository deploymentRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.taskRepository = taskRepository;
        this.testCaseRepository = testCaseRepository;
        this.bugReportRepository = bugReportRepository;
        this.documentationRepository = documentationRepository;
        this.versionRepository = versionRepository;
        this.buildRepository = buildRepository;
        this.environmentRepository = environmentRepository;
        this.deploymentRepository = deploymentRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get set of accessible project IDs for role and user (null means unrestricted for ADMIN)
    public Set<Long> getAccessibleProjectIds(String role, Long userId) {
        if (role == null || role.trim().isEmpty() || "ADMIN".equalsIgnoreCase(role.trim())) {
            return null;
        }
        if (userId == null || userId <= 0) {
            return Collections.emptySet();
        }
        Set<Long> accessibleProjectIds = new HashSet<>();

        // 1. Projects owned by user
        List<Project> owned = projectRepository.findByUserId(userId);
        for (Project p : owned) {
            accessibleProjectIds.add(p.getProjectId());
        }

        // 2. Projects where user is a member
        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        for (ProjectMember pm : memberships) {
            accessibleProjectIds.add(pm.getProjectId());
        }

        return accessibleProjectIds;
    }

    // Verify whether a specific project is accessible for user role and ID
    public boolean isProjectAccessible(Long projectId, String role, Long userId) {
        if (projectId == null) {
            return false;
        }
        Set<Long> accessibleIds = getAccessibleProjectIds(role, userId);
        if (accessibleIds == null) {
            return true;
        }
        return accessibleIds.contains(projectId);
    }

    // Get projects based on user role and user ID (Project Data Isolation)
    public List<Project> getProjectsForRole(String role, Long userId) {
        Set<Long> accessibleIds = getAccessibleProjectIds(role, userId);
        if (accessibleIds == null) {
            return projectRepository.findAll();
        }
        if (accessibleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return projectRepository.findAllById(accessibleIds);
    }

    // Get project by ID
    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    // Get projects belonging to or assigned to a user
    public List<Project> getProjectsByUserId(Long userId) {
        if (userId == null || userId <= 0) {
            return Collections.emptyList();
        }
        Set<Long> accessibleIds = new HashSet<>();
        List<Project> owned = projectRepository.findByUserId(userId);
        for (Project p : owned) {
            accessibleIds.add(p.getProjectId());
        }
        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        for (ProjectMember pm : memberships) {
            accessibleIds.add(pm.getProjectId());
        }
        if (accessibleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return projectRepository.findAllById(accessibleIds);
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

    // Member Management
    public List<ProjectMember> getProjectMembers(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId);
    }

    public ProjectMember addProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new IllegalStateException("User " + user.getEmail() + " is already assigned to this project.");
        }

        ProjectMember member = new ProjectMember(projectId, userId, user.getRole(), LocalDate.now());
        return projectMemberRepository.save(member);
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long userId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new IllegalArgumentException("User is not a member of this project.");
        }
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    // Delete project and its dependent records safely in reverse FK dependency order
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));

        // 0. Delete project members
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        if (!members.isEmpty()) {
            projectMemberRepository.deleteAll(members);
        }

        // 1. Delete deployments for this project
        List<Deployment> deployments = deploymentRepository.findByProjectId(projectId);
        if (!deployments.isEmpty()) {
            deploymentRepository.deleteAll(deployments);
        }

        // 2. Delete builds for this project
        List<Build> builds = buildRepository.findByProjectId(projectId);
        if (!builds.isEmpty()) {
            buildRepository.deleteAll(builds);
        }

        // 3. Delete environments for this project
        List<Environment> environments = environmentRepository.findByProjectId(projectId);
        if (!environments.isEmpty()) {
            environmentRepository.deleteAll(environments);
        }

        // 4. Delete versions for this project
        List<Version> versions = versionRepository.findByProjectId(projectId);
        if (!versions.isEmpty()) {
            versionRepository.deleteAll(versions);
        }

        // 5. Delete documentation linked to tasks of this project
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        for (Task task : tasks) {
            List<Documentation> docs = documentationRepository.findByTaskId(task.getTaskId());
            if (!docs.isEmpty()) {
                documentationRepository.deleteAll(docs);
            }
        }

        // 6. Delete bug reports for this project
        List<BugReport> bugReports = bugReportRepository.findByProjectId(projectId);
        if (!bugReports.isEmpty()) {
            bugReportRepository.deleteAll(bugReports);
        }

        // 7. Delete test cases for this project
        List<TestCase> testCases = testCaseRepository.findByProjectId(projectId);
        if (!testCases.isEmpty()) {
            testCaseRepository.deleteAll(testCases);
        }

        // 8. Delete tasks for this project
        if (!tasks.isEmpty()) {
            taskRepository.deleteAll(tasks);
        }

        // 9. Delete requirements for this project
        List<Requirement> requirements = requirementRepository.findByProjectId(projectId);
        if (!requirements.isEmpty()) {
            requirementRepository.deleteAll(requirements);
        }

        // 10. Delete the project itself
        projectRepository.delete(project);
    }
}