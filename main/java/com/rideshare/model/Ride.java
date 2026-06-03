package com.rideshare.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "SOURCE", nullable = false, length = 1000)
    private String source;

    @Column(name = "DESTINATION", nullable = false, length = 1000)
    private String destination;

    @Column(name = "PRICE", nullable = false)
    private Double price;

    @Column(name = "DISTANCE")
    private Double distance;

    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats;

    @Column(name = "DATE_TIME")
    private LocalDateTime dateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 50, columnDefinition = "VARCHAR(50)")
    private RideStatus status;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "resetToken"})
    private User driver;

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @CollectionTable(name = "ride_pickup_locations", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "LOCATION")
    @OrderColumn(name = "location_order")
    private List<String> pickupLocations = new ArrayList<>();

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @CollectionTable(name = "ride_drop_locations", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "LOCATION")
    @OrderColumn(name = "location_order")
    private List<String> dropLocations = new ArrayList<>();


    public enum RideStatus {
        AVAILABLE,
        BOOKED,
        COMPLETED,
        CANCELLED
    }

    // Constructors
    public Ride() {}

    public Ride(Long id, String source, String destination, Double price, LocalDateTime dateTime, RideStatus status, User driver) {
        this.id = id;
        this.source = source;
        this.destination = destination;
        this.price = price;
        this.dateTime = dateTime;
        this.status = status;
        this.driver = driver;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public RideStatus getStatus() {
        return status;
    }

    public void setStatus(RideStatus status) {
        this.status = status;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    @ManyToOne
    @JoinColumn(name = "VEHICLE_ID")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"driver"})
    private Vehicle vehicle;

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }
    
    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public List<String> getPickupLocations() {
        return pickupLocations;
    }

    public void setPickupLocations(List<String> pickupLocations) {
        this.pickupLocations = pickupLocations;
    }

    public List<String> getDropLocations() {
        return dropLocations;
    }

    public void setDropLocations(List<String> dropLocations) {
        this.dropLocations = dropLocations;
    }
}
