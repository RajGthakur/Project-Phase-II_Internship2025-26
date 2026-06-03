package com.rideshare.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.Booking;
import com.rideshare.model.Review;
import com.rideshare.model.Transaction;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.ReviewRepository;
import com.rideshare.repository.TransactionRepository;
import com.rideshare.service.UserService;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:5173")
public class StatsController {

    @Autowired
    private UserService userService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication authentication) {
        String username = authentication.getName();
        User user = (User) userService.loadUserByUsername(username);
        
        Map<String, Object> response = new HashMap<>();
        
        if (user.getRole() == User.Role.DRIVER) {
            response.putAll(getDriverStats(user.getId()));
        } else if (user.getRole() == User.Role.PASSENGER) {
            response.putAll(getPassengerStats(user.getId()));
        }
        
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> getDriverStats(Long driverId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 1. Earnings (last 7 days)
        List<Transaction> allTransactions = transactionRepository.findAll();
        List<Booking> driverBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getRide().getDriver().getId().equals(driverId))
                .collect(Collectors.toList());
        
        Set<Long> driverBookingIds = driverBookings.stream().map(Booking::getId).collect(Collectors.toSet());
        
        List<Map<String, Object>> earningsData = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            double dailyEarnings = allTransactions.stream()
                .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                .filter(t -> t.getTransactionTime().toLocalDate().equals(date))
                .filter(t -> driverBookingIds.contains(t.getBookingId()))
                .mapToDouble(Transaction::getAmount)
                .sum();
            
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("name", date.getDayOfWeek().name().substring(0, 3));
            dayMap.put("earnings", dailyEarnings);
            earningsData.add(dayMap);
        }
        stats.put("earningsChart", earningsData);

        // 2. Ratings received
        List<Review> receivedReviews = reviewRepository.findByRevieweeId(driverId);
        Map<Integer, Long> ratingsMap = receivedReviews.stream()
            .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
        
        List<Map<String, Object>> ratingsData = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> rateMap = new HashMap<>();
            rateMap.put("rating", i + " Star");
            rateMap.put("count", ratingsMap.getOrDefault(i, 0L));
            ratingsData.add(rateMap);
        }
        stats.put("ratingsChart", ratingsData);
        
        return stats;
    }

    private Map<String, Object> getPassengerStats(Long passengerId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 1. Payments (last 7 days)
        List<Transaction> allTransactions = transactionRepository.findAll();
        List<Booking> passengerBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getPassenger().getId().equals(passengerId))
                .collect(Collectors.toList());
        
        Set<Long> passengerBookingIds = passengerBookings.stream().map(Booking::getId).collect(Collectors.toSet());
        
        List<Map<String, Object>> paymentsData = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.minusDays(i);
            double dailyPayments = allTransactions.stream()
                .filter(t -> "SUCCESS".equalsIgnoreCase(t.getStatus()))
                .filter(t -> t.getTransactionTime().toLocalDate().equals(date))
                .filter(t -> passengerBookingIds.contains(t.getBookingId()))
                .mapToDouble(Transaction::getAmount)
                .sum();
            
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("name", date.getDayOfWeek().name().substring(0, 3));
            dayMap.put("payments", dailyPayments);
            paymentsData.add(dayMap);
        }
        stats.put("paymentsChart", paymentsData);

        // 2. Ratings given
        List<Review> givenReviews = reviewRepository.findByReviewerId(passengerId);
        Map<Integer, Long> ratingsMap = givenReviews.stream()
            .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
        
        List<Map<String, Object>> ratingsData = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> rateMap = new HashMap<>();
            rateMap.put("rating", i + " Star");
            rateMap.put("count", ratingsMap.getOrDefault(i, 0L));
            ratingsData.add(rateMap);
        }
        stats.put("ratingsChart", ratingsData);
        
        return stats;
    }
}
