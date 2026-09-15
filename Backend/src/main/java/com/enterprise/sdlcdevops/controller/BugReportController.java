package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.BugReport;
import com.enterprise.sdlcdevops.entity.TestCase;
import com.enterprise.sdlcdevops.repository.TestCaseRepository;
import com.enterprise.sdlcdevops.service.BugReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.enterprise.sdlcdevops.service.ProjectService;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bug-reports")
public class BugReportController {

    private final BugReportService bugReportService;
    private final TestCaseRepository testCaseRepository;
    private final ProjectService projectService;

    public BugReportController(
            BugReportService bugReportService,
            TestCaseRepository testCaseRepository,
            ProjectService projectService) {

        this.bugReportService = bugReportService;
        this.testCaseRepository = testCaseRepository;
        this.projectService = projectService;
    }

    private boolean canCreateOrDeleteBugs(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "TESTER".equals(normalized);
    }

    private boolean canUpdateBugs(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "TESTER".equals(normalized) || "DEVELOPER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<BugReport>> getAllBugReports(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<BugReport> all = bugReportService.getAllBugReports();
        if (accessibleIds != null) {
            all = all.stream().filter(b -> accessibleIds.contains(b.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBugReportById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        java.util.Optional<BugReport> bugOpt = bugReportService.getBugReportById(id);
        if (bugOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        BugReport b = bugOpt.get();
        if (!projectService.isProjectAccessible(b.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to bug report in project ID: " + b.getProjectId()));
        }
        return ResponseEntity.ok(b);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getBugReportsByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                bugReportService.getBugReportsByProjectId(projectId)
        );
    }

    @GetMapping("/test-case/{testCaseId}")
    public ResponseEntity<?> getBugReportsByTestCaseId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long testCaseId) {

        Optional<TestCase> tcOpt = testCaseRepository.findById(testCaseId);
        if (tcOpt.isPresent()) {
            if (!projectService.isProjectAccessible(tcOpt.get().getProjectId(), userRole, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access denied to test case ID: " + testCaseId));
            }
        }

        return ResponseEntity.ok(
                bugReportService.getBugReportsByTestCaseId(testCaseId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createBugReport(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody BugReport bugReport) {

        if (!canCreateOrDeleteBugs(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Reporting bugs is restricted to Administrators and QA Testers."));
        }

        // Relationship Validation
        if (bugReport.getTestCaseId() != null && bugReport.getTestCaseId() > 0) {
            Optional<TestCase> tc = testCaseRepository.findById(bugReport.getTestCaseId());
            if (tc.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Test Case does not exist."));
            }
            if (bugReport.getProjectId() != null && !tc.get().getProjectId().equals(bugReport.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Test Case does not belong to the specified project."));
            }
        }

        return ResponseEntity.ok(
                bugReportService.createBugReport(bugReport)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBugReport(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody BugReport bugReport) {

        if (!canUpdateBugs(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Updating bugs is restricted to Administrators, QA Testers, and Developers."));
        }

        if (bugReport.getTestCaseId() != null && bugReport.getTestCaseId() > 0 && bugReport.getProjectId() != null) {
            Optional<TestCase> tc = testCaseRepository.findById(bugReport.getTestCaseId());
            if (tc.isPresent() && !tc.get().getProjectId().equals(bugReport.getProjectId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Selected Test Case does not belong to the specified project."));
            }
        }

        try {
            return ResponseEntity.ok(
                    bugReportService.updateBugReport(id, bugReport)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBugReport(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canCreateOrDeleteBugs(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting bug reports is restricted to Administrators and QA Testers."));
        }

        bugReportService.deleteBugReport(id);

        return ResponseEntity.noContent().build();
    }
}