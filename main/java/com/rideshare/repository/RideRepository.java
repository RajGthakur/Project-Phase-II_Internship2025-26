package com.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rideshare.model.Ride;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByStatus(Ride.RideStatus status);
    List<Ride> findByDriverId(Long driverId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Ride r WHERE r.source LIKE %:source% AND r.destination LIKE %:destination% AND r.status = 'AVAILABLE' AND r.availableSeats > 0")
    List<Ride> findAvailableRides(String source, String destination);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Ride r WHERE r.driver.id = :driverId")
    List<Ride> findActiveByDriverId(Long driverId);

    long countByStatus(Ride.RideStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM Ride r WHERE (r.status = 'AVAILABLE' OR r.status = 'BOOKED') AND r.dateTime > :now")
    long countActiveRides(java.time.LocalDateTime now);
}

