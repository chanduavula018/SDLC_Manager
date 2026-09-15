package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.TestCase;
import com.enterprise.sdlcdevops.service.TestCaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.enterprise.sdlcdevops.service.ProjectService;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test-cases")
public class TestCaseController {

    private final TestCaseService testCaseService;
    private final ProjectService projectService;

    public TestCaseController(
            TestCaseService testCaseService,
            ProjectService projectService) {

        this.testCaseService = testCaseService;
        this.projectService = projectService;
    }

    private boolean canManageTestCases(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized) || "TESTER".equals(normalized);
    }

    @GetMapping
    public ResponseEntity<List<TestCase>> getAllTestCases(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Set<Long> accessibleIds = projectService.getAccessibleProjectIds(userRole, userId);
        List<TestCase> all = testCaseService.getAllTestCases();
        if (accessibleIds != null) {
            all = all.stream().filter(tc -> accessibleIds.contains(tc.getProjectId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestCaseById(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id) {

        java.util.Optional<TestCase> tcOpt = testCaseService.getTestCaseById(id);
        if (tcOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TestCase tc = tcOpt.get();
        if (!projectService.isProjectAccessible(tc.getProjectId(), userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to test case in project ID: " + tc.getProjectId()));
        }
        return ResponseEntity.ok(tc);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getTestCasesByProjectId(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long projectId) {

        if (!projectService.isProjectAccessible(projectId, userRole, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied to project ID: " + projectId));
        }

        return ResponseEntity.ok(
                testCaseService
                        .getTestCasesByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<?> createTestCase(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody TestCase testCase) {

        if (!canManageTestCases(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Managing test cases is restricted to Administrators and QA Testers."));
        }

        return ResponseEntity.ok(
                testCaseService.createTestCase(testCase)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestCase(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody TestCase testCase) {

        if (!canManageTestCases(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Managing test cases is restricted to Administrators and QA Testers."));
        }

        try {
            return ResponseEntity.ok(
                    testCaseService
                            .updateTestCase(id, testCase)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestCase(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!canManageTestCases(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Deleting test cases is restricted to Administrators and QA Testers."));
        }

        testCaseService.deleteTestCase(id);

        return ResponseEntity.noContent().build();
    }
}