# 🏗 System Architecture Diagram

This document illustrates the high-level architecture and data flow of **IntelliGrocery-Pro**.

```mermaid
graph TD
    %% Define Client Layer
    Client[Client Browser]
    
    %% Frontend Subsystem
    subgraph Frontend [Frontend: React.js + Vite]
        UI[User Interface & Pages]
        Sockets_Client[Socket.IO Client]
        Charts[Recharts Dashboard]
    end
    
    %% Backend Subsystem
    subgraph Backend [Backend: Node.js + Express]
        API[Express REST API]
        Auth[JWT Auth Middleware]
        Sockets_Server[Socket.IO Server]
        Uploads[Local Image Storage\n/backend/uploads]
    end
    
    %% ML Microservice
    subgraph Services [ML Microservice: Python FastAPI]
        ML_Forecasting[Demand Prediction\nLinear Regression/ARIMA]
        ML_Segmentation[Customer Segmentation\nK-Means]
        ML_MBA[Frequent Pattern & Association Rules\nApriori/FP-Growth via mlxtend]
        ML_Utility[High Utility Itemset Mining]
        ML_Community[Community Detection\nLouvain via NetworkX]
        ML_Sequence[Sequential Pattern Mining]
        ML_Anomaly[Anomaly Detection\nIsolation Forest/Z-score]
    end
    
    %% Database Layer
    subgraph Database_Layer [Database Layer]
        DB[(SQLite / Relational Database)]
    end
    
    %% Request flows
    Client <-->|HTTP/HTTPS| UI
    Client <-->|WebSocket| Sockets_Client
    
    UI <-->|REST API Calls| API
    Sockets_Client <-->|Real-time Events| Sockets_Server
    
    API --> Auth
    API --> Uploads
    
    %% DB Communications
    API <-->|SQL Queries / ORM| DB
    
    %% ML Communications
    API <-->|HTTP Requests| ML_Forecasting
    API <-->|HTTP Requests| ML_Segmentation
    API <-->|HTTP Requests| ML_MBA
    API <-->|HTTP Requests| ML_Utility
    API <-->|HTTP Requests| ML_Community
    API <-->|HTTP Requests| ML_Sequence
    API <-->|HTTP Requests| ML_Anomaly

    %% Optional ML to DB direct fetch (depending on impl)
    ML_Forecasting -.->|Data Fetching| DB
    ML_Segmentation -.->|Data Fetching| DB
    ML_MBA -.->|Data Fetching| DB
    ML_Utility -.->|Data Fetching| DB
    ML_Community -.->|Data Fetching| DB
    ML_Sequence -.->|Data Fetching| DB
    ML_Anomaly -.->|Data Fetching| DB
```

## System Components

### 1. **Client / Frontend Layer**
- Single Page Application (SPA) built with React.js.
- Connects to the backend via RESTful APIs for standard CRUD operations and WebSocket for real-time dashboard updates.

### 2. **Backend Services (Node.js)**
- **Express API:** Manages Routing, validation, controllers.
- **Auth Layer:** Enforces JWT-based role access control.
- **Socket.IO:** Dispatches live events to the admin dashboard on successful user orders.

### 3. **Machine Learning Microservices (Python)**
- An isolated Python FastAPI application spanning extensive data mining operations.
- Key endpoints include `/forecast`, `/cluster`, `/mba`, `/utility`, `/community`, `/sequence`, and `/anomaly`.
- Utilizes **Pandas/NumPy** for Data Preprocessing (missing values, one-hot encoding, time feature extraction).
- Uses **scikit-learn** for clustering and anomaly detection, **mlxtend** for FP-Growth/Apriori, and **NetworkX** for graph-based community detection.
- Returns predictive analytical insights back to the Node.js backend to serve up to the Admin UI.

### 4. **Database**
- Standard SQL database structure (currently SQLite for seamless local execution).
- Models are completely normalized covering basic entities. See the [Database ER Diagram](Database_ER_Diagram.md) for more info.
