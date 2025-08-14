# Restaurant Service

This service is responsible for managing restaurant profiles and menus for the QuickBite application.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Running the Service](#running-the-service)
  - [API Endpoints](#api-endpoints)
- [Database](#database)
- [Architecture](#architecture)

## Architecture

This service follows a layered architecture, which is a key principle of Domain-Driven Design (DDD). The code is organized into three distinct layers:

-   **Domain Layer:** This is the core of the service. It contains the business logic, entities, and value objects that represent the domain. This layer is completely independent of any external frameworks or technologies.

-   **Application Layer:** This layer orchestrates the use cases of the application. It contains the application services that are called by the controllers. It acts as a bridge between the domain layer and the infrastructure layer.

-   **Infrastructure Layer:** This layer is responsible for all the technical details, such as database access, external API calls, and message queueing. It implements the interfaces defined in the domain layer.

This separation of concerns makes the codebase more modular, testable, and easier to maintain.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v24.5.0 or higher)

### Installation

Project-level dependencies should be installed from the root of the monorepo.

```bash
npm install
```

## Usage

### Running the Service

This service is managed through Docker Compose.

1.  **Start the service:**
    To run this service along with its dependencies (like the MongoDB database), use the following command from the project root:
    ```bash
    docker-compose up restaurant-service
    ```
    To run in detached mode:
    ```bash
    docker-compose up -d restaurant-service
    ```

2.  **Hot Reloading:**
    The service is configured for hot reloading. Any changes made to the `src` directory will automatically restart the service within the container.

### API Endpoints

The following endpoints are currently available:

-   **`GET /health`**
    -   **Description:** Checks the health of the service.
    -   **Response:**
        ```json
        {
          "status": "ok"
        }
        ```
-   **`GET /restaurants`**
    -   **Description:** Returns a list of all restaurants. (Currently returns a placeholder string).
    -   **Response:**
        ```json
        "This action returns all restaurants"
        ```

## Database

This service uses a **MongoDB** database to store restaurant and menu data. The connection is managed by the `docker-compose.yaml` file, which starts a dedicated `mongo` container.

-   **Database Name:** `quickbite_restaurants`
-   **Connection URL (from within Docker network):** `mongodb://mongo:27017/quickbite_restaurants`
