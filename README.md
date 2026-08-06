# Nihon Journey — JLPT Training Platform

Nihon Journey is a full-stack web application for studying and practicing Japanese in preparation for the JLPT (N5 through N3). It is a personal project built to practice full-stack engineering end to end: a Spring Boot backend, a React frontend, a managed Postgres/Auth provider (Supabase), and an AI tutor feature backed by external LLM APIs.

The project is not affiliated with the Japan Foundation or the official JLPT organization. It is a learning exercise, built and iterated on as a way to practice backend architecture, frontend UI work, authentication, and deployment — not a commercial product.

## What it does

- Structured lessons for vocabulary, kanji, and grammar, split by level (N5, N4, N3), each paired with an auto-generated flashcard and multiple-choice quiz.
- Standalone vocabulary, kanji, and grammar browsers with search, level filtering, and a filter for personal study status (not started, needs review, mastered).
- Per-item progress tracking backed by a simple spaced-repetition schedule, with experience points awarded once per item the first time it is mastered.
- An AI tutor ("Sensei") for grammar questions, translation, and conversation practice, backed by Google Gemini and Groq, with per-user rate limiting.
- Account system backed by Supabase Auth (email/password and Google OAuth), with a lightweight onboarding step to pick a starting JLPT level.
- A streak tracker, XP total, and a profile page summarizing progress across vocabulary, kanji, and grammar.
- An admin panel (role-gated) for managing users, roles and permissions, and study content, with an audit log of administrative actions.

## Tech stack

Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA / Hibernate, PostgreSQL (hosted on Supabase), HikariCP.

Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router.

Auth and data: Supabase for Postgres hosting and authentication (JWT-based, validated on the backend). Row Level Security is enabled on all application tables; the backend connects with a role that bypasses RLS, so authorization is enforced in the Spring Security layer rather than at the database layer.

AI: Google Gemini and Groq (Llama 3.3) for the tutor chat feature, selected per use case.

Deployment: the backend is a self-contained Spring Boot jar (Dockerfile included) intended for a host like Render; the frontend is a static Vite build intended for Vercel. A Docker Compose setup is also included for running both services together, e.g. on a single VPS.

## Project structure

```
src/main/java/com/jlpt/tutor/   Spring Boot backend (controllers, services, repositories, entities)
src/main/resources/             application config, seed data
frontend/src/                   React frontend
  components/                   shared UI components
  features/                     one folder per feature area (auth, lesson, vocab, kanji, grammar, ai-chat, admin, dashboard)
  services/                     API clients
supabase/migrations/            reference SQL for Supabase-side setup (see note below)
```

## Running locally

### Prerequisites

- Java 17 and Maven (or use the included `mvnw` / `mvnw.cmd` wrapper)
- Node.js 18+ and npm
- A Supabase project (for Postgres and Auth), or Docker if you prefer the containerized setup

### Environment variables

Copy `.env.example` to `.env` in the project root and fill in real values:

```
GROQ_API_KEY=
GEMINI_API_KEY=
DB_URL=jdbc:postgresql://<your-supabase-pooler-host>:5432/postgres
DB_USERNAME=
DB_PASSWORD=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
JWT_SECRET=
CORS_ALLOWED_ORIGINS=http://localhost:5173
SPRING_PROFILES_ACTIVE=prod
```

`JWT_SECRET` and `DB_PASSWORD` have no default value and must be set, or the backend will fail to start — this is intentional, to avoid a fallback secret ever being used in a real deployment.

Copy `frontend/.env.example` to `frontend/.env.local` and fill in:

```
VITE_API_URL=http://localhost:8080/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Option 1: Docker Compose

```
docker compose up -d
```

This starts the backend on port 8080 and the frontend dev server (with hot reload) on port 5173.

### Option 2: Run each service manually

Backend:

```
./mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run       # macOS / Linux
```

Frontend, in a separate terminal:

```
cd frontend
npm install
npm run dev
```

## Deployment

For a split deployment:

- Frontend: deploy the `frontend/` directory to Vercel, with the environment variables listed above set in the Vercel project settings, and `VITE_API_URL` pointed at the deployed backend.
- Backend: deploy the repository root to Render (or any host that can run a Docker image) using the included `Dockerfile`. Set `CORS_ALLOWED_ORIGINS` to the deployed frontend's origin — it defaults to `http://localhost:5173`, which only works for local development.

For a single-host deployment, `docker-compose.prod.yml` builds and runs both services together behind their own containers.

## Notes on the Supabase migrations folder

`supabase/migrations/` contains SQL that was written directly against the Supabase project (outside of the backend's own Hibernate-managed schema) for a couple of one-off concerns: a trigger that mirrors new `auth.users` rows into `public.users`, and a one-time script to backfill `lesson` rows from existing content tables. These predate the backend's own auto-provisioning logic (`JwtAuthenticationFilter`) and are kept here mainly as a record of what was run against the database, not as an automated migration pipeline — the backend does not apply them on startup.

## Current limitations

This is a personal project at a "working prototype" stage rather than a production-hardened application. Notably:

- There is no automated test suite yet.
- Schema changes are applied via Hibernate's `ddl-auto: update` rather than versioned migrations, aside from the ad hoc Supabase SQL noted above.
- The database still has a Postgres-level trigger for user provisioning that duplicates the backend's own logic; the two are believed to be consistent in practice but have not been formally reconciled.

## License

MIT — see `LICENSE`.
