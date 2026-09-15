package com.enterprise.sdlcdevops.controller;

import com.enterprise.sdlcdevops.entity.User;
import com.enterprise.sdlcdevops.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password is required"));
        }

        Optional<User> userOptional = userRepository.findByEmail(email.trim().toLowerCase());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOptional.get();

        // Check password matching plain text OR BCrypt hash
        boolean passwordMatches = password.equals(user.getPassword()) || 
                passwordEncoder.matches(password, user.getPassword());

        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        // Normalize role string
        String normalizedRole = normalizeRole(user.getRole());

        // Generate session token
        String token = "neuroforge-token-" + UUID.randomUUID();

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", normalizedRole);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> regRequest) {
        String fullName = regRequest.get("fullName");
        String email = regRequest.get("email");
        String password = regRequest.get("password");
        String role = regRequest.get("role");

        if (fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Full Name is required"));
        }

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
        }

        if (password == null || password.trim().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password must be at least 6 characters long"));
        }

        if (role == null || role.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Role is required"));
        }

        // ADMIN PROTECTION: Forbid self-registering as ADMIN
        String normalizedRole = normalizeRole(role);
        if ("ADMIN".equalsIgnoreCase(normalizedRole)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Admin accounts cannot be self-registered through the public portal."));
        }

        String cleanedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmail(cleanedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists."));
        }

        // Create and save user with hashed password
        String hashedPassword = passwordEncoder.encode(password);
        User newUser = new User(fullName.trim(), cleanedEmail, hashedPassword, normalizedRole);
        User savedUser = userRepository.save(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account created successfully. Please log in.");
        response.put("userId", savedUser.getUserId());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String normalizeRole(String rawRole) {
        if (rawRole == null) return "DEVELOPER";
        String r = rawRole.trim().toUpperCase().replace(" ", "_");
        if (r.contains("ADMIN")) return "ADMIN";
        if (r.contains("MANAGER") || r.contains("PM")) return "PROJECT_MANAGER";
        if (r.contains("TEST")) return "TESTER";
        if (r.contains("DEVOPS")) return "DEVOPS_ENGINEER";
        if (r.contains("CLIENT")) return "CLIENT";
        if (r.contains("DEV")) return "DEVELOPER";
        return r;
    }
}
