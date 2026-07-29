---
name: backend-design
description: Guidance for designing and implementing backend architecture, RESTful APIs, database schemas, domain models, authentication/authorization, and server-side business logic. Use when writing controller-service-repository patterns, creating database migrations, building API endpoints, implementing security features, or optimizing backend performance.
---

# Backend Architecture & Server-Side Design Principles

This skill defines standards and patterns for designing scalable, maintainable, secure, and performant backend architectures.

---

## 1. Architectural Layers & Separation of Concerns

Enforce a clear layered architecture (e.g., Controller-Service-Repository / Clean Architecture):

1. **API / Controller Layer**:
   - Handles HTTP request parsing, status codes, routing, payload validation, and responses.
   - Delegates business logic immediately to the service layer.
   - Converts Domain/Entities into Data Transfer Objects (DTOs).

2. **Service Layer (Business Logic)**:
   - Contains core business processes, workflows, validation rules, and domain logic.
   - Orchestrates repositories, third-party integrations, and caching services.
   - Manages transactional boundaries (`@Transactional`).

3. **Repository / Data Access Layer**:
   - Encapsulates database queries (JPA, SQL, ORM, or query builders).
   - Keeps data access isolated from business logic.

---

## 2. API Contract & Data Transfer Objects (DTOs)

- **Strict DTO Isolation**: Never expose raw database entities directly over the API. Use dedicated Request and Response DTOs.
- **Request Validation**: Annotate input DTOs with validation rules (e.g., `@NotNull`, `@NotBlank`, `@Size`, `@Email`, or validation libraries).
- **Consistent Response Formats**: Standardize API outputs across all endpoints:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... },
    "timestamp": "2026-07-24T11:45:00Z"
  }
  ```
- **Global Error Handling**: Handle exceptions centrally (e.g., `@ControllerAdvice` in Spring Boot or error middleware in Express/Fastify). Return uniform RFC 7807 Problem Details or structured error objects.

---

## 3. Database Design & Data Integrity

- **Normalized Schemas**: Design relational database schemas up to 3NF where appropriate. Use explicit foreign keys, indexes, and unique constraints.
- **Indexing Strategy**: Index frequently queried columns, foreign keys, and sorting fields. Avoid over-indexing.
- **Database Migrations**: Version control database schema changes using tools like Flyway or Liquibase instead of auto-generating schemas in production (`ddl-auto=update`).
- **Pagination & Sorting**: Always paginate queries returning lists (`page`, `size`, `sort`). Avoid `SELECT *` without limit constraints.

---

## 4. Security & Authentication

- **Authentication & Tokens**: Use secure token mechanisms (JWT with RS256/HS256, session cookies with `HttpOnly`, `SameSite=Strict`, `Secure`).
- **Authorization & RBAC**: Enforce Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC) at both API and service method levels.
- **Input Sanitization & Injection Prevention**: Use parameterized queries or ORMs to eliminate SQL Injection. Sanitize inputs against XSS and command injection.
- **Sensitive Data Protection**: Hash passwords using modern algorithms (Bcrypt, Argon2, PBKDF2). Never log credentials, API keys, or PII.

---

## 5. Reliability, Performance & Observability

- **Transaction Management**: Define clear transaction scopes to prevent partial data updates or database lock escalations.
- **Caching**: Implement multi-level caching (e.g., Redis/Memcached) for hot read paths. Implement explicit cache eviction strategies.
- **Structured Logging**: Log contextually using JSON or standard formats (`timestamp`, `traceId`, `userId`, `logLevel`, `component`, `message`).
- **Idempotency**: Ensure state-changing requests (PUT, DELETE, or POST operations with idempotency keys) handle retries safely.

---

## 6. Verification Checklist

Before submitting backend code, verify:
1. [ ] DTOs are isolated from database entities.
2. [ ] All incoming request payloads have strict validation constraints.
3. [ ] Exceptions are caught and formatted uniformly by central error middleware.
4. [ ] Queries are optimized, paginated, and use appropriate database indexes.
5. [ ] Security permissions, authorization checks, and token verifications are enforced.
