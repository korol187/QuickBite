# Identity Service

## Overview

The Identity Service is a core component of the **QuickBite** microservices application. Its primary responsibility is to manage user identity, including registration, login (authentication), and session management via JSON Web Tokens (JWTs). It acts as the central authority for user data and credentials.

This service is built to demonstrate proficiency in backend development, database management, and secure API design, as outlined in the parent project's goals.

## Technology Stack

- **Framework:** Node.js with NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Passport.js with JWT Strategy
- **Containerization:** Docker

## Environment Variables

To run this service, you need to configure the following environment variables. You can create a `.env` file in this directory (`services/identity-service`) to store them for local development.

| Variable       | Description                                                                 | Example                                                      |
| :------------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------- |
| `DATABASE_URL` | The connection string for the PostgreSQL database.                          | `postgresql://user:password@localhost:5432/identitydb`       |
| `JWT_SECRET`   | A secret key used to sign and verify JSON Web Tokens.                       | `your-super-secret-and-long-string-for-jwt`                  |
| `PORT`         | The port on which the service will listen for incoming requests. (Optional) | `3001`                                                       |

## API Endpoints

### Authentication

#### `POST /auth/register`

Registers a new user in the system.

- **Request Body:**

  ```json
  {
    "email": "test.user@example.com",
    "password": "aVeryStrongPassword123!",
    "role": "USER"
  }
  ```

- **Responses:**
  - `201 Created`: Successfully created the user. Returns the user object (without the password).
  - `400 Bad Request`: If the request body is invalid (e.g., missing fields, invalid email).
  - `409 Conflict`: If a user with the same email already exists.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)

### Installation & Running

#### Using Docker (Recommended)

The service is designed to be run as part of the main `docker-compose.yml` at the project root. This is the easiest way to get the entire QuickBite application stack, including databases, running.

1.  **From the project root, run:**
    ```bash
    docker-compose up -d
    ```
2.  To run only this service:
    ```bash
    docker-compose up -d identity-service
    ```

#### Local Development

1.  **Navigate to the service directory:**
    ```bash
    cd services/identity-service
    ```
2.  **Create a `.env` file** and add the required environment variables (see above).
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the database migrations:**
    ```bash
    npx prisma migrate dev
    ```
5.  **Start the service:**
    ```bash
    npm run start:dev
    ```

## Available Scripts

- `npm run build`: Compiles the TypeScript code for production.
- `npm run format`: Formats the code using Prettier.
- `npm run start`: Starts the application in production mode.
- `npm run start:dev`: Starts the application in development mode with file watching.
- `npm run lint`: Lints the codebase using ESLint.
- `npm test`: Runs unit tests using Jest.
- `npm run test:e2e`: Runs end-to-end tests.