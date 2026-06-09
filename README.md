# Project Name

> One-line description of what this app does.

## Overview

TODO: Describe the project purpose, the problem it solves, and who uses it.

## Stack

- **Client** — React, TypeScript, Vite
- **Server** — Node / Express (or ASP.NET Core)
- **Hosting** — Azure (TODO: add resource names)

## Getting Started

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run locally
npm run dev        # from client/
npm run start      # from server/
```

## Project Structure

```
client/src/
  components/   — reusable UI components
  pages/        — route-level components
  hooks/        — shared React hooks
  services/     — API client functions
  store/        — global state
  types/        — shared TypeScript types
  utils/        — utility functions

server/src/
  controllers/  — request handlers
  routes/       — Express route definitions
  services/     — business logic
  models/       — data models / DB schemas
  middleware/   — auth, logging, error handling
```

## Docs

See [docs/](docs/) for architecture notes and guides.  
Internal plans and notes live in `docs/private/` (gitignored).

## Deployment

TODO: Add deployment instructions.
