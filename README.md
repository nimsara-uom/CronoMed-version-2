# ChronoMed (formerly SmartCare Flow)

ChronoMed is a full-stack, concurrent-safe hospital queue management MVP built with React and Spring Boot. It provides a real-time Patient Portal for booking appointments and a live Doctor Dashboard for queue management.

## 🚀 Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS v4** (Modern styling and responsive layouts)
- **React Router** (Client-side routing)
- **Axios** (API requests)
- **Lucide React** (Icons)

### Backend
- **Java 17** & **Spring Boot 3.4.1**
- **Spring Data JPA / Hibernate** (ORM)
- **H2 In-Memory Database** (Requires zero configuration, seeded automatically on startup)

## ✨ Key Features
- **Concurrent-Safe Booking:** Built with thread-safe `synchronized` methods to prevent race conditions during simultaneous bookings.
- **Dynamic Live Queue:** Patients can see their live position in the queue.
- **Doctor Dashboard:** Doctors can view their exact patient load, consult patients, and mark appointments as completed.
- **Database Agnostic:** Uses Spring Data JPA, meaning you can easily swap the H2 in-memory database out for Supabase, PostgreSQL, or MySQL by just modifying `application.properties`.

---

## 🛠️ How to Run Locally

You will need two separate terminal windows to run both the frontend and the backend.

### 1. Start the Backend (Spring Boot)
The backend runs on **Port 8080**. It will automatically create the database and insert the initial list of doctors.

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

## 👤 How to Use (Mock Login)

Since this is an MVP, authentication is currently mocked:
- **Patient Login:** Select the "Patient" role, type any username, and type any password.
- **Doctor Login:** Select the "Doctor" role, choose your name from the dynamically generated dropdown list, and type any password.

## 🗄️ Database Changes

If you want to add more doctors or change their average consultation times, simply edit the SQL inserts located at:
`backend/src/main/resources/data.sql`
The database will reset and apply these changes every time you restart the backend server.
