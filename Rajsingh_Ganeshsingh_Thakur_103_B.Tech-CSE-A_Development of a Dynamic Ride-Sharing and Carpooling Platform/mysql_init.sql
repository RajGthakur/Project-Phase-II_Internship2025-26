-- 1. Create Database
CREATE DATABASE IF NOT EXISTS ridesharedb;
USE ridesharedb;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    vehicle_capacity INT NULL,
    vehicle_model VARCHAR(255) NULL,
    vehicle_number VARCHAR(255) NULL
);

-- 3. Create Rides Table
CREATE TABLE IF NOT EXISTS rides (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    available_seats INT NOT NULL,
    date_time DATETIME(6) NULL,
    destination VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    source VARCHAR(255) NOT NULL,
    status VARCHAR(50) NULL,
    driver_id BIGINT NOT NULL,
    CONSTRAINT FK_driver_ride FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_time DATETIME(6) NULL,
    status VARCHAR(50) NULL,
    passenger_id BIGINT NOT NULL,
    ride_id BIGINT NOT NULL,
    CONSTRAINT FK_passenger_booking FOREIGN KEY (passenger_id) REFERENCES users(id),
    CONSTRAINT FK_ride_booking FOREIGN KEY (ride_id) REFERENCES rides(id)
);
