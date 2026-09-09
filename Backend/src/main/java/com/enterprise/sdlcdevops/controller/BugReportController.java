package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.BugReport;
import com.enterprise.sdlcdevops.service.BugReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bug-reports")
public class BugReportController {

    private final BugReportService bugReportService;

    public BugReportController(BugReportService bugReportService) {
        this.bugReportService = bugReportService;
    }

    @GetMapping
    public ResponseEntity<List<BugReport>> getAllBugReports() {
        return ResponseEntity.ok(
                bugReportService.getAllBugReports()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BugReport> getBugReportById(
            @PathVariable Long id) {

        return bugReportService.getBugReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<BugReport>> getBugReportsByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                bugReportService.getBugReportsByProjectId(projectId)
        );
    }

    @GetMapping("/test-case/{testCaseId}")
    public ResponseEntity<List<BugReport>> getBugReportsByTestCaseId(
            @PathVariable Long testCaseId) {

        return ResponseEntity.ok(
                bugReportService.getBugReportsByTestCaseId(testCaseId)
        );
    }

    @PostMapping
    public ResponseEntity<BugReport> createBugReport(
            @RequestBody BugReport bugReport) {

        return ResponseEntity.ok(
                bugReportService.createBugReport(bugReport)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BugReport> updateBugReport(
            @PathVariable Long id,
            @RequestBody BugReport bugReport) {

        try {
            return ResponseEntity.ok(
                    bugReportService.updateBugReport(id, bugReport)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBugReport(
            @PathVariable Long id) {

        bugReportService.deleteBugReport(id);

        return ResponseEntity.noContent().build();
    }
}