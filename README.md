# CronoMed-version-2.0

ChronoMed is a full-stack, concurrent-safe hospital queue management app built with React and Spring Boot. It provides a real-time Patient Portal for booking appointments and a live Doctor Dashboard for queue management.

## Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS v4** (Modern styling and responsive layouts)
- **React Router** (Client-side routing)
- **Axios** (API requests)
- **Lucide React** (Icons)

### Backend
- **Java 17** & **Spring Boot 3.4.1**
- **Spring Data JPA / Hibernate** (ORM)
- **PostgreSQL (Supabase)**
- **Spring Security + JWT**

## Key Features
- **Concurrent-Safe Booking:** Thread-safe booking to prevent race conditions during simultaneous requests.
- **Dynamic Live Queue:** Patients can see their live position in the queue.
- **Doctor Dashboard:** Doctors can view patient load, consult patients, and mark appointments as completed.
- **JWT Auth + Patient Registration:** Secure login and self-service patient account creation.


## How to Run Locally

You will need two separate terminal windows to run both the frontend and the backend.

### 1. Start the Backend (Spring Boot)
The backend runs on **Port 8080**. It will connect to Supabase Postgres and seed the doctor list.

```bash
cd backend

# On Windows:
.\gradlew.bat bootRun

# On Mac/Linux:
./gradlew bootRun
```

### 2. Start the Frontend (React)
The frontend runs on **Port 5173**.

```bash
cd frontend

# Install dependencies (only needed the first time)
npm install

# Start the development server
npm run dev
```

### 3. Open the App
Once both servers are running, open your browser and navigate to:
**http://localhost:5173/**

## How to Use

- **Patient Registration:** Use "Register as Patient" on the login page and sign up with a username/password.
- **Patient Login:** Use your registered username/password.
- **Doctor Login:** Select "Doctor" and use `password123` (seeded doctors).

## Doctor Seed Data

Doctor accounts are seeded at startup in:
`backend/src/main/java/com/smartcare/backend/config/DataInitializer.java`
