package com.rideshare.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "BOOKING_TIME")
    private LocalDateTime bookingTime;

    @ManyToOne
    @JoinColumn(name = "PASSENGER_ID", nullable = false)
    private User passenger;

    @ManyToOne
    @JoinColumn(name = "RIDE_ID", nullable = false)
    private Ride ride;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50, columnDefinition = "VARCHAR(50)")
    private BookingStatus status;

    public enum BookingStatus {
        PENDING,
        ACCEPTED,
        CONFIRMED,
        CANCELLED,
        COMPLETED
    }

    // Constructors
    public Booking() {}

    public Booking(Long id, LocalDateTime bookingTime, User passenger, Ride ride, BookingStatus status) {
        this.id = id;
        this.bookingTime = bookingTime;
        this.passenger = passenger;
        this.ride = ride;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public User getPassenger() {
        return passenger;
    }

    public void setPassenger(User passenger) {
        this.passenger = passenger;
    }

    public Ride getRide() {
        return ride;
    }

    public void setRide(Ride ride) {
        this.ride = ride;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    @Column(name = "SEATS")
    private Integer seats;

    @Column(name = "PICKUP_LOCATION", length = 1000)
    private String pickupLocation;

    @Column(name = "DROP_LOCATION", length = 1000)
    private String dropLocation;

    @Transient
    private boolean reviewed;

    public boolean isReviewed() { return reviewed; }
    public void setReviewed(boolean reviewed) { this.reviewed = reviewed; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
}
