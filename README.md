# SARS - Sustainability Analytics & Reporting System

A full-stack enterprise web application for managing, analyzing and reporting sustainability data with hierarchical data modeling and workflow validation.

## Tech Stack
- **Backend**: Spring Boot 3.2 + Spring Security (JWT) + JPA/Hibernate
- **Database**: PostgreSQL (Neon hosted)
- **Frontend**: React 18 + Vite + Material UI v5 + Recharts

## Project Structure
```
sas/
├── backend/       ← Spring Boot API server
├── frontend/      ← React SPA
└── docker-compose.yml
```

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL (or Neon account)

---

## Quick Start

### 1. Configure the Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://YOUR_HOST/YOUR_DB?sslmode=require
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 2. Run the Backend
```bash
cd backend
mvn spring-boot:run
```
API will be available at `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
App will be available at `http://localhost:5173`

---

## Default Users

After the database initializes, create your first admin user via the **register endpoint** (no auth required on first setup — you may temporarily allow it in SecurityConfig):

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@sars.com","password":"admin123","role":"ADMIN"}'
```

Then use that JWT to create more users via the User Management UI.

---

## Docker Deployment

```bash
# Copy and configure environment
cp backend/.env.example .env
# Edit .env with your Neon credentials

# Build and start
docker-compose up --build
```

Frontend: `http://localhost:3000`
Backend API: `http://localhost:8080`

---

## API Documentation

Full Swagger docs available at: `http://localhost:8080/swagger-ui.html`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register user (Admin) |
| GET | `/api/organizations` | List organizations |
| GET | `/api/places?organizationId=` | List places |
| GET | `/api/machines?placeId=` | List machines |
| GET | `/api/metrics` | List metrics |
| POST | `/api/data-entries` | Submit data |
| PUT | `/api/data-entries/{id}/approve` | Approve entry |
| PUT | `/api/data-entries/{id}/reject` | Reject entry |
| GET | `/api/analytics/organization/{id}` | Org analytics |
| GET | `/api/analytics/trends?metricId=` | Trend data |
| GET | `/api/analytics/anomalies` | Anomaly report |
| POST | `/api/reports/generate` | Generate PDF/Excel |
| GET | `/api/notifications` | User notifications |

---

## Role Access Matrix

| Feature | Admin | Manager | Analyst | Employee |
|---------|-------|---------|---------|----------|
| Submit Data | ✅ | ❌ | ✅ | ✅ |
| Validate Data | ✅ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Org Setup | ✅ | ❌ | ❌ | ❌ |

---

## Database Schema

The schema is auto-created by Hibernate (`ddl-auto=update`). Key tables:
- `organizations` → `places` → `machines`
- `metrics` (with configurable threshold)
- `data_entries` (workflow: PENDING → APPROVED/REJECTED)
- `audit_logs`, `reports`, `notifications`, `users`
