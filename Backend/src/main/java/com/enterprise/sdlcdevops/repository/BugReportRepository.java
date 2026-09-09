package com.enterprise.sdlcdevops.repository;

import com.enterprise.sdlcdevops.entity.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BugReportRepository
        extends JpaRepository<BugReport, Long> {

    List<BugReport> findByProjectId(Long projectId);

    List<BugReport> findByTestCaseId(Long testCaseId);
}