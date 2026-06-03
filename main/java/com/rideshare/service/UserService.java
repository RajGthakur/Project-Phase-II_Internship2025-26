package com.rideshare.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rideshare.model.User;
import com.rideshare.repository.UserRepository;

@Service
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String adminEmail;

    public boolean existsByEmail(String email) {
        return userRepository.existsByUsernameIgnoreCase(email);
    }

    public User register(User user) {
        if (user.getName() != null && !user.getName().matches("^[A-Za-z\\s]+$")) {
            throw new IllegalArgumentException("Full Name must contain only letters and spaces");
        }
        if (user.getContactNumber() != null && !user.getContactNumber().matches("^\\d{10}$")) {
            throw new IllegalArgumentException("Contact Number must be exactly 10 digits");
        }
        if (user.getPincode() != null && !user.getPincode().matches("^\\d+$")) {
            throw new IllegalArgumentException("Pincode must contain only numbers");
        }
        if (user.getRole() == User.Role.DRIVER || user.getRole() == User.Role.PASSENGER) {
            user.setStatus(com.rideshare.model.UserStatus.PENDING);
            // Generate temporary password if not provided
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(java.util.UUID.randomUUID().toString());
            }

            // Notify Admin
            try {
                emailService.sendSimpleMessage(adminEmail, "🔔 New Registration Pending Approval",
                    "Hello Admin,\n\nA new " + user.getRole() + " has registered and is pending approval.\n\n" +
                    "**User Details:**\n" +
                    "Name: " + user.getName() + "\n" +
                    "Email/Username: " + user.getUsername() + "\n\n" +
                    "Please log in to the Admin Dashboard to review and approve this account.");
            } catch (Exception e) {
                System.err.println("Note: Admin notification email failed, but registration proceeded: " + e.getMessage());
            }
        } else {
            user.setStatus(com.rideshare.model.UserStatus.APPROVED);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> login(String username, String password) {
        // This method is less needed with Spring Security but kept for reference
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws org.springframework.security.core.userdetails.UsernameNotFoundException {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
    }
    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username).orElse(null);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User findByResetToken(String token) {
        return userRepository.findByResetToken(token).orElse(null);
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
