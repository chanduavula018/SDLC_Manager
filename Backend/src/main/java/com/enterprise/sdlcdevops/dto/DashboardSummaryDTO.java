package com.enterprise.sdlcdevops.dto;

import com.enterprise.sdlcdevops.entity.BugReport;
import com.enterprise.sdlcdevops.entity.Project;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDTO {

    private long totalProjects;
    private long openRequirements;
    private long pendingTasks;
    private long openBugReports;
    private long activeBuilds;
    private long deployments;
    private long registeredUsers;
    private long activeEnvironments;

    private Map<String, Long> projectStatusDistribution;
    private Map<String, Long> taskStatusDistribution;
    private Map<String, Long> bugSeverityDistribution;

    private List<Project> recentProjects;
    private List<BugReport> openBugReportsList;

    private Map<String, Long> sdlcPipelineCounts;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(
            long totalProjects,
            long openRequirements,
            long pendingTasks,
            long openBugReports,
            long activeBuilds,
            long deployments,
            long registeredUsers,
            long activeEnvironments,
            Map<String, Long> projectStatusDistribution,
            Map<String, Long> taskStatusDistribution,
            Map<String, Long> bugSeverityDistribution,
            List<Project> recentProjects,
            List<BugReport> openBugReportsList,
            Map<String, Long> sdlcPipelineCounts) {
        this.totalProjects = totalProjects;
        this.openRequirements = openRequirements;
        this.pendingTasks = pendingTasks;
        this.openBugReports = openBugReports;
        this.activeBuilds = activeBuilds;
        this.deployments = deployments;
        this.registeredUsers = registeredUsers;
        this.activeEnvironments = activeEnvironments;
        this.projectStatusDistribution = projectStatusDistribution;
        this.taskStatusDistribution = taskStatusDistribution;
        this.bugSeverityDistribution = bugSeverityDistribution;
        this.recentProjects = recentProjects;
        this.openBugReportsList = openBugReportsList;
        this.sdlcPipelineCounts = sdlcPipelineCounts;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getOpenRequirements() {
        return openRequirements;
    }

    public void setOpenRequirements(long openRequirements) {
        this.openRequirements = openRequirements;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getOpenBugReports() {
        return openBugReports;
    }

    public void setOpenBugReports(long openBugReports) {
        this.openBugReports = openBugReports;
    }

    public long getActiveBuilds() {
        return activeBuilds;
    }

    public void setActiveBuilds(long activeBuilds) {
        this.activeBuilds = activeBuilds;
    }

    public long getDeployments() {
        return deployments;
    }

    public void setDeployments(long deployments) {
        this.deployments = deployments;
    }

    public long getRegisteredUsers() {
        return registeredUsers;
    }

    public void setRegisteredUsers(long registeredUsers) {
        this.registeredUsers = registeredUsers;
    }

    public long getActiveEnvironments() {
        return activeEnvironments;
    }

    public void setActiveEnvironments(long activeEnvironments) {
        this.activeEnvironments = activeEnvironments;
    }

    public Map<String, Long> getProjectStatusDistribution() {
        return projectStatusDistribution;
    }

    public void setProjectStatusDistribution(Map<String, Long> projectStatusDistribution) {
        this.projectStatusDistribution = projectStatusDistribution;
    }

    public Map<String, Long> getTaskStatusDistribution() {
        return taskStatusDistribution;
    }

    public void setTaskStatusDistribution(Map<String, Long> taskStatusDistribution) {
        this.taskStatusDistribution = taskStatusDistribution;
    }

    public Map<String, Long> getBugSeverityDistribution() {
        return bugSeverityDistribution;
    }

    public void setBugSeverityDistribution(Map<String, Long> bugSeverityDistribution) {
        this.bugSeverityDistribution = bugSeverityDistribution;
    }

    public List<Project> getRecentProjects() {
        return recentProjects;
    }

    public void setRecentProjects(List<Project> recentProjects) {
        this.recentProjects = recentProjects;
    }

    public List<BugReport> getOpenBugReportsList() {
        return openBugReportsList;
    }

    public void setOpenBugReportsList(List<BugReport> openBugReportsList) {
        this.openBugReportsList = openBugReportsList;
    }

    public Map<String, Long> getSdlcPipelineCounts() {
        return sdlcPipelineCounts;
    }

    public void setSdlcPipelineCounts(Map<String, Long> sdlcPipelineCounts) {
        this.sdlcPipelineCounts = sdlcPipelineCounts;
    }
}
