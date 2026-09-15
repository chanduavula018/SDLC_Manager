package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.User;
import com.enterprise.sdlcdevops.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private boolean isAdmin(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return "ADMIN".equals(normalized);
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {

        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {

        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create user (ADMIN only)
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestBody User user) {

        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User management is restricted to Administrators."));
        }
        return ResponseEntity.ok(userService.createUser(user));
    }

    // Update user (ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id,
            @RequestBody User user) {

        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User management is restricted to Administrators."));
        }

        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete user (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {

        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "User management is restricted to Administrators."));
        }

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}