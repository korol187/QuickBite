# Requirements Documentation: QuickBite
**Version:** 1.0
**Date:** July 22, 2024

This document details the functional and non-functional requirements for the QuickBite application, derived from the user stories.

## 1. Functional Requirements
These requirements define the specific behaviors and functions of the system. They are grouped by the primary microservice responsible for the functionality.

### 1.1. Identity Service
| ID | Requirement | Related User Story |
| :--- | :--- | :--- |
| FN-ID-01 | The system shall allow a new user to register with a unique email address and a password. | AUTH-1 |
| FN-ID-02 | The system shall validate that the provided email is in a valid format. | AUTH-1 |
| FN-ID-03 | The system shall securely hash and store user passwords. | AUTH-1 |
| FN-ID-04 | The system shall allow a registered user to log in using their email and password. | AUTH-2 |
| FN-ID-05 | Upon successful login, the system shall generate a JSON Web Token (JWT) for authenticating subsequent requests. | AUTH-2 |

### 1.2. Restaurant Service
| ID | Requirement | Related User Story |
| :--- | :--- | :--- |
| FN-RS-01 | The system shall provide a public endpoint to retrieve a list of all restaurants. | REST-1 |
| FN-RS-02 | The system shall allow searching for restaurants by name. | REST-2 |
| FN-RS-03 | The system shall provide a public endpoint to retrieve the detailed profile of a single restaurant by its ID. | REST-3 |
| FN-RS-04 | The system shall provide a public endpoint to retrieve the menu for a single restaurant by its ID. | REST-4 |
| FN-RS-05 | The system shall provide secured endpoints for a restaurant owner to create, update, and delete their restaurant's profile information. | MGMT-2 |
| FN-RS-06 | The system shall provide secured endpoints for a restaurant owner to add, update, and delete menu items for their restaurant. | MGMT-3, MGMT-4 |

### 1.3. Order Service
| ID | Requirement | Related User Story |
| :--- | :--- | :--- |
| FN-OR-01 | The system shall allow an authenticated user to create a new order containing one or more menu items. | ORD-1, ORD-4 |
| FN-OR-02 | The system shall validate that all items in an order belong to the same restaurant. | ORD-1 |
| FN-OR-03 | The system shall calculate the total price of an order. | ORD-2 |
| FN-OR-04 | Upon successful order creation, the system shall publish an OrderCreated event to the message broker. | ORD-5, MGMT-6 |
| FN-OR-05 | The system shall provide an endpoint for a user to view their own order history. | AUTH-2 |
| FN-OR-06 | The system shall provide an endpoint for a restaurant owner to view incoming orders for their restaurant. | MGMT-5 |

### 1.4. Notification Service
| ID | Requirement | Related User Story |
| :--- | :--- | :--- |
| FN-NT-01 | The system shall subscribe to the OrderCreated event from the message broker. | ORD-5, MGMT-6 |
| FN-NT-02 | Upon receiving an OrderCreated event, the system shall simulate sending a notification to the user and the restaurant. | ORD-5, MGMT-6 |

## 2. Non-Functional Requirements
These requirements define the quality attributes and constraints of the system.

| ID | Category | Requirement |
| :--- | :--- | :--- |
| NFR-1 | Performance | All API GET requests for individual resources (e.g., a single restaurant or order) shall have a median response time of less than 200ms. |
| NFR-2 | Performance | API endpoints for listing resources (e.g., all restaurants) shall respond in under 500ms with up to 1000 records. |
| NFR-3 | Scalability | Each microservice shall be independently scalable. The system should be able to handle a 2x increase in traffic by scaling service instances without requiring a full redeployment. |
| NFR-4 | Reliability | The system shall have a 99.9% uptime goal. The failure of one microservice (e.g., Notification Service) should not cascade and cause the failure of the entire ordering process. |
| NFR-5 | Security | All inter-service communication and external API endpoints must be secured via HTTPS. |
| NFR-6 | Security | Passwords must not be stored in plain text. A strong, one-way hashing algorithm (e.g., bcrypt) must be used. |
| NFR-7 | Security | User-specific data (e.g., order history) must only be accessible by the authenticated user who owns the data. |
| NFR-8 | Maintainability | All code must adhere to the chosen style guide (e.g., ESLint with a standard configuration) and all pull requests must pass automated linting checks. |
| NFR-9 | Data Integrity | Order creation and payment simulation must be handled in a transactional manner to prevent partial data states. |

> This level of detail is exactly what's expected in a senior-level design process. The next and final step of Phase 1 is to create the UML and ER diagrams to visually represent these requirements and the system's structure. Shall we proceed?