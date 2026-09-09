package com.enterprise.sdlcdevops.service;

import com.enterprise.sdlcdevops.entity.TestCase;
import com.enterprise.sdlcdevops.repository.TestCaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;

    public TestCaseService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    public List<TestCase> getAllTestCases() {
        return testCaseRepository.findAll();
    }

    public Optional<TestCase> getTestCaseById(Long testCaseId) {
        return testCaseRepository.findById(testCaseId);
    }

    public List<TestCase> getTestCasesByProjectId(Long projectId) {
        return testCaseRepository.findByProjectId(projectId);
    }

    public TestCase createTestCase(TestCase testCase) {
        return testCaseRepository.save(testCase);
    }

    public TestCase updateTestCase(
            Long testCaseId,
            TestCase updatedTestCase) {

        TestCase existingTestCase =
                testCaseRepository.findById(testCaseId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Test case not found"));

        existingTestCase.setTitle(updatedTestCase.getTitle());

        existingTestCase.setDescription(
                updatedTestCase.getDescription());

        existingTestCase.setExpectedResult(
                updatedTestCase.getExpectedResult());

        existingTestCase.setStatus(
                updatedTestCase.getStatus());

        existingTestCase.setProjectId(
                updatedTestCase.getProjectId());

        return testCaseRepository.save(existingTestCase);
    }

    public void deleteTestCase(Long testCaseId) {
        testCaseRepository.deleteById(testCaseId);
    }
}