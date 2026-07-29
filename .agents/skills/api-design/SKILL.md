---
name: api-design
description: Guidance for designing clean, consistent, well-structured RESTful APIs and contracts between frontend and backend systems. Use when creating API endpoints, defining request/response structures, designing OpenAPI/Swagger specifications, or establishing integration contracts.
---

# API Design & Interface Contracting Standards

This skill provides rules and best practices for creating consistent, developer-friendly, and predictable REST APIs.

---

## 1. Resource Naming & URI Design

- **Noun-Based Resources**: Use plural nouns for resources (e.g., `/api/v1/users`, `/api/v1/courses`, `/api/v1/flashcards`).
- **Hierarchical Relationships**: Represent sub-resources logically:
  - `GET /api/v1/courses/{courseId}/lessons`
  - `POST /api/v1/users/{userId}/progress`
- **Kebab-Case URLs**: Use lowercase letters separated by hyphens (e.g., `/api/v1/user-profiles`, `/api/v1/audio-files`).
- **Avoid Verbs in URIs**: Use standard HTTP methods to express actions rather than including actions in the URL path.
  - Good: `DELETE /api/v1/items/123`
  - Bad: `POST /api/v1/deleteItem?id=123`

---

## 2. HTTP Method Usage

| Method | Purpose | Idempotent | Safe | Typical Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | Retrieve resource(s) | Yes | Yes | 200 OK, 404 Not Found |
| `POST` | Create a new resource / process action | No | No | 201 Created, 400 Bad Request |
| `PUT` | Replace an existing resource completely | Yes | No | 200 OK, 204 No Content, 404 |
| `PATCH` | Partially update an existing resource | No | No | 200 OK, 400 Bad Request |
| `DELETE` | Remove a resource | Yes | No | 200 OK, 204 No Content, 404 |

---

## 3. HTTP Response Status Codes

- **2xx Success**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource successfully created (include `Location` header or created object).
  - `204 No Content`: Action succeeded, no body returned (e.g., DELETE).
- **4xx Client Errors**:
  - `400 Bad Request`: Payload validation error or malformed syntax.
  - `401 Unauthorized`: Authentication missing or token expired/invalid.
  - `403 Forbidden`: Authenticated user lacks necessary permissions.
  - `404 Not Found`: Resource does not exist.
  - `409 Conflict`: Business rule state conflict (e.g., duplicate email registration).
  - `422 Unprocessable Entity`: Valid syntax, but semantic validation failed.
- **5xx Server Errors**:
  - `500 Internal Server Error`: Unexpected server failure (do not leak internal stack traces to client).
  - `503 Service Unavailable`: Server or downstream dependency temporarily overloaded or down.

---

## 4. Pagination, Filtering, and Sorting

- **Pagination Query Parameters**: Use `page` (0-indexed or 1-indexed consistently) and `size` (default 20, max 100).
  - Example: `GET /api/v1/kanji?page=0&size=20`
- **Paginated Response Structure**:
  ```json
  {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  }
  ```
- **Filtering & Sorting**:
  - Filtering: `GET /api/v1/users?role=STUDENT&status=ACTIVE`
  - Sorting: `GET /api/v1/products?sort=createdAt,desc&sort=name,asc`

---

## 5. Error Payload Format

Standardize error payloads across all API endpoints:

```json
{
  "timestamp": "2026-07-24T11:45:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request parameters",
  "path": "/api/v1/auth/register",
  "details": [
    {
      "field": "email",
      "message": "Email format is invalid"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## 6. API Versioning & Documentation

- **Versioning Strategy**: Use URI path versioning (e.g., `/api/v1/`, `/api/v2/`) or header versioning.
- **OpenAPI / Swagger**: Maintain up-to-date OpenAPI (v3.0+) specifications for clear contract agreements between frontend and backend teams.
