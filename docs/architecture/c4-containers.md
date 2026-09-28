# C4 — Containers

The BFF app is a Node.js + Express 5 service. Containers inside the BFF process:

```mermaid
C4Container
  title Containers inside the BFF process

  Container(bff_app, "BFF Express app", "Node.js + Express 5", "HTTP endpoints, middleware pipeline, view orchestration")
  Container(mock_router, "Mock contract router", "TypeScript", "Routes from CONTRACT_SCHEMAS registry, returns contract examples")
  Container(static_server, "Static SPA server", "TypeScript", "Serves hashed assets with immutable cache, SPA fallback for unknown paths")
  Container(logger, "Pino logger", "TypeScript", "Structured logging with traceId propagation, redaction for secrets")
  Container(container, "Composition root", "TypeScript", "Single instantiation point for all services and configuration")

  Container_Boundary(tools, "Tools") {
    Container(contract_build, "Contract build", "TypeScript", "Generate OpenAPI spec from Zod schemas in src/contracts/")
    Folder(mock_examples, "mock-examples", "JSON", "Contract examples (request/response fixtures)")
  }

  Rel(bff_app, mock_router, "Mounts", "API routes for all views")
  Rel(bff_app, static_server, "Mounts", "SPA static files when public/index.html exists")
  Rel(bff_app, logger, "Uses", "Request logging with traceId, pino-http middleware")
  Rel(bff_app, container, "Uses", "Dependency injection container")
  Rel(mock_router, contract_build, "Depends on", "Generated OpenAPI spec from Zod schemas")
  Rel(contract_build, mock_examples, "Reads", "Contract examples for validation")
  Rel(static_server, bff_app, "Uses", "Express Router and static middleware")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

## Express middleware order

1. **Request logger** — `traceId` first, so every later error has one
2. **Security headers** — `helmet` for security headers
3. **Response compression** — `compression` middleware
4. **Rate limiter** — `express-rate-limit`
5. **Cookies** — `cookie-parser` for CSRF and session cookies
6. **Health router** — `/api/v1/health` endpoint
7. **Feature routers** — API routes for all views (from P3 on)
8. **Static SPA** — Serves `public/` when `index.html` exists (optional)
9. **Not found handler** — 404 handler
10. **Error handler** — Central error handler

## Current implementation status

- **Mock-only BFF**: The BFF is currently mock-only; target design for production is described in
  `bff-principles.md`.
- **View composers**: Not implemented yet (`src/application/view-composers/` is target design).
- **Providers**: Not implemented yet (`src/infrastructure/providers/` is target design).
