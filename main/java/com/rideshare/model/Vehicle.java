package com.rideshare.model;

import java.util.List;

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

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COMPANY", nullable = false)
    private String company;

    @Column(name = "MODEL", nullable = false)
    private String model;

    @Column(name = "MANUFACTURING_YEAR", nullable = false)
    private Integer manufacturingYear;

    @Column(name = "RC_NUMBER", nullable = false, unique = true)
    private String rcNumber;

    @Column(name = "INSURANCE_DETAILS", nullable = false)
    private String insuranceDetails;

    @Column(name = "HAS_AC", nullable = false)
    private Boolean hasAc;

    @Column(name = "HAS_AUDIO_SYSTEM", nullable = false)
    private Boolean hasAudioSystem;

    @Column(name = "KM_DRIVEN", nullable = false)
    private String kmDriven;

    @Column(name = "COLOR", nullable = false)
    private String color;

    @Column(name = "VEHICLE_NUMBER", nullable = false, unique = true)
    private String vehicleNumber;
    
    @Column(name = "DRIVER_NAME", nullable = false)
    private String driverName;
    
    @Column(name = "CAPACITY", nullable = false)
    private Integer capacity;

    @Column(name = "IMAGE_URL")
    private String imageUrl;

    @Column(name = "IMAGE_URL_1")
    private String imageUrl1;

    @Column(name = "IMAGE_URL_2")
    private String imageUrl2;

    @Column(name = "IMAGE_URL_3")
    private String imageUrl3;

    @Column(name = "IMAGE_URL_4")
    private String imageUrl4;

    @Column(name = "IMAGE_URL_5")
    private String imageUrl5;

    @Column(name = "RC_IMAGE_URL")
    private String rcImageUrl;

    @Column(name = "INSURANCE_IMAGE_URL")
    private String insuranceImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private VehicleStatus status = VehicleStatus.APPROVED;

    @ManyToOne
    @JoinColumn(name = "DRIVER_ID", nullable = false)
    private User driver;

    public enum VehicleStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
    

    // Constructors
    public Vehicle() {}

    public Vehicle(Long id, String company, String model, Integer manufacturingYear, String rcNumber, String insuranceDetails, Boolean hasAc, Boolean hasAudioSystem, String kmDriven, String color, String vehicleNumber, String driverName, Integer capacity, String imageUrl, String imageUrl1, String imageUrl2, String imageUrl3, String imageUrl4, String imageUrl5, String rcImageUrl, String insuranceImageUrl, VehicleStatus status, User driver) {
        this.id = id;
        this.company = company;
        this.model = model;
        this.manufacturingYear = manufacturingYear;
        this.rcNumber = rcNumber;
        this.insuranceDetails = insuranceDetails;
        this.hasAc = hasAc;
        this.hasAudioSystem = hasAudioSystem;
        this.kmDriven = kmDriven;
        this.color = color;
        this.vehicleNumber = vehicleNumber;
        this.driverName = driverName;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;
        this.imageUrl3 = imageUrl3;
        this.imageUrl4 = imageUrl4;
        this.imageUrl5 = imageUrl5;
        this.rcImageUrl = rcImageUrl;
        this.insuranceImageUrl = insuranceImageUrl;
        this.status = status;
        this.driver = driver;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getManufacturingYear() { return manufacturingYear; }
    public void setManufacturingYear(Integer manufacturingYear) { this.manufacturingYear = manufacturingYear; }

    public String getRcNumber() { return rcNumber; }
    public void setRcNumber(String rcNumber) { this.rcNumber = rcNumber; }

    public String getInsuranceDetails() { return insuranceDetails; }
    public void setInsuranceDetails(String insuranceDetails) { this.insuranceDetails = insuranceDetails; }

    public Boolean getHasAc() { return hasAc; }
    public void setHasAc(Boolean hasAc) { this.hasAc = hasAc; }

    public Boolean getHasAudioSystem() { return hasAudioSystem; }
    public void setHasAudioSystem(Boolean hasAudioSystem) { this.hasAudioSystem = hasAudioSystem; }

    public String getKmDriven() { return kmDriven; }
    public void setKmDriven(String kmDriven) { this.kmDriven = kmDriven; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageUrl1() { return imageUrl1; }
    public void setImageUrl1(String imageUrl1) { this.imageUrl1 = imageUrl1; }

    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }

    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }

    public String getImageUrl4() { return imageUrl4; }
    public void setImageUrl4(String imageUrl4) { this.imageUrl4 = imageUrl4; }

    public String getImageUrl5() { return imageUrl5; }
    public void setImageUrl5(String imageUrl5) { this.imageUrl5 = imageUrl5; }

    // Helper method to maintain frontend compatibility
    @jakarta.persistence.Transient
    @com.fasterxml.jackson.annotation.JsonProperty("carImageUrls")
    public List<String> getCarImageUrls() {
        List<String> urls = new java.util.ArrayList<>();
        if (imageUrl1 != null && !imageUrl1.isEmpty()) urls.add(imageUrl1);
        if (imageUrl2 != null && !imageUrl2.isEmpty()) urls.add(imageUrl2);
        if (imageUrl3 != null && !imageUrl3.isEmpty()) urls.add(imageUrl3);
        if (imageUrl4 != null && !imageUrl4.isEmpty()) urls.add(imageUrl4);
        if (imageUrl5 != null && !imageUrl5.isEmpty()) urls.add(imageUrl5);
        return urls;
    }

    public String getRcImageUrl() { return rcImageUrl; }
    public void setRcImageUrl(String rcImageUrl) { this.rcImageUrl = rcImageUrl; }

    public String getInsuranceImageUrl() { return insuranceImageUrl; }
    public void setInsuranceImageUrl(String insuranceImageUrl) { this.insuranceImageUrl = insuranceImageUrl; }

    public VehicleStatus getStatus() { return status; }
    public void setStatus(VehicleStatus status) { this.status = status; }

    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }
}
