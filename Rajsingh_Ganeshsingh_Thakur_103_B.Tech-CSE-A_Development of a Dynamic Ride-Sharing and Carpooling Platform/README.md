# Smart Ride Sharing - Dynamic Ride-Sharing & Carpooling Platform

Smart Ride Sharing is a modern, full-stack application designed to optimize urban mobility. It connects drivers with empty seats to passengers travelling in the same direction, promoting sustainability and community-driven transportation.

![Ride-Share Illustration](file:///Users/rajthakur/.gemini/antigravity/brain/dc53004d-bb59-4364-9efd-75794609d2cf/rideshare_concept_1_1771159500108.png)

## 🚀 Key Features

- **Multi-Role Support**: Distinct personalized dashboards for **Admins**, **Drivers**, and **Passengers**.
- **Dynamic Ride Search**: Advanced algorithms to find the most efficient carpooling options.
- **Secure Authentication**: Robust JWT-based security system with multi-step registration.
- **Responsive UI/UX**: Professional design built with React, featuring smooth animations and a premium look.
- **Trusted Community**: Profile verification and role-based access control.

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, CSS3 (Modular Styles), Lucide Icons.
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data JPA.
- **Database**: MySQL Server.
- **Build Tools**: Maven, NPM.

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Java 17+**
- **Node.js (v18+)**
- **MySQL Server**

### 2. Environment Configuration
To keep your secrets safe, this project uses environment variables. Copy the example properties file and set your credentials:

```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

**Required Environment Variables (or set in application.properties):**
- `DB_USERNAME`: Your MySQL username.
- `DB_PASSWORD`: Your MySQL password.
- `JWT_SECRET`: A secure 64-character string for token signing.

### 3. Run the Backend
```bash
cd backend
mvn spring-boot:run
```
The API server will be available at `http://localhost:8080`.

### 4. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🔒 Security Best Practices
- **Sensitive files** (`application.properties`, `node_modules`, `target`) are ignored via `.gitignore`.
- **JWT Secrets** are configurable and never hardcoded in the repository.
- **Case-Insensitive** username validation for improved authentication resilience.

---
*Developed as part of the Dynamic Ride-Sharing and Carpooling Platform project.*
