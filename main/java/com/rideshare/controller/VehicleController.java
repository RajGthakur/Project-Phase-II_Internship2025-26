package com.rideshare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rideshare.model.User;
import com.rideshare.model.Vehicle;
import com.rideshare.service.UserService;
import com.rideshare.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private UserService userService; // Assuming you have this or similar to get User from username

    @PostMapping
    public ResponseEntity<?> createVehicle(
            @RequestParam("company") String company,
            @RequestParam("model") String model,
            @RequestParam("manufacturingYear") Integer manufacturingYear,
            @RequestParam("rcNumber") String rcNumber,
            @RequestParam("insuranceDetails") String insuranceDetails,
            @RequestParam("hasAc") Boolean hasAc,
            @RequestParam("hasAudioSystem") Boolean hasAudioSystem,
            @RequestParam("kmDriven") String kmDriven,
            @RequestParam("color") String color,
            @RequestParam("vehicleNumber") String vehicleNumber,
            @RequestParam("driverName") String driverName,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "carImages", required = false) List<MultipartFile> carImages,
            @RequestParam(value = "rcImage", required = false) MultipartFile rcImage,
            @RequestParam(value = "insuranceImage", required = false) MultipartFile insuranceImage
    ) {
        try {
            System.out.println("DEBUG: Creating vehicle for " + vehicleNumber);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User driver = userService.findByUsername(currentUsername);
            
            if (driver == null) {
                System.out.println("DEBUG: Driver not found: " + currentUsername);
                return ResponseEntity.status(401).body("User not authenticated or not found");
            }

            Vehicle vehicle = new Vehicle();
            vehicle.setCompany(company);
            vehicle.setModel(model);
            vehicle.setManufacturingYear(manufacturingYear);
            vehicle.setRcNumber(rcNumber);
            vehicle.setInsuranceDetails(insuranceDetails);
            vehicle.setHasAc(hasAc);
            vehicle.setHasAudioSystem(hasAudioSystem);
            vehicle.setKmDriven(kmDriven);
            vehicle.setColor(color);
            vehicle.setVehicleNumber(vehicleNumber);
            vehicle.setDriverName(driverName);
            vehicle.setCapacity(capacity);
            vehicle.setDriver(driver);

            Vehicle savedVehicle = vehicleService.createVehicle(vehicle, carImages, rcImage, insuranceImage);
            System.out.println("DEBUG: Vehicle saved successfully with ID: " + savedVehicle.getId());
            return ResponseEntity.ok(savedVehicle);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String msg = e.getMostSpecificCause().getMessage();
            System.err.println("DEBUG: Data Integrity Error: " + msg);
            if (msg.contains("RC_NUMBER")) {
                return ResponseEntity.badRequest().body("Vehicle with this RC Number already exists.");
            } else if (msg.contains("VEHICLE_NUMBER")) {
                return ResponseEntity.badRequest().body("Vehicle with this Car Number already exists.");
            }
            return ResponseEntity.badRequest().body("Form data error: " + msg);
        } catch (Exception e) {
            System.err.println("DEBUG: Unexpected Error adding vehicle: " + e.getMessage());
            return ResponseEntity.status(500).body("Error adding vehicle: " + e.getMessage());
        }
    }

    @GetMapping("/my-vehicles")
    public ResponseEntity<List<Vehicle>> getMyVehicles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User driver = userService.findByUsername(currentUsername);
        
        if (driver == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(vehicleService.getVehiclesByDriver(driver));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Vehicle>> getPendingVehicles() {
        // Add check for Admin role if needed
        return ResponseEntity.ok(vehicleService.getVehiclesByStatus(Vehicle.VehicleStatus.PENDING));
    }

    // Admin endpoints could go here or in AdminController
    @PutMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateStatus(@PathVariable Long id, @RequestParam Vehicle.VehicleStatus status) {
        // Add check for Admin role here if needed, or rely on Security Config
        Vehicle updatedVehicle = vehicleService.updateVehicleStatus(id, status);
        if (updatedVehicle != null) {
            return ResponseEntity.ok(updatedVehicle);
        }
        return ResponseEntity.notFound().build();
    }
}
