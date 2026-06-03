package com.rideshare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.Ride;
import com.rideshare.service.RideService;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "http://localhost:5173")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private com.rideshare.service.UserService userService;

    @Autowired
    private com.rideshare.service.VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<?> createRide(@RequestBody Ride ride, org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        com.rideshare.model.User driver = (com.rideshare.model.User) userService.findByUsername(username); 
        
        if (ride.getVehicle() != null && ride.getVehicle().getId() != null) {
            com.rideshare.model.Vehicle vehicle = vehicleService.getVehicleById(ride.getVehicle().getId()).orElse(null);
            if (vehicle == null) {
                return ResponseEntity.badRequest().body("Vehicle not found");
            }
            if (!vehicle.getDriver().getId().equals(driver.getId())) {
                return ResponseEntity.badRequest().body("Vehicle does not belong to you");
            }
            ride.setVehicle(vehicle);
            ride.setAvailableSeats(vehicle.getCapacity()); // Set initial seats to capacity
        } else {
             return ResponseEntity.badRequest().body("Vehicle is required");
        }

        ride.setDriver(driver);
        
        // Ensure available seats matches vehicle capacity if not provided
        if (ride.getAvailableSeats() == null && ride.getVehicle() != null) {
            ride.setAvailableSeats(ride.getVehicle().getCapacity());
        }

        return ResponseEntity.ok(rideService.createRide(ride));
    }

    @GetMapping
    public ResponseEntity<List<Ride>> getAvailableRides() {
        return ResponseEntity.ok(rideService.getAvailableRides());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ride>> searchRides(
            @RequestParam String source, 
            @RequestParam String destination, 
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(rideService.searchRides(source, destination, date));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Ride>> getRidesByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(rideService.getRidesByDriver(driverId));
    }
    
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<?> updateRide(@PathVariable Long id, @RequestBody Ride updatedRide, org.springframework.security.core.Authentication authentication) {
        try {
            String username = authentication.getName();
            com.rideshare.model.User driver = (com.rideshare.model.User) userService.findByUsername(username); 
            Ride ride = rideService.updateRide(id, updatedRide, driver.getId());
            return ResponseEntity.ok(ride);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/complete")
    public ResponseEntity<?> completeRide(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        try {
            String username = authentication.getName();
            com.rideshare.model.User driver = (com.rideshare.model.User) userService.findByUsername(username); 
            if (driver == null) {
                return ResponseEntity.badRequest().body("Driver not found for username: " + username);
            }
            rideService.completeRide(id, driver.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRide(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        try {
            String username = authentication.getName();
            com.rideshare.model.User driver = (com.rideshare.model.User) userService.findByUsername(username); 
            rideService.deleteRide(id, driver.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
