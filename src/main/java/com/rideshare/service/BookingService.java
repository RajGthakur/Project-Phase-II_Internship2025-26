package com.rideshare.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.model.User;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking bookRide(Long rideId, Long passengerId, Integer seatsToBook, String pickupLocation, String dropLocation) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));

        if (ride.getAvailableSeats() < seatsToBook) {
            throw new RuntimeException("Not enough seats available");
        }

        // Decrement seats
        ride.setAvailableSeats(ride.getAvailableSeats() - seatsToBook);
        rideRepository.save(ride);

        // Create Booking
        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setSeats(seatsToBook);
        booking.setPickupLocation(pickupLocation);
        booking.setDropLocation(dropLocation);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.PENDING); // Initial status is PENDING

        Booking savedBooking = bookingRepository.save(booking);
        
        // Capture data for async notifications to avoid session issues
        User driver = ride.getDriver();
        String driverEmail = driver.getUsername();
        String driverName = driver.getName();
        String passengerName = passenger.getName();
        String source = ride.getSource();
        String destination = ride.getDestination();
        String dateStr = ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String timeStr = ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));

        // Notify Driver via Dashboard and Email asynchronously
        CompletableFuture.runAsync(() -> {
            try {
                // Dashboard Notification
                notificationService.createNotification(driver, 
                    "New booking for your ride from " + source + " to " + destination + " by " + passengerName);

                // Email Notification
                String subject = "New Booking on Your Ride";
                String emailText = """
                    Dear %s,
    
                    Great news! A passenger has requested to book your ride. Please check your dashboard to accept or decline the request.
    
                    Booking Details:
                    Passenger: %s
                    From: %s
                    To: %s
                    Date: %s
                    Time: %s
    
                    Thank you for using Smart Ride Sharing!
    
                    Best Regards,
                    Smart Ride Sharing Team""".formatted(
                    driverName,
                    passengerName,
                    source,
                    destination,
                    dateStr,
                    timeStr
                );
                emailService.sendSimpleMessage(driverEmail, subject, emailText);
            } catch (Exception e) {
                System.err.println("Failed to send booking notifications: " + e.getMessage());
            }
        });

        return savedBooking;
    }

    @Autowired
    private com.rideshare.repository.ReviewRepository reviewRepository;

    public List<Booking> getBookingsForPassenger(Long passengerId) {
        return bookingRepository.findByPassengerIdOrderByBookingTimeDesc(passengerId);
    }

    public List<Booking> getBookingsForDriver(Long driverId) {
        return bookingRepository.findByRideDriverIdOrderByBookingTimeDesc(driverId);
    }

    public List<Booking> getBookingHistory(Long userId, String role) {
        if ("DRIVER".equalsIgnoreCase(role)) {
             // 1. Get all bookings for the driver's rides
             List<Booking> bookings = bookingRepository.findByRideDriverIdOrderByBookingTimeDesc(userId);
             
             // 2. Filter for rides that are completed or whose date has passed
             List<Booking> filteredBookings = new java.util.ArrayList<>(bookings.stream()
                 .filter(b -> b.getRide().getStatus() == Ride.RideStatus.COMPLETED || 
                              b.getRide().getDateTime().isBefore(LocalDateTime.now()))
                 .toList());

             // 3. Find rides for this driver that are completed/past but have NO bookings
             java.util.Set<Long> rideIdsWithBookings = bookings.stream()
                 .map(b -> b.getRide().getId())
                 .collect(java.util.stream.Collectors.toSet());
                  
             List<Ride> allDriverRides = rideRepository.findByDriverId(userId);
             List<Ride> emptyRides = allDriverRides.stream()
                 .filter(r -> r.getStatus() == Ride.RideStatus.COMPLETED || r.getDateTime().isBefore(LocalDateTime.now()))
                 .filter(r -> !rideIdsWithBookings.contains(r.getId()))
                 .toList();

             // 4. Create dummy bookings for these empty rides to maintain frontend compatibility
             for (Ride ride : emptyRides) {
                 Booking dummy = new Booking();
                 dummy.setId(-ride.getId()); // Negative ID to distinguish from real bookings
                 dummy.setRide(ride);
                 // Map RideStatus to BookingStatus for the dummy
                 switch (ride.getStatus()) {
                     case COMPLETED -> dummy.setStatus(Booking.BookingStatus.COMPLETED);
                     case CANCELLED -> dummy.setStatus(Booking.BookingStatus.CANCELLED);
                     default -> dummy.setStatus(Booking.BookingStatus.PENDING);
                 }
                 dummy.setSeats(0);
                 dummy.setPassenger(null); 
                 filteredBookings.add(dummy);
             }

             // 5. Final sort by ride date time descending
             filteredBookings.sort((a, b) -> b.getRide().getDateTime().compareTo(a.getRide().getDateTime()));
             return filteredBookings;
        } else {
            // For passengers, we show bookings that are completed or cancelled.
            // The user wants rating ONLY after Complete Ride button, so we use COMPLETED status.
            List<Booking> bookings = bookingRepository.findByPassengerIdOrderByBookingTimeDesc(userId).stream()
                 .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED || 
                             b.getStatus() == Booking.BookingStatus.CANCELLED)
                 .toList();
            
            // Populate 'reviewed' flag
            for (Booking b : bookings) {
                if (b.getStatus() == Booking.BookingStatus.COMPLETED) {
                    b.setReviewed(reviewRepository.existsByReviewerIdAndRideId(userId, b.getRide().getId()));
                }
            }
            return bookings;
        }
    }

    @Transactional
    public void acceptBooking(Long bookingId, Long driverId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRide().getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only accept bookings for your own rides");
        }

        booking.setStatus(Booking.BookingStatus.ACCEPTED);
        bookingRepository.save(booking);

        // Notify Passenger via Dashboard
        notificationService.createNotification(booking.getPassenger(), 
            "Your booking for ride from " + booking.getRide().getSource() + " to " + booking.getRide().getDestination() + " has been accepted by the driver.");

        // Notify Passenger via Email
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Ride Booking Accepted - Please Complete Payment";
                String emailText = """
                    Dear %s,
    
                    Great news! The driver has accepted your ride booking request.
    
                    Booking Details:
                    Driver: %s
                    From: %s
                    To: %s
                    Date: %s
                    Time: %s
                    Fare Amount: ₹%.2f
    
                    Please complete the payment to confirm your booking.
    
                    Thank you for using Smart Ride Sharing!
    
                    Best Regards,
                    Smart Ride Sharing Team""".formatted(
                    booking.getPassenger().getName(),
                    booking.getRide().getDriver().getName(),
                    booking.getPickupLocation(),
                    booking.getDropLocation(),
                    booking.getRide().getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    booking.getRide().getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
                    booking.getRide().getPrice() * booking.getSeats()
                );
                emailService.sendSimpleMessage(booking.getPassenger().getUsername(), subject, emailText);
            } catch (Exception e) {
                System.err.println("Failed to send acceptance email: " + e.getMessage());
            }
        });
    }

    @Transactional
    public void declineBooking(Long bookingId, Long driverId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRide().getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only decline bookings for your own rides");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Restore seats
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeats());
        rideRepository.save(ride);

        // Notify Passenger via Dashboard
        notificationService.createNotification(booking.getPassenger(), 
            "Your booking for ride from " + ride.getSource() + " to " + ride.getDestination() + " has been declined by the driver.");

        // Notify Passenger via Email
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Ride Cancellation Notice";
                String emailText = """
                    Dear %s,
    
                    We regret to inform you that your ride has been cancelled by the driver.
    
                    Ride Details:
                    Driver: %s
                    From: %s
                    To: %s
                    Date: %s
                    Time: %s
    
                    If you have already made a payment, you will receive a full refund within 7 working days.
    
                    We apologize for any inconvenience caused.
    
                    Thank you for using Smart Ride Sharing!
    
                    Best Regards,
                    Smart Ride Sharing Team""".formatted(
                    booking.getPassenger().getName(),
                    ride.getDriver().getName(),
                    booking.getPickupLocation(),
                    booking.getDropLocation(),
                    ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                );
                emailService.sendSimpleMessage(booking.getPassenger().getUsername(), subject, emailText);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        });
    }

    @Transactional
    public void cancelBooking(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own bookings");
        }

        // Restore seats
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeats());
        rideRepository.save(ride);

        // Notify Driver about cancellation
        notificationService.createNotification(ride.getDriver(), 
            "Booking cancelled by " + booking.getPassenger().getName() + " for ride from " + ride.getSource() + " to " + ride.getDestination());

        bookingRepository.delete(booking);
    }

    @Transactional
    public void confirmBooking(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new RuntimeException("Unauthorized: You can only confirm your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.ACCEPTED) {
            throw new RuntimeException("Booking must be accepted by driver before confirmation");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Ride ride = booking.getRide();
        User driver = ride.getDriver();
        User passenger = booking.getPassenger();

        // Transaction recording is now handled by the PaymentController


        // Notify Driver about confirmation (Dashboard)
        notificationService.createNotification(driver, 
            "Booking confirmed and paid by " + passenger.getName() + " for ride from " + ride.getSource() + " to " + ride.getDestination());

        // Notify Passenger via Email (Asynchronous)
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Ride Booking Accepted - Confirmation";
                String emailText = """
                    Dear %s,

                    Great news! Your ride booking has been accepted!

                    Booking Details:
                    From: %s
                    To: %s
                    Date: %s
                    Time: %s

                    Your booking is confirmed. Enjoy your ride!

                    Thank you for using Smart Ride Sharing!

                    Best Regards,
                    Smart Ride Sharing Team""".formatted(
                    passenger.getName(),
                    ride.getSource(),
                    ride.getDestination(),
                    ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                    ride.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                );
                emailService.sendSimpleMessage(passenger.getUsername(), subject, emailText);
            } catch (Exception e) {
                System.err.println("Failed to send confirmation email: " + e.getMessage());
            }
        });
    }
}
