# CronoMed v2 — Hospital Queue Management System

> **CronoMed** is a full-stack, concurrent-safe hospital queue management system built with **React + Vite** and **Spring Boot**. It enables patients to book appointments online and lets doctors manage their live queue in real time — all secured with JWT authentication.

---

## 📸 Overview

| Role | What they can do |
|---|---|
| 🧑‍⚕️ **Patient** | Register, log in, book appointments, track live queue position, view appointment history |
| 👨‍⚕️ **Doctor** | View today's queue, call the next patient, mark appointments as complete |

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** (Vite) | UI framework & build tooling |
| **Tailwind CSS v4** | Utility-first styling & responsive layouts |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP API client with JWT interceptor |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Runtime |
| **Spring Boot 3.4.1** | Application framework |
| **Spring Security** | Authentication & authorization |
| **JWT (jjwt)** | Stateless token-based auth |
| **Spring Data JPA / Hibernate** | ORM & database access |
| **PostgreSQL (Supabase)** | Cloud-hosted relational database |
| **Gradle** | Build system |
| **Lombok** | Boilerplate reduction |

---

## 🗂️ Project Structure

```
CronoMed-version-2/
├── backend/                          # Spring Boot application
│   └── src/main/java/com/smartcare/backend/
│       ├── config/
│       │   ├── DataInitializer.java  # Seeds doctors & patients on startup
│       │   ├── SecurityConfig.java   # Spring Security filter chain (JWT, stateless)
│       │   └── WebConfig.java        # CORS configuration (externalized)
│       ├── controller/
│       │   ├── AuthController.java   # POST /api/auth/login, /register
│       │   ├── QueueController.java  # Booking, queue, history, next-patient endpoints
│       │   └── GlobalExceptionHandler.java  # Maps exceptions → 404/400/403/500 JSON
│       ├── dto/
│       │   ├── BookRequest.java      # Request body for booking (doctorId + date)
│       │   ├── LoginRequest/Response # Auth DTOs
│       │   └── RegisterRequest/Response
│       ├── exception/
│       │   └── NotFoundException.java  # Custom 404 exception
│       ├── model/
│       │   ├── Appointment.java      # Entity: id, doctor, patientName, queueNumber, date, status
│       │   ├── AppointmentStatus.java  # Enum: PENDING | IN_PROGRESS | COMPLETED
│       │   ├── Doctor.java           # Entity: id, name, speciality, avgConsultationTime
│       │   ├── Role.java             # Enum: PATIENT | DOCTOR
│       │   └── User.java             # Entity: id, username, passwordHash, role
│       ├── repository/               # Spring Data JPA interfaces
│       ├── security/
│       │   ├── JwtTokenProvider.java       # Token generation & validation (HS256)
│       │   └── JwtAuthenticationFilter.java # Extracts JWT from Authorization header
│       └── service/
│           └── QueueService.java     # Core business logic (booking, queue, history)
│
└── frontend/                         # React + Vite application
    ├── .env                          # Local environment variables (gitignored)
    ├── .env.example                  # Template for environment variables
    └── src/
        ├── api/
        │   └── client.js             # Axios instance with JWT & 401-redirect interceptors
        └── pages/
            ├── Login.jsx             # Login + patient registration page
            ├── PatientPortal.jsx     # Patient dashboard (book, queue, history)
            └── DoctorDashboard.jsx   # Doctor dashboard (queue management, date selector)
```

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based stateless auth** — tokens signed with HS256, expiry configurable via `app.jwt.expiration`
- **Role-based access control** — `PATIENT` and `DOCTOR` roles enforced by `@PreAuthorize`
- **Server-authoritative identity** — booking and history endpoints derive `patientName` from the JWT, not from the request body (prevents impersonation)
- **Password strength validation** — registration enforces uppercase, lowercase, digit, special character, minimum 8 chars, and blocks common patterns
- **Fail-fast JWT key check** — if `JWT_SECRET` is too short (< 256 bits), the application refuses to start

### 🏥 Queue Management
- **Appointment booking** — patients select a doctor, date, and book; a queue number is automatically assigned
- **Live queue tracking** — patients see their real-time position and estimated wait time (auto-refreshes every 5 s)
- **Doctor queue view** — doctors see all patients for a selected date with status badges
- **Call next patient** — one click advances the queue; the current patient is auto-completed
- **Manual complete** — doctors can explicitly finish the current patient without needing a next one
- **Date-aware queue** — doctors can navigate to any date's queue; all operations use the selected date

### 🔒 Concurrency Safety
- **Per-doctor locking** — `ConcurrentHashMap<Long, Object>` ensures Doctor A's bookings never block Doctor B's
- **`@Transactional` on booking** — count-then-insert is wrapped in a DB transaction for correctness
- **Unique queue numbers** — assigned inside the lock, eliminating race conditions under concurrent requests

### 🌐 API Design
- **Structured error responses** — `GlobalExceptionHandler` returns `{ "error": "..." }` with proper HTTP codes:
  - `NotFoundException` → **404**
  - `IllegalStateException` → **400**
  - `SecurityException` → **403**
  - All others → **500**
- **Externalized configuration** — CORS origins (`app.cors.allowed-origins`) and API base URL (`VITE_API_BASE_URL`) are environment-configurable

### 🎨 Frontend UX
- **Loading spinners** — every async operation (book, fetch queue, fetch history) shows an animated spinner
- **Inline error messages** — errors appear in context (red banner/text), not as browser `alert()` popups
- **Auto-refreshing queue** — live queue updates every 5 seconds while the panel is open
- **Date picker on Doctor Dashboard** — navigate to any date's queue with a "Back to today" shortcut

---

## 🗄️ Seeded Data

### Doctors (seeded from `data.sql` on startup)
| Name | Speciality | Avg. Consultation |
|---|---|---|
| Dr. Anil Fernando | General Physician | 10 min |
| Dr. Chaminda Perera | General Physician | 10 min |
| Dr. Ruwanthi Senanayake | Cardiologist | 15 min |
| Dr. S. Jeganathan | Neurologist | 20 min |
| Dr. Fathima Rizvi | Pediatrician | 12 min |
| Dr. Kithsiri Silva | Orthopedic Surgeon | 15 min |
| Dr. M. A. Dissanayake | Endocrinologist | 15 min |
| Dr. Priyantha Gunawardena | ENT Surgeon | 12 min |
| Dr. Tharushi Jayasinghe | Dermatologist | 10 min |

### Patients (seeded from `DataInitializer.java` on startup)
| Username | Password |
|---|---|
| kenul | kenul_1234 |
| nimsara | nimsara_1234 |
| chamitha | chamitha_1234 |
| risandu | risandu_1234 |
| kethmika | kethmika_1234 |

### Doctor Login
Doctor accounts are auto-generated from the doctor name:
- **Username:** slugified doctor name (e.g., `dr.anil.fernando`)
- **Password:** `password123`
- On slug collision, the doctor's database ID is appended (e.g., `dr.silva.4`)

---

## 🛠️ Running Locally

### Prerequisites
- **Java 17+** (JDK)
- **Node.js 18+** and **npm**
- A **Supabase** PostgreSQL project (or any PostgreSQL instance)

### 1. Clone the repository
```bash
git clone https://github.com/nimsara-uom/CronoMed-version-2.git
cd CronoMed-version-2
```

### 2. Set up environment variables

**Backend** — set these in your shell before running:
```powershell
# Windows PowerShell
$env:JWT_SECRET="your-secret-key-must-be-at-least-32-characters-long"
$env:DB_PASSWORD="your-supabase-db-password"
```
```bash
# Mac/Linux
export JWT_SECRET="your-secret-key-must-be-at-least-32-characters-long"
export DB_PASSWORD="your-supabase-db-password"
```

**Frontend** — copy the example and edit:
```bash
cd frontend
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend runs on a different host/port
```

### 3. Start the Backend (Port 8080)
```powershell
cd backend

# Windows
$env:JWT_SECRET="..."; $env:DB_PASSWORD="..."; .\gradlew.bat bootRun

# Mac/Linux
JWT_SECRET="..." DB_PASSWORD="..." ./gradlew bootRun
```

### 4. Start the Frontend (Port 5173)
```bash
cd frontend
npm install       # first time only
npm run dev
```

### 5. Open the app
Navigate to **http://localhost:5173/**

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | None | Login with username + password → JWT |
| `POST` | `/auth/register` | None | Register new patient account → JWT |

### Queue
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/doctors` | None | List all doctors |
| `POST` | `/book` | Patient / Doctor | Book appointment (patientName from JWT) |
| `GET` | `/queue?doctorId=&date=` | Any | Get queue for a doctor on a date |
| `GET` | `/history` | Any | Get own appointment history (from JWT) |
| `PUT` | `/start/{id}` | Doctor only | Start a specific appointment |
| `PUT` | `/complete/{id}` | Doctor only | Complete an in-progress appointment |
| `PUT` | `/next?doctorId=&date=` | Doctor only | Auto-complete current, start next PENDING |

### Error Response Format
All errors return JSON:
```json
{ "error": "Human-readable error message" }
```

---

## ⚙️ Configuration Reference

### Backend (`application.properties`)
| Property | Default / Source | Description |
|---|---|---|
| `server.port` | `8080` | Backend HTTP port |
| `spring.datasource.url` | hardcoded | Supabase PostgreSQL JDBC URL |
| `spring.datasource.password` | `${DB_PASSWORD}` | DB password from env var |
| `app.jwt.secret` | `${JWT_SECRET}` | HS256 signing key (min 32 bytes) |
| `app.jwt.expiration` | `86400000` | Token expiry in ms (24 hours) |
| `app.cors.allowed-origins` | `http://localhost:5173,...` | Comma-separated allowed origins |

### Frontend (`.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend API base URL |

---

## 🔒 Security Notes

- JWTs are stored in `localStorage` — acceptable for a demo/internal tool. For production, migrate to `httpOnly` cookies to prevent XSS-based token theft.
- `JWT_SECRET` must be **at least 32 bytes** (256 bits). The app will **refuse to start** with a weak key — this is intentional.
- All CORS origins are externalized and must be explicitly configured for production deployments.
- Patient history and booking identity are enforced server-side from the JWT — clients cannot spoof another user's data.

---

## 🧑‍💻 Contributors

| Name | Role |
|---|---|
| Nimsara | Backend + Queue Logic + Concurrency |
| Kethmika | Frontend Login + Booking UI + Doctor Dashboard|
| Kenul | Authentication + JWT |
| Chamitha | Data Layer + Config |
| Risandu | dashboard + API Layer |


---

## 📄 License

[MIT](LICENSE)
