package com.rideshare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rideshare.model.Booking;
import com.rideshare.model.Ride;
import com.rideshare.model.Ride.RideStatus;
import com.rideshare.repository.BookingRepository;
import com.rideshare.repository.ReviewRepository;
import com.rideshare.repository.RideRepository;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ReviewRepository reviewRepository;

    public Ride createRide(Ride ride) {
        ride.setStatus(RideStatus.AVAILABLE);
        return rideRepository.save(ride);
    }

    public List<Ride> getAvailableRides() {
        return rideRepository.findByStatus(RideStatus.AVAILABLE);
    }
    
    public List<Ride> getRidesByDriver(Long driverId) {
        return rideRepository.findActiveByDriverId(driverId);
    }
    
    public List<Ride> searchRides(String source, String destination, String date) {
        List<Ride> rides = rideRepository.findAvailableRides(source, destination);
        if (date != null && !date.isEmpty()) {
            return rides.stream()
                .filter(r -> r.getDateTime() != null && r.getDateTime().toLocalDate().toString().equals(date))
                .toList();
        }
        return rides;
    }
    
    public Ride updateRide(Long id, Ride updatedRide, Long driverId) {
        Ride existingRide = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
                
        if (!existingRide.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only update your own rides");
        }
        
        if (updatedRide.getDateTime() != null && updatedRide.getDateTime().isBefore(java.time.LocalDate.now().plusDays(1).atStartOfDay())) {
            throw new RuntimeException("Rescheduled date must be at least tomorrow.");
        }
        
        existingRide.setDateTime(updatedRide.getDateTime());
        existingRide.setPrice(updatedRide.getPrice());
        existingRide.setAvailableSeats(updatedRide.getAvailableSeats());
        
        return rideRepository.save(existingRide);
    }

    @org.springframework.transaction.annotation.Transactional
    public void completeRide(Long id, Long driverId) {
        Ride existingRide = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
                
        if (!existingRide.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only complete your own rides");
        }
        
        existingRide.setStatus(RideStatus.COMPLETED);
        existingRide.setAvailableSeats(0); // Force close any remaining seats
        rideRepository.save(existingRide);
        
        // Handle all bookings for this ride
        List<Booking> bookings = bookingRepository.findByRideId(id);
        if (bookings != null) {
            for (Booking booking : bookings) {
                if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
                    booking.setStatus(Booking.BookingStatus.COMPLETED);
                    bookingRepository.save(booking);
                    
                    if (booking.getPassenger() != null) {
                        try {
                            String source = existingRide.getSource() != null ? existingRide.getSource() : "Unknown";
                            String dest = existingRide.getDestination() != null ? existingRide.getDestination() : "Unknown";
                            notificationService.createNotification(booking.getPassenger(), 
                                "How was your ride? Your trip from " + source + " to " + dest + " is complete. Please rate your driver!");
                        } catch (Exception e) {
                            System.err.println("Note: Notification failed for passenger: " + e.getMessage());
                        }
                    }
                } else if (booking.getStatus() == Booking.BookingStatus.PENDING || booking.getStatus() == Booking.BookingStatus.ACCEPTED) {
                    // Automatically cancel pending/accepted requests as the ride is now closed
                    booking.setStatus(Booking.BookingStatus.CANCELLED);
                    bookingRepository.save(booking);
                    
                    if (booking.getPassenger() != null) {
                        notificationService.createNotification(booking.getPassenger(),
                            "The ride from " + existingRide.getSource() + " to " + existingRide.getDestination() + " has been closed/completed by the driver.");
                    }
                }
            }
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteRide(Long id, Long driverId) {
        Ride existingRide = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
                
        if (!existingRide.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own rides");
        }
        
        // Notify passengers and remove bookings
        List<Booking> bookings = bookingRepository.findByRideId(id);
        for (Booking booking : bookings) {
            // Notify Passenger
            String formattedDate = existingRide.getDateTime().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
            notificationService.createNotification(booking.getPassenger(), 
                "Ride from " + existingRide.getSource() + " to " + existingRide.getDestination() + " on " + formattedDate + " has been cancelled and deleted by the driver.");
            
            // Delete booking to allow ride deletion
            bookingRepository.delete(booking);
        }

        // Delete any reviews associated with this ride
        List<com.rideshare.model.Review> reviews = reviewRepository.findByRideId(id);
        if (reviews != null && !reviews.isEmpty()) {
            for (com.rideshare.model.Review r : reviews) {
                reviewRepository.delete(r);
            }
        }
        
        // Finally, delete the ride (ElementCollections like pickup/drop locations will be handled by JPA)
        rideRepository.delete(existingRide);
    }
}
