package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.BugReport;
import com.enterprise.sdlcdevops.repository.BugReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BugReportService {

    private final BugReportRepository bugReportRepository;

    public BugReportService(BugReportRepository bugReportRepository) {
        this.bugReportRepository = bugReportRepository;
    }

    // Get all bug reports
    public List<BugReport> getAllBugReports() {
        return bugReportRepository.findAll();
    }

    // Get bug report by ID
    public Optional<BugReport> getBugReportById(Long bugId) {
        return bugReportRepository.findById(bugId);
    }

    // Get bugs by project
    public List<BugReport> getBugReportsByProjectId(Long projectId) {
        return bugReportRepository.findByProjectId(projectId);
    }

    // Get bugs by test case
    public List<BugReport> getBugReportsByTestCaseId(Long testCaseId) {
        return bugReportRepository.findByTestCaseId(testCaseId);
    }

    // Create bug report
    public BugReport createBugReport(BugReport bugReport) {
        return bugReportRepository.save(bugReport);
    }

    // Update bug report
    public BugReport updateBugReport(
            Long bugId,
            BugReport updatedBugReport) {

        BugReport existingBugReport =
                bugReportRepository.findById(bugId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Bug report not found"));

        existingBugReport.setDescription(
                updatedBugReport.getDescription());

        existingBugReport.setSeverity(
                updatedBugReport.getSeverity());

        existingBugReport.setStatus(
                updatedBugReport.getStatus());

        existingBugReport.setProjectId(
                updatedBugReport.getProjectId());

        existingBugReport.setTestCaseId(
                updatedBugReport.getTestCaseId());

        return bugReportRepository.save(existingBugReport);
    }

    // Delete bug report
    public void deleteBugReport(Long bugId) {
        bugReportRepository.deleteById(bugId);
    }
}