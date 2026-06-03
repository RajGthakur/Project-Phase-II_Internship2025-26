package com.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rideshare.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerIdOrderByBookingTimeDesc(Long passengerId);
    List<Booking> findByPassengerIdAndStatusOrderByBookingTimeDesc(Long passengerId, Booking.BookingStatus status);
    List<Booking> findByRideDriverIdOrderByBookingTimeDesc(Long driverId);
    List<Booking> findByRideId(Long rideId);
}
