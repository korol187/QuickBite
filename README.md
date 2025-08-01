# QuickBite: A Microservices Food Delivery API

QuickBite is a backend application for a food delivery service built using a event-driven microservices architecture. It provides a scalable and resilient foundation for connecting users with restaurants.

## Project Goals & Purpose

This project was specifically designed to serve as a portfolio piece to demonstrate proficiency in several key areas of software engineering. It directly addresses feedback related to the following competencies:

- **Software Requirements & Elicitation:** The project is founded on a complete set of requirement artifacts, including a Project Vision, User Stories, and detailed Functional/Non-Functional Requirements documentation.
- **System Design & Diagramming:** The architecture is visually represented through UML Use Case and Sequence diagrams. The data persistence layer is defined with an Entity-Relationship (ER) Diagram for relational data and a clear document model for NoSQL data.
- **Distributed Systems Architecture:** Demonstrates a practical understanding of Microservices, Service-Oriented Architecture (SOA), and Event-Driven Architecture (EDA) through the use of independent services communicating via a message broker.
- **Database Knowledge (SQL vs. NoSQL):** Intentionally uses both PostgreSQL (SQL) for transactional data (users, orders) and MongoDB (NoSQL) for flexible, document-based data (restaurant menus) to showcase an understanding of their respective strengths and use cases.
- **Software Construction & CI/CD:** The project is set up for automated builds and testing using GitHub Actions, demonstrating modern CI practices.
- **Design Patterns:** The codebase will leverage fundamental design patterns (e.g., Repository, Dependency Injection) to ensure maintainable and clean code.

## System Architecture

The system is composed of five independent microservices and an API Gateway, which communicate asynchronously via a RabbitMQ message broker.

### Use Case Diagram
```mermaid
graph TD
    subgraph QuickBite System
        UC1(Register & Login)
        UC2(Browse Restaurants)
        UC3(Manage Cart)
        UC4(Place Order)
        UC5(Manage Profile & Menu)
        UC6(View Orders)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4

    RestaurantOwner(Restaurant Owner) --> UC1
    RestaurantOwner(Restaurant Owner) --> UC5
    RestaurantOwner(Restaurant Owner) --> UC6
```

### "Place Order" Sequence Diagram
```mermaid

sequenceDiagram
    participant Client
    participant API Gateway
    participant Order Service
    participant Restaurant Service
    participant Message Broker (RabbitMQ)
    participant Notification Service

    Client->>+API Gateway: POST /orders (items, restaurantId, jwt)
    API Gateway->>+Order Service: POST / (items, restaurantId, userId)
    
    Order Service->>+Restaurant Service: GET /restaurants/:id/validate-items
    Restaurant Service-->>-Order Service: (prices, validity)

    alt Items are valid
        Order Service->>Order Service: Calculate total price
        Order Service->>Order Service: Save order to PostgreSQL DB (status: PENDING)
        Order Service-->>API Gateway: 201 Created (orderId)
        API Gateway-->>Client: 201 Created (orderId)
        
        Order Service->>Message Broker: Publish [OrderCreated] event
        
        Message Broker-->>+Notification Service: Consume [OrderCreated] event
        Notification Service->>Notification Service: Simulate sending notifications
        Notification Service-->>-Message Broker: Acknowledge message
    else Items are invalid
        Order Service-->>API Gateway: 400 Bad Request (error)
        API Gateway-->>Client: 400 Bad Request (error)
    end
    
    deactivate Order Service
    deactivate API Gateway
```

## Data Models

### PostgreSQL ER Diagram
```mermaid
erDiagram
    USERS {
        UUID id PK
        string email UK
        string password_hash
        string role
        datetime created_at
    }
    ORDERS {
        UUID id PK
        UUID user_id FK
        UUID restaurant_id
        string status
        decimal total_price
        datetime created_at
    }
    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID menu_item_id
        string item_name
        int quantity
        decimal price_per_item
    }
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
```

## Technology Stack
- **Framework:** Node.js with NestJS (TypeScript)
- **Containerization:** Docker & Docker Compose
- **Databases:**
  - PostgreSQL (for Identity & Order services)
  - MongoDB (for Restaurant service)
- **Message Broker:** RabbitMQ
- **API Gateway:** Express Gateway
- **Testing:** Jest

## Getting Started
### Prerequisites
- Docker and Docker Compose installed on your machine.

### Installation & Running
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd quickbite-project
    ```
2.  **Run the entire application stack:**
    ```bash
    docker-compose up -d
    ```
This command will build the Docker images for each service (if not already built) and start all the containers defined in the `docker-compose.yml` file.

The API Gateway will be available at `http://localhost:3000`.

## Services Overview

| Service | Responsibility | Database |
| :--- | :--- | :--- |
| **API Gateway** | Single entry point for all client requests. | None |
| **Identity Service** | User registration, login, JWT generation. | PostgreSQL |
| **Restaurant Service** | Manages restaurant profiles and menus. | MongoDB |
| **Order Service** | Manages order creation, state, and history. | PostgreSQL |
| **Notification Service** | Listens for events and sends mock notifications. | None |

