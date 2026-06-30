# CronoMed v2

Hospital queue management system. Patients book appointments, doctors manage the live queue.

**Stack:** React + Vite (frontend) · Spring Boot 3 + PostgreSQL/Supabase (backend) · JWT auth

---

## Run Locally

**Backend** (port 8080)
```bash
cd backend
$env:JWT_SECRET="dev-secret-key-for-local-testing-minimum-256-bits-long-enough"
$env:DB_PASSWORD="pX93%ebCSZc2Xi-"
.\gradlew.bat bootRun
```

**Frontend** (port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open → http://localhost:5173

---

## Login Credentials

### Patients
| Username | Password |
|---|---|
| kenul | kenul_1234 |
| nimsara | nimsara_1234 |
| chamitha | chamitha_1234 |
| risandu | risandu_1234 |
| kethmika | kethmika_1234 |

### Doctors — password is `password123` for all
| Username | Name |
|---|---|
| dr.anil.fernando | Dr. Anil Fernando — General Physician |
| dr.chaminda.perera | Dr. Chaminda Perera — General Physician |
| dr.ruwanthi.senanayake | Dr. Ruwanthi Senanayake — Cardiologist |
| dr.s.jeganathan | Dr. S. Jeganathan — Neurologist |
| dr.fathima.rizvi | Dr. Fathima Rizvi — Pediatrician |
| dr.kithsiri.silva | Dr. Kithsiri Silva — Orthopedic Surgeon |
| dr.m.a.dissanayake | Dr. M. A. Dissanayake — Endocrinologist |
| dr.priyantha.gunawardena | Dr. Priyantha Gunawardena — ENT Surgeon |
| dr.tharushi.jayasinghe | Dr. Tharushi Jayasinghe — Dermatologist |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/register` | None | Register patient |
| GET | `/api/doctors` | None | List doctors |
| POST | `/api/book` | Required | Book appointment |
| GET | `/api/queue?doctorId=&date=` | Required | Get queue |
| GET | `/api/history` | Required | Own appointment history |
| PUT | `/api/start/{id}` | Doctor | Start appointment |
| PUT | `/api/complete/{id}` | Doctor | Complete appointment |
| PUT | `/api/next?doctorId=&date=` | Doctor | Call next patient |

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `JWT_SECRET` | Backend | Min 32 chars — app won't start without it |
| `DB_PASSWORD` | Backend | Supabase PostgreSQL password |
| `VITE_API_BASE_URL` | Frontend `.env` | Backend URL (default: `http://localhost:8080/api`) |
| `app.cors.allowed-origins` | `application.properties` | Comma-separated allowed origins |

---

---

## Contributors
Nimsara · Kenul · Chamitha · Risandu · Kethmika
