package com.rideshare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User implements org.springframework.security.core.userdetails.UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USERNAME", unique = true, nullable = false)
    private String username;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private Role role;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private UserStatus status = UserStatus.APPROVED;

    // General Info (Updated)
    @Column(name = "CONTACT_NUMBER")
    private String contactNumber;
    @Column(name = "GENDER")
    private String gender;
    @Column(name = "DATE_OF_BIRTH")
    private String dateOfBirth;

    // Address (New)
    @Column(name = "PLOT_NO")
    private String plotNo;
    @Column(name = "STREET")
    private String street;
    @Column(name = "LANDMARK")
    private String landmark;
    @Column(name = "CITY")
    private String city;
    @Column(name = "STATE")
    private String state;
    @Column(name = "PINCODE")
    private String pincode;
    @Column(name = "COUNTRY")
    private String country;

    // Education (Updated)
    @Column(name = "SCHOOL_10")
    private String school10;
    @Column(name = "PASSING_YEAR_10")
    private Integer passingYear10;
    @Column(name = "TENTH_PERCENTAGE")
    private Double tenthPercentage;
    
    @Column(name = "SCHOOL_12")
    private String school12;
    @Column(name = "PASSING_YEAR_12")
    private Integer passingYear12;
    @Column(name = "TWELFTH_PERCENTAGE")
    private Double twelfthPercentage;
    
    @Column(name = "GRADUATION_COLLEGE")
    private String graduationCollege;
    @Column(name = "GRADUATION_YEAR")
    private Integer graduationYear;
    @Column(name = "GRADUATION_PERCENTAGE")
    private Double graduationPercentage;

    // Documents
    @Column(name = "AADHAR_CARD_ID")
    private String aadharCardId;
    @Column(name = "PAN_CARD_ID")
    private String panCardId;


    // Driver specific fields
    @Column(name = "VEHICLE_MODEL")
    private String vehicleModel;
    @Column(name = "VEHICLE_NUMBER")
    private String vehicleNumber;
    
    @Column(name = "RESET_TOKEN")
    private String resetToken;

    @Column(name = "IS_FIRST_LOGIN")
    private Boolean isFirstLogin = true;

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    @Column(name = "VEHICLE_CAPACITY")
    private Integer vehicleCapacity;

    public enum Role {
        ADMIN,
        PASSENGER,
        DRIVER
    }

    // Constructors
    public User() {}

    public User(Long id, String username, String password, String name, Role role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = role;
        this.status = UserStatus.APPROVED;
    }


    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @Override
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPlotNo() { return plotNo; }
    public void setPlotNo(String plotNo) { this.plotNo = plotNo; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    // Education Getters/Setters
    public String getSchool10() { return school10; }
    public void setSchool10(String school10) { this.school10 = school10; }

    public Integer getPassingYear10() { return passingYear10; }
    public void setPassingYear10(Integer passingYear10) { this.passingYear10 = passingYear10; }

    public Double getTenthPercentage() { return tenthPercentage; }
    public void setTenthPercentage(Double tenthPercentage) { this.tenthPercentage = tenthPercentage; }

    public String getSchool12() { return school12; }
    public void setSchool12(String school12) { this.school12 = school12; }

    public Integer getPassingYear12() { return passingYear12; }
    public void setPassingYear12(Integer passingYear12) { this.passingYear12 = passingYear12; }

    public Double getTwelfthPercentage() { return twelfthPercentage; }
    public void setTwelfthPercentage(Double twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }

    public String getGraduationCollege() { return graduationCollege; }
    public void setGraduationCollege(String graduationCollege) { this.graduationCollege = graduationCollege; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public Double getGraduationPercentage() { return graduationPercentage; }
    public void setGraduationPercentage(Double graduationPercentage) { this.graduationPercentage = graduationPercentage; }

    public String getAadharCardId() { return aadharCardId; }
    public void setAadharCardId(String aadharCardId) { this.aadharCardId = aadharCardId; }

    public String getPanCardId() { return panCardId; }
    public void setPanCardId(String panCardId) { this.panCardId = panCardId; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public Integer getVehicleCapacity() { return vehicleCapacity; }
    public void setVehicleCapacity(Integer vehicleCapacity) { this.vehicleCapacity = vehicleCapacity; }

    // UserDetails methods implementation...
    @Override
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public Boolean isFirstLogin() { return isFirstLogin == null || isFirstLogin; }
    public void setFirstLogin(Boolean firstLogin) { isFirstLogin = firstLogin; }
}
