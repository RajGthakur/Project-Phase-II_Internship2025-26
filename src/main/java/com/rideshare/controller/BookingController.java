package com.rideshare.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.Booking;
import com.rideshare.model.User;
import com.rideshare.service.BookingService;
import com.rideshare.service.UserService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> bookRide(@RequestBody Map<String, Object> bookingRequest, Authentication authentication) {
        try {
            String username = authentication.getName();
            User passenger = (User) userService.loadUserByUsername(username);
            
            Long rideId = Long.valueOf(bookingRequest.get("rideId").toString());
            // Default to 1 seat if not specified
            Integer seats = bookingRequest.containsKey("seats") ? Integer.valueOf(bookingRequest.get("seats").toString()) : 1;
            String pickupLocation = bookingRequest.containsKey("pickupLocation") ? bookingRequest.get("pickupLocation").toString() : null;
            String dropLocation = bookingRequest.containsKey("dropLocation") ? bookingRequest.get("dropLocation").toString() : null;

            Booking booking = bookingService.bookRide(rideId, passenger.getId(), seats, pickupLocation, dropLocation);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Booking failed: " + e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        String username = authentication.getName();
        User passenger = (User) userService.loadUserByUsername(username);
        return ResponseEntity.ok(bookingService.getBookingsForPassenger(passenger.getId()));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@org.springframework.web.bind.annotation.PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User passenger = (User) userService.loadUserByUsername(username);
            bookingService.cancelBooking(id, passenger.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cancellation failed: " + e.getMessage());
        }
    }

    @GetMapping("/driver")
    public ResponseEntity<List<Booking>> getDriverBookings(Authentication authentication) {
        String username = authentication.getName();
        User driver = (User) userService.loadUserByUsername(username);
        return ResponseEntity.ok(bookingService.getBookingsForDriver(driver.getId()));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@org.springframework.web.bind.annotation.PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User driver = (User) userService.loadUserByUsername(username);
            bookingService.acceptBooking(id, driver.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Accept failed: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/decline")
    public ResponseEntity<?> declineBooking(@org.springframework.web.bind.annotation.PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User driver = (User) userService.loadUserByUsername(username);
            bookingService.declineBooking(id, driver.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Decline failed: " + e.getMessage());
        }
    }
    @org.springframework.web.bind.annotation.PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@org.springframework.web.bind.annotation.PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User passenger = (User) userService.loadUserByUsername(username);
            bookingService.confirmBooking(id, passenger.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Confirmation failed: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Booking>> getBookingHistory(Authentication authentication) {
        String username = authentication.getName();
        User user = (User) userService.loadUserByUsername(username);
        return ResponseEntity.ok(bookingService.getBookingHistory(user.getId(), user.getRole().name()));
    }
}
