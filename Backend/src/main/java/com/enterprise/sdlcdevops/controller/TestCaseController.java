package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.TestCase;
import com.enterprise.sdlcdevops.service.TestCaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-cases")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping
    public ResponseEntity<List<TestCase>> getAllTestCases() {
        return ResponseEntity.ok(
                testCaseService.getAllTestCases()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestCase> getTestCaseById(
            @PathVariable Long id) {

        return testCaseService.getTestCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TestCase>> getTestCasesByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                testCaseService
                        .getTestCasesByProjectId(projectId)
        );
    }

    @PostMapping
    public ResponseEntity<TestCase> createTestCase(
            @RequestBody TestCase testCase) {

        return ResponseEntity.ok(
                testCaseService.createTestCase(testCase)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestCase> updateTestCase(
            @PathVariable Long id,
            @RequestBody TestCase testCase) {

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
    public ResponseEntity<Void> deleteTestCase(
            @PathVariable Long id) {

        testCaseService.deleteTestCase(id);

        return ResponseEntity.noContent().build();
    }
}