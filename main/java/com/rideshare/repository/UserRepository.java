package com.rideshare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rideshare.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByUsernameIgnoreCase(String username);
    long countByStatus(com.rideshare.model.UserStatus status);
}

