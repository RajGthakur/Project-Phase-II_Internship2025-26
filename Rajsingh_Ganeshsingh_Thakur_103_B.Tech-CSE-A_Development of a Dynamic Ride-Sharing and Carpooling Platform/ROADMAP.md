# Ride-Sharing Platform - Development Roadmap

## Project Overview
This roadmap outlines the development of the Ride-Sharing Platform over 8 weeks, mapped specifically to the current project structure (`com.rideshare` backend, React/Vite frontend).

## Current Project State (Analysis)
- **Backend**: Spring Boot 3.2.2, MySQL, JWT Authentication.
- **Frontend**: React 19, Vite, Tailwind.
- **Database**: `ridesharedb` with `users`, `rides`, `bookings` tables.
- **Progress**: Weeks 1-2 are partially implemented (Basics of Auth and Ride Posting exist).

---

## Phase 1: Management & Ride Posting (Weeks 1-2)
**Goal**: Solidify the core user flows: Register, Login, Post Ride, Search, Book.

### 1.1 Authentication & User Profiles
*   **Backend**: 
    *   Verify `UserController` handles Profile updates (Avatar, Vehicle details).
    *   Ensure `SecurityConfig` correctly secures endpoints using JWT.
*   **Frontend**: 
    *   Integrate `Register.jsx` and `Login.jsx` with backend.
    *   Add "Profile" page to view/edit User details.

### 1.2 Ride Posting & Searching
*   **Backend**:
    *   `RideController`: Ensure endpoints for `createRide` and `searchRides`.
    *   *Optimization*: Add JPA Specifications for flexible search (Source, Dest, Date).
*   **Frontend**:
    *   `CreateRide.jsx`: Add form validation and DateTime pickers.
    *   `RideSearch.jsx`: Display results nicely; handle "No rides found".

### 1.3 Booking System
*   **Backend**:
    *   `BookingController`: Implement `bookRide`.
    *   *Logic*: Check seat availability atomic/transactionally prevents overbooking.
*   **Frontend**:
    *   Add "Book Now" button on Search results.
    *   Show Booking Confirmation modal.

---

## Phase 2: Fare, Payment & Matching (Weeks 3-4)
**Goal**: Add financial logic and real-time capabilities.

### 2.1 Dynamic Fare Calculation
*   **Backend**:
    *   [NEW] `FareService.java`: Implement logic.
        *   *Algo*: `Base Price + (Distance_km * Rate_per_km)`.
        *   Use Haversine formula for distance between Source/Dest coordinates (if using Lat/Lon) or simpler logic if using text-based cities.
*   **Frontend**:
    *   Show "Estimated Fare" in `CreateRide` and `RideSearch`.

### 2.2 Payment Integration
*   **Backend**:
    *   [NEW] `PaymentController` & `Transaction` Entity.
    *   Integrate a mock payment provider or Stripe/Razorpay SDK.
*   **Frontend**:
    *   [NEW] `Payment.jsx`: Handle checkout flow.
    *   "My Rides" history showing Paid/Pending status.

### 2.3 Route Matching
*   **Enhancement**: Allow partial matches (e.g., Ride from A -> C, Passenger wants A -> B).
    *   Requires upgrading `rides` schema to support intermediate stops.

---

## Phase 3: Notifications, Reviews & Admin (Weeks 5-6)
**Goal**: Enhance trust and engagement.

### 3.1 Notification System
*   **Backend**:
    *   [NEW] `Notification` Entity.
    *   Trigger notifications on: Booking Confirmed, Ride Cancelled.
*   **Frontend**:
    *   Add "Bell" icon in Navbar.
    *   Polling or WebSocket context for real-time alerts.

### 3.2 Review System
*   **Backend**:
    *   [NEW] `Review` Entity (`reviewer_id`, `reviewee_id`, `rating`, `comment`).
    *   Calculate Average Rating for Drivers/Passengers.
*   **Frontend**:
    *   Allow reviewing after a Ride is "Completed".
    *   Display User Rating stars on Profile/Ride cards.

### 3.3 Admin Dashboard
*   **Backend**:
    *   Secure endpoints with `hasRole('ADMIN')`.
*   **Frontend**:
    *   [NEW] `AdminDashboard.jsx`: Charts for Total Rides, Revenue, User Growth.

---

## Phase 4: Testing & Documentation (Weeks 7-8)
**Goal**: Polish and Prepare for production.

### 4.1 Testing
*   **Unit Tests**: `src/test/java/com/rideshare/backend/service/` (JUnit 5).
*   **Integration Tests**: Test full API flows `MockMvc`.
*   **UAT**: Manual walkthrough of all user stories.

### 4.2 Documentation
*   **API**: Add Swagger/OpenAPI (`springdoc-openapi-starter-webmvc-ui`).
*   **Deployment**: Dockerize the application (`Dockerfile` & `docker-compose.yml`).

---

## Immediate Next Steps (To start now)
1.  **Validation**: Run the current backend/frontend to confirm "Weeks 1-2" status.
2.  **Gap Fill**: Fix any broken Auth/Ride flows.
3.  **Start Fare Module**: Begin `FareService` implementation.
