package com.rideshare.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rideshare.model.User;
import com.rideshare.model.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByDriver(User driver);
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
}
