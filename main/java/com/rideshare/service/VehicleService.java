package com.rideshare.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rideshare.model.User;
import com.rideshare.model.Vehicle;
import com.rideshare.repository.VehicleRepository;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Vehicle createVehicle(Vehicle vehicle, List<MultipartFile> carImages, MultipartFile rcImage, MultipartFile insuranceImage) {
        if (vehicle.getKmDriven() != null && !vehicle.getKmDriven().matches("^\\d+(\\s*[Kk][Mm])?$")) {
            throw new IllegalArgumentException("Kilometers Driven must contain only numbers or numbers followed by ' Km'");
        }
        System.out.println("DEBUG: Service storing images for vehicle...");
        if (carImages != null && !carImages.isEmpty()) {
            System.out.println("DEBUG: Processing " + carImages.size() + " car images");
            int count = 1;
            for (MultipartFile image : carImages) {
                if (image != null && !image.isEmpty() && count <= 5) {
                    String fileName = fileStorageService.storeFile(image);
                    
                    switch (count) {
                        case 1 -> vehicle.setImageUrl1(fileName);
                        case 2 -> vehicle.setImageUrl2(fileName);
                        case 3 -> vehicle.setImageUrl3(fileName);
                        case 4 -> vehicle.setImageUrl4(fileName);
                        case 5 -> vehicle.setImageUrl5(fileName);
                    }

                    // Also set the main image_url for the vehicles table
                    if (vehicle.getImageUrl() == null) {
                        vehicle.setImageUrl(fileName);
                    }
                    System.out.println("DEBUG: Stored car image " + count + ": " + fileName);
                    count++;
                }
            }
        }
        if (rcImage != null && !rcImage.isEmpty()) {
            String fileName = fileStorageService.storeFile(rcImage);
            vehicle.setRcImageUrl(fileName);
            System.out.println("DEBUG: Stored RC image: " + fileName);
        }
        if (insuranceImage != null && !insuranceImage.isEmpty()) {
            String fileName = fileStorageService.storeFile(insuranceImage);
            vehicle.setInsuranceImageUrl(fileName);
            System.out.println("DEBUG: Stored Insurance image: " + fileName);
        }
        @SuppressWarnings("null")
        Vehicle saved = vehicleRepository.save(vehicle);
        System.out.println("DEBUG: Vehicle object persisted to database");
        return saved;
    }

    public List<Vehicle> getVehiclesByDriver(User driver) {
        return vehicleRepository.findByDriver(driver);
    }
    
    public List<Vehicle> getVehiclesByStatus(Vehicle.VehicleStatus status) {
        return vehicleRepository.findByStatus(status);
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle updateVehicleStatus(Long id, Vehicle.VehicleStatus status) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(id);
        if (vehicleOpt.isPresent()) {
            Vehicle vehicle = vehicleOpt.get();
            vehicle.setStatus(status);
            return vehicleRepository.save(vehicle);
        }
        return null; // Or throw exception
    }
}
