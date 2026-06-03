package com.rideshare.config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rideshare.model.User;
import com.rideshare.model.UserStatus;
import com.rideshare.repository.UserRepository;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String oldEmail = "abc";
        String newEmail = "pqr";
        String newPassword = "xyz";

        // 1. Check if the new admin already exists
        Optional<User> newAdmin = userRepository.findByUsernameIgnoreCase(newEmail);
        
        if (newAdmin.isPresent()) {
            // New admin exists, just ensure it has correct password and is ADMIN
            User admin = newAdmin.get();
            admin.setPassword(passwordEncoder.encode(newPassword));
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(UserStatus.APPROVED);
            userRepository.save(admin);
            System.out.println("ADMIN SYNC: Updated existing admin credentials for: " + newEmail);
            
            // Optional: Remove the old admin if it exists to avoid confusion
            userRepository.findByUsernameIgnoreCase(oldEmail).ifPresent(old -> {
                if (!old.getId().equals(admin.getId())) {
                    userRepository.delete(old);
                    System.out.println("ADMIN CLEANUP: Deleted old admin " + oldEmail);
                }
            });
        } else {
            // New admin doesn't exist, check if old one can be renamed
            Optional<User> oldAdmin = userRepository.findByUsernameIgnoreCase(oldEmail);
            if (oldAdmin.isPresent()) {
                User admin = oldAdmin.get();
                admin.setUsername(newEmail);
                admin.setPassword(passwordEncoder.encode(newPassword));
                admin.setRole(User.Role.ADMIN);
                admin.setStatus(UserStatus.APPROVED);
                userRepository.save(admin);
                System.out.println("ADMIN UPDATE: Renamed admin from " + oldEmail + " to " + newEmail);
            } else {
                // Neither exists, create a new one
                User admin = new User();
                admin.setUsername(newEmail);
                admin.setPassword(passwordEncoder.encode(newPassword));
                admin.setName("ADMIN");
                admin.setRole(User.Role.ADMIN);
                admin.setStatus(UserStatus.APPROVED);
                admin.setContactNumber("0000000000");
                admin.setGender("Other");
                admin.setDateOfBirth("2000-01-01");
                userRepository.save(admin);
                System.out.println("ADMIN CREATE: Created brand new admin with: " + newEmail);
            }
        }
    }
}
