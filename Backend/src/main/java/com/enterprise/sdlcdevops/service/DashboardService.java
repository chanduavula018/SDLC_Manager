package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.dto.DashboardSummaryDTO;
import com.enterprise.sdlcdevops.entity.*;
import com.enterprise.sdlcdevops.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

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
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public DashboardService(
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
            UserRepository userRepository,
            ProjectService projectService) {
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
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        return getDashboardSummaryForRole("ADMIN", null);
    }

    public DashboardSummaryDTO getDashboardSummaryForRole(String role, Long userId) {
        Set<Long> accessibleProjectIds = projectService.getAccessibleProjectIds(role, userId);

        List<Project> allProjects;
        if (accessibleProjectIds == null) {
            allProjects = projectRepository.findAll();
        } else if (accessibleProjectIds.isEmpty()) {
            allProjects = Collections.emptyList();
        } else {
            allProjects = projectRepository.findAllById(accessibleProjectIds);
        }

        List<Requirement> allRequirements = requirementRepository.findAll();
        List<Task> allTasks = taskRepository.findAll();
        List<TestCase> allTestCases = testCaseRepository.findAll();
        List<BugReport> allBugReports = bugReportRepository.findAll();
        List<Documentation> allDocs = documentationRepository.findAll();
        List<Version> allVersions = versionRepository.findAll();
        List<Build> allBuilds = buildRepository.findAll();
        List<Environment> allEnvironments = environmentRepository.findAll();
        List<Deployment> allDeployments = deploymentRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        if (accessibleProjectIds != null) {
            Set<Long> pids = accessibleProjectIds;
            allRequirements = allRequirements.stream().filter(r -> pids.contains(r.getProjectId())).collect(Collectors.toList());
            allTasks = allTasks.stream().filter(t -> pids.contains(t.getProjectId())).collect(Collectors.toList());
            allTestCases = allTestCases.stream().filter(tc -> pids.contains(tc.getProjectId())).collect(Collectors.toList());
            allBugReports = allBugReports.stream().filter(b -> pids.contains(b.getProjectId())).collect(Collectors.toList());
            allVersions = allVersions.stream().filter(v -> pids.contains(v.getProjectId())).collect(Collectors.toList());
            allBuilds = allBuilds.stream().filter(b -> pids.contains(b.getProjectId())).collect(Collectors.toList());
            allEnvironments = allEnvironments.stream().filter(e -> pids.contains(e.getProjectId())).collect(Collectors.toList());
            allDeployments = allDeployments.stream().filter(d -> pids.contains(d.getProjectId())).collect(Collectors.toList());

            Set<Long> taskIds = allTasks.stream().map(Task::getTaskId).collect(Collectors.toSet());
            allDocs = allDocs.stream().filter(d -> d.getTaskId() != null && taskIds.contains(d.getTaskId())).collect(Collectors.toList());

            if (pids.isEmpty()) {
                allUsers = Collections.emptyList();
            }
        }

        long totalProjects = allProjects.size();
        long registeredUsers = allUsers.size();
        long deployments = allDeployments.size();

        long openRequirements = allRequirements.stream()
                .filter(r -> r.getStatus() == null || (!r.getStatus().equalsIgnoreCase("COMPLETED") && !r.getStatus().equalsIgnoreCase("CLOSED")))
                .count();

        long pendingTasks = allTasks.stream()
                .filter(t -> t.getStatus() == null || (!t.getStatus().equalsIgnoreCase("COMPLETED") && !t.getStatus().equalsIgnoreCase("DONE")))
                .count();

        long openBugReports = allBugReports.stream()
                .filter(b -> b.getStatus() == null || b.getStatus().equalsIgnoreCase("OPEN") || (!b.getStatus().equalsIgnoreCase("CLOSED") && !b.getStatus().equalsIgnoreCase("RESOLVED")))
                .count();

        long activeBuilds = allBuilds.stream()
                .filter(b -> b.getStatus() == null || b.getStatus().equalsIgnoreCase("SUCCESS") || b.getStatus().equalsIgnoreCase("IN_PROGRESS") || b.getStatus().equalsIgnoreCase("ACTIVE"))
                .count();

        long activeEnvironments = allEnvironments.stream()
                .filter(e -> e.getStatus() == null || e.getStatus().equalsIgnoreCase("ACTIVE") || e.getStatus().equalsIgnoreCase("HEALTHY"))
                .count();

        // Project Status Distribution
        Map<String, Long> projectStatusDist = allProjects.stream()
                .filter(p -> p.getStatus() != null)
                .collect(Collectors.groupingBy(p -> p.getStatus().toUpperCase(), Collectors.counting()));

        // Task Status Distribution
        Map<String, Long> taskStatusDist = allTasks.stream()
                .filter(t -> t.getStatus() != null)
                .collect(Collectors.groupingBy(t -> t.getStatus().toUpperCase(), Collectors.counting()));

        // Bug Severity Distribution
        Map<String, Long> bugSeverityDist = allBugReports.stream()
                .filter(b -> b.getSeverity() != null)
                .collect(Collectors.groupingBy(b -> b.getSeverity().toUpperCase(), Collectors.counting()));

        // Recent projects (top 5 sorted by projectId desc)
        List<Project> recentProjects = allProjects.stream()
                .sorted(Comparator.comparing(Project::getProjectId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        // Open bug reports list (top 5 open bugs)
        List<BugReport> openBugReportsList = allBugReports.stream()
                .filter(b -> b.getStatus() == null || b.getStatus().equalsIgnoreCase("OPEN") || (!b.getStatus().equalsIgnoreCase("CLOSED") && !b.getStatus().equalsIgnoreCase("RESOLVED")))
                .limit(5)
                .collect(Collectors.toList());

        // Pipeline Counts for all 11 modules
        Map<String, Long> sdlcPipelineCounts = new LinkedHashMap<>();
        sdlcPipelineCounts.put("users", registeredUsers);
        sdlcPipelineCounts.put("projects", totalProjects);
        sdlcPipelineCounts.put("requirements", (long) allRequirements.size());
        sdlcPipelineCounts.put("tasks", (long) allTasks.size());
        sdlcPipelineCounts.put("testCases", (long) allTestCases.size());
        sdlcPipelineCounts.put("bugReports", (long) allBugReports.size());
        sdlcPipelineCounts.put("documentation", (long) allDocs.size());
        sdlcPipelineCounts.put("versions", (long) allVersions.size());
        sdlcPipelineCounts.put("builds", (long) allBuilds.size());
        sdlcPipelineCounts.put("environments", (long) allEnvironments.size());
        sdlcPipelineCounts.put("deployments", deployments);

        return new DashboardSummaryDTO(
                totalProjects,
                openRequirements,
                pendingTasks,
                openBugReports,
                activeBuilds,
                deployments,
                registeredUsers,
                activeEnvironments,
                projectStatusDist,
                taskStatusDist,
                bugSeverityDist,
                recentProjects,
                openBugReportsList,
                sdlcPipelineCounts
        );
    }
}
