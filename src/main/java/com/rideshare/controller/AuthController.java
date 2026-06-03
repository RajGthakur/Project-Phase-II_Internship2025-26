package com.rideshare.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.User;
import com.rideshare.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private com.rideshare.service.EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    private com.rideshare.config.JwtUtil jwtUtil;

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            if (userService.findByUsername(username) == null) {
                return ResponseEntity.status(401).body("Username/Email is incorrect");
            } else {
                return ResponseEntity.status(401).body("Password is incorrect");
            }
        }

        final org.springframework.security.core.userdetails.UserDetails userDetails = userService.loadUserByUsername(username);
        
        if (userDetails instanceof User user) {
             // Allow ADMIN to login regardless of status, or assume ADMIN is always APPROVED
             if (user.getRole() != User.Role.ADMIN && user.getStatus() != com.rideshare.model.UserStatus.APPROVED) {
                 return ResponseEntity.status(403).body("Account is not approved yet. Current status: " + user.getStatus());
             }

             if (user.isFirstLogin()) {
                 String resetToken = jwtUtil.generateResetToken(user.getUsername());
                 Map<String, Object> response = new java.util.HashMap<>();
                 response.put("requirePasswordChange", true);
                 response.put("resetToken", resetToken);
                 response.put("message", "Welcome! Please set your permanent password to complete your account setup.");
                 return ResponseEntity.ok(response);
             }
        }

        final String jwt = jwtUtil.generateToken(userDetails);
        
        // Return token and user info
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", jwt);
        response.put("user", userDetails); 
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) return ResponseEntity.badRequest().body("Email is required");
        
        com.rideshare.model.User user = (com.rideshare.model.User) userService.findByUsername(email);
        
        if (user == null) {
             return ResponseEntity.badRequest().body("User not found with email: " + email);
        }
        
        // Generate JWT based reset token instead of UUID
        String token = jwtUtil.generateResetToken(user.getUsername());
        
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            System.out.println("DEBUG: Generated JWT Reset Link for " + email + ": " + resetLink);
            
            emailService.sendSimpleMessage(email, "Reset Your Smart Ride Sharing Password", 
                "Hello,\n\nYou requested to reset your password. Click the link below to set a new password:\n\n" + 
                resetLink + "\n\nIf you did not request this, please ignore this email. This link expires in 15 minutes.");
            
            return ResponseEntity.ok(Map.of(
                "message", "Reset link sent to " + email
            ));
        } catch (Exception e) {
            // Even if email fails, return a generic message
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to send email: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        // Validate JWT reset token
        String username = jwtUtil.validateResetToken(token);
        if (username == null) {
            return ResponseEntity.badRequest().body("Invalid or expired reset token");
        }
        
        com.rideshare.model.User user = (com.rideshare.model.User) userService.loadUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        userService.updatePassword(user, newPassword);
        
        // Generate new auth token for automatic login
        final String authToken = jwtUtil.generateToken(user);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Password reset successfully");
        response.put("token", authToken);
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
}
