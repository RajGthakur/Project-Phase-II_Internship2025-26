package com.rideshare.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.User;
import com.rideshare.model.UserStatus;
import com.rideshare.repository.UserRepository;
import com.rideshare.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.rideshare.repository.RideRepository rideRepository;

    @Autowired
    private com.rideshare.service.EmailService emailService;

    @Autowired
    private com.rideshare.repository.BookingRepository bookingRepository;

    @Autowired
    private com.rideshare.repository.TransactionRepository transactionRepository;

    @Autowired
    private com.rideshare.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.rideshare.repository.ReviewRepository reviewRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        // In a real app, you might want pagination and filtering
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        List<User> pendingUsers = userService.findAllUsers().stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingUsers);
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            boolean isFirstTimeApproval = user.getStatus() == UserStatus.PENDING;
            user.setStatus(UserStatus.APPROVED);
            
            String rawPassword = null;
            if (isFirstTimeApproval) {
                // Generate random password (8 chars) only for first-time approval
                String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                StringBuilder sb = new StringBuilder();
                java.security.SecureRandom random = new java.security.SecureRandom();
                for (int i = 0; i < 8; i++) {
                    sb.append(chars.charAt(random.nextInt(chars.length())));
                }
                rawPassword = sb.toString();
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setFirstLogin(true);
            }
            
            userRepository.save(user);

            // Send approval email
            try {
                if (isFirstTimeApproval && rawPassword != null) {
                    System.out.println("Approval Email Attempt for: " + user.getUsername());
                    System.out.println("Generated Password: " + rawPassword);
                    
                    emailService.sendSimpleMessage(user.getUsername(), "🎉 Account Approved - Welcome to Smart Ride Sharing!", 
                        "Hello " + user.getName() + ",\n\n" +
                        "Congratulations! Your account has been officially approved by the Smart Ride Sharing administration.\n\n" +
                        "You can now access your dashboard and start using our services.\n\n" +
                        "🔒 **Your Login Credentials:**\n" +
                        "Username: " + user.getUsername() + "\n" +
                        "Temporary Password: " + rawPassword + "\n\n" +
                        "⚠️ **Important:** For your security, please log in and change your password immediately.\n\n" +
                        "Best regards,\n" +
                        "The Smart Ride Sharing Team");
                } else {
                    // Just a re-activation email or simple approval
                    emailService.sendSimpleMessage(user.getUsername(), "✅ Account Reactivated - Welcome Back!", 
                        "Hello " + user.getName() + ",\n\n" +
                        "Your Smart Ride Sharing account has been reactivated. You can now log in using your existing credentials.\n\n" +
                        "Best regards,\n" +
                        "The Smart Ride Sharing Team");
                }
            } catch (Exception e) {
                System.err.println("Failed to send approval email: " + e.getMessage());
                if (isFirstTimeApproval) {
                    System.out.println("CRITICAL: Email failed for NEW user. Manual credentials delivery required.");
                    System.out.println("User: " + user.getUsername());
                    System.out.println("Password: " + rawPassword);
                }
            }

            return ResponseEntity.ok(isFirstTimeApproval ? "User approved and credentials sent" : "User reactivated successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
         return userRepository.findById(id).map(user -> {
            user.setStatus(UserStatus.DEACTIVATED);
            userRepository.save(user);
            return ResponseEntity.ok("User deactivated successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long pendingApprovals = userRepository.countByStatus(UserStatus.PENDING);
        
        // Active Rides: AVAILABLE or BOOKED and in the future
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        long activeRides = rideRepository.countActiveRides(now);

        // Total Revenue: Total earnings of all drivers (sum of all successful transactions)
        double totalRevenue = transactionRepository.sumTotalSuccessfulRevenue();


        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeRides", activeRides);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<com.rideshare.model.Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    @GetMapping("/business-overview")
    public ResponseEntity<java.util.Map<String, Object>> getBusinessOverview() {
        List<User> allUsers = userService.findAllUsers();
        List<com.rideshare.model.Ride> allRides = rideRepository.findAll();
        List<com.rideshare.model.Booking> allBookings = bookingRepository.findAll();
        List<com.rideshare.model.Transaction> allTransactions = transactionRepository.findAll();
        List<com.rideshare.model.Review> allReviews = reviewRepository.findAll();
        List<com.rideshare.model.Vehicle> allVehicles = vehicleRepository.findAll();

        // 1. Driver Stats
        List<java.util.Map<String, Object>> driverStats = allUsers.stream()
            .filter(u -> u.getRole() == User.Role.DRIVER)
            .map(driver -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", driver.getId());
                map.put("name", driver.getName());
                map.put("email", driver.getUsername());
                
                long totalRides = allRides.stream().filter(r -> r.getDriver().getId().equals(driver.getId())).count();
                
                // For earnings: sum of transactions for bookings belonging to rides of this driver
                double earnings = allTransactions.stream()
                    .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                    .filter(t -> {
                        return allBookings.stream()
                            .filter(b -> b.getId().equals(t.getBookingId()))
                            .anyMatch(b -> b.getRide().getDriver().getId().equals(driver.getId()));
                    })
                    .mapToDouble(com.rideshare.model.Transaction::getAmount)
                    .sum();
                
                long acceptedRides = allBookings.stream()
                    .filter(b -> b.getRide().getDriver().getId().equals(driver.getId()))
                    .filter(b -> b.getStatus() == com.rideshare.model.Booking.BookingStatus.CONFIRMED || b.getStatus() == com.rideshare.model.Booking.BookingStatus.ACCEPTED)
                    .count();

                List<com.rideshare.model.Vehicle> driverVehicles = allVehicles.stream()
                    .filter(v -> v.getDriver().getId().equals(driver.getId()))
                    .collect(Collectors.toList());

                map.put("totalRides", totalRides);
                map.put("earnings", earnings);
                map.put("acceptedRides", acceptedRides);
                map.put("vehicles", driverVehicles);
                return map;
            }).collect(Collectors.toList());

        // 2. Passenger Stats
        List<java.util.Map<String, Object>> passengerStats = allUsers.stream()
            .filter(u -> u.getRole() == User.Role.PASSENGER)
            .map(passenger -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", passenger.getId());
                map.put("name", passenger.getName());
                map.put("email", passenger.getUsername());

                long bookedRides = allBookings.stream().filter(b -> b.getPassenger().getId().equals(passenger.getId())).count();
                
                double totalPayments = allTransactions.stream()
                    .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                    .filter(t -> {
                        return allBookings.stream()
                            .filter(b -> b.getId().equals(t.getBookingId()))
                            .anyMatch(b -> b.getPassenger().getId().equals(passenger.getId()));
                    })
                    .mapToDouble(com.rideshare.model.Transaction::getAmount)
                    .sum();

                long reviewsCount = allReviews.stream().filter(r -> r.getReviewer().getId().equals(passenger.getId())).count();

                map.put("bookedRides", bookedRides);
                map.put("totalPayments", totalPayments);
                map.put("reviewsCount", reviewsCount);
                return map;
            }).collect(Collectors.toList());

        // 3. Chart Data (Grouped by Day for last 7 days)
        List<java.util.Map<String, Object>> chartData = new java.util.ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = now.minusDays(i).toLocalDate();
            java.util.Map<String, Object> dayMap = new java.util.HashMap<>();
            dayMap.put("name", date.getDayOfWeek().name().substring(0, 3));
            
            double earnings = allTransactions.stream()
                .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                .filter(t -> t.getTransactionTime().toLocalDate().equals(date))
                .mapToDouble(com.rideshare.model.Transaction::getAmount)
                .sum();

            long ridesCount = allRides.stream()
                .filter(r -> r.getDateTime() != null && r.getDateTime().toLocalDate().equals(date))
                .count();

            dayMap.put("revenue", earnings);
            dayMap.put("rides", ridesCount);
            chartData.add(dayMap);
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("driverStats", driverStats);
        response.put("passengerStats", passengerStats);
        response.put("chartData", chartData);

        return ResponseEntity.ok(response);
    }
}
