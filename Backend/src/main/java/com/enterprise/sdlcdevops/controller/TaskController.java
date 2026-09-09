package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.Task;
import com.enterprise.sdlcdevops.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable Long id) {

        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProjectId(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                taskService.getTasksByProjectId(projectId)
        );
    }

    @GetMapping("/requirement/{requirementId}")
    public ResponseEntity<List<Task>> getTasksByRequirementId(
            @PathVariable Long requirementId) {

        return ResponseEntity.ok(
                taskService.getTasksByRequirementId(requirementId)
        );
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody Task task) {

        return ResponseEntity.ok(
                taskService.createTask(task)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task task) {

        try {
            return ResponseEntity.ok(
                    taskService.updateTask(id, task)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id) {

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }
}