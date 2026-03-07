# 🛒 IntelliGrocery-Pro

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<br />

**IntelliGrocery-Pro** is a full-stack, AI-powered intelligent grocery management and analytics platform. Built as an advanced final year project / startup MVP, it integrates product management, real-time analytics, demand forecasting, and market basket analysis.

---

## 🌟 Key Features

### 👨‍💼 Admin Dashboard
- **Real-Time KPI Tracking:** Total Users, Products, Orders, and Revenue.
- **Advanced Analytics:** Sales trends (Line charts), Top products (Bar charts), and Category distribution (Pie charts) powered by Recharts.
- **Inventory & Order Management:** Add, edit, or remove products and track low stock.
- **Actionable Reports:** Export analytics and sales data to **CSV** or **PDF**.

### 🛒 Customer Interface
- **Smart Search:** Instant product suggestions utilizing **Trie Data Structure**.
- **Shopping Cart & Checkout:** Add to cart, modify quantities, and check out seamlessly.
- **Order History:** Full visibility into past purchases.

### AI & Advanced Data Mining
- 🤖 **Demand Prediction** — Linear Regression / ARIMA (Predicts next-period demand, alerts on shortages)
- 👥 **Customer Segmentation** — K-Means Clustering for targeted basket analysis
- 🧺 **Frequent Pattern Mining** — Apriori & FP-Growth (Adjustable min_support, output top pairs/combinations utilizing `mlxtend`)
- 📈 **Association Rule Mining** — Conf/Lift analysis (Weighted Score = Lift × Profit Margin), Network Graph visualization
- 💎 **High Utility Itemset Mining** — Ranks product combinations by utility (Quantity × Profit Margin)
- 🔄 **Incremental Mining** — Real-time updates to frequent itemsets without full dataset retraining
- 🚀 **Emerging Pattern Detection** — Growth rate analysis detecting rapidly growing itemsets month-over-month
- 📊 **Multi-Level Mining** — Category, Sub-Category, and Product-level association rules
- 🕸 **Community Detection** — Builds product association graph and uses Louvain algorithm via `NetworkX`
- 🎯 **Sequential Pattern Mining** — Detects purchase flow order ($A \to B \to C$)
- 🚨 **Anomaly Detection** — Isolation Forest / Z-score to detect abnormal sales spikes or drops
- 📦 **Inventory Optimization** — Reorder Formula (Predicted Demand − Current Stock + Safety Buffer)

### ⚡ Real-Time Capabilities
- **Live Updates:** Dashboard charts and KPIs update instantly via **Socket.IO** when new orders are placed.

---

## 🏗 Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| **Frontend**   | React 18, Vite, Tailwind CSS, Recharts |
| **Backend**    | Node.js, Express.js, TypeScript |
| **Database**   | SQLite (Easily swappable with PostgreSQL/MySQL) |
| **Real-time**  | Socket.IO                |
| **ML Service** | Python, FastAPI, Scikit-learn, Pandas |

---

## 📁 Repository Structure

```text
IntelliGrocery-Pro/
│
├── frontend/            # React + Vite UI
├── backend/             # Node.js + Express API
├── ml/                  # Python FastAPI (Pandas, mlxtend, scikit-learn, NetworkX)
├── docs/                # Architectural & Database Diagrams
├── docker-compose.yml   # Docker composition
└── README.md            # Project Documentation
```

👉 See detailed architectural diagrams in the `docs` folder:
- [System Architecture](docs/System_Architecture.md)
- [Database ER Diagram](docs/Database_ER_Diagram.md)

---

## 🚀 Quick Start (Local Setup)

You can run the application directly on your machine without Docker.

### 1️⃣ Backend Setup
```bash
cd backend
npm install
npm run init-db    # Initialize SQLite and seed data
npm run dev        # Runs on http://localhost:5000
```

### 2️⃣ ML Service Setup
```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:5173
```

---

## 🐳 Docker Deployment

To spin up the entire application utilizing Docker:

```bash
docker-compose up -d --build
```

---

## 🔑 Default Credentials

| Role    | Email                          | Password  |
|---------|--------------------------------|-----------|
| **Admin**   | admin@intelligrocery.com       | admin123  |
| **Customer**| (Register via the UI)          | N/A       |

---

## 🔗 API Overview

### Main Backend APIs
| Category | Endpoints |
| -------- | --------- |
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Products** | `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` |
| **Cart** | `GET /api/cart`, `POST /api/cart` |
| **Analytics** | `GET /api/analytics`, `GET /api/reports/csv`, `GET /api/reports/pdf` |

### Python ML Microservice APIs
| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/forecast` | POST | Demand prediction (Linear Regression / ARIMA) |
| `/cluster` | POST | Customer segmentation clustering (K-Means) |
| `/mba` | POST | Frequent Pattern & Association Rule Mining (Apriori/FP-Growth) |
| `/utility` | POST | High Utility Itemset Mining |
| `/community` | POST | Graph-Based Community Detection (Louvain via NetworkX) |
| `/sequence` | POST | Sequential Pattern Mining |
| `/anomaly` | POST | Anomaly detection (Isolation Forest/Z-score) |

---

## 🛡 Security
- **Authentication:** JWT (JSON Web Tokens)
- **Data Protection:** Password hashing (Bcrypt)
- **Access Control:** Role-Based Access Control (Admin vs. Customer)
- **App Security:** CORS protection and environment variable secrets validation

---

## 🔮 Future Enhancements
- Deploy to AWS / Heroku
- Cloud image storage (AWS S3)
- Fully functional Mobile Application
- Personalized User Recommendations Engine

---

<div align="center">
Made with ❤️ by Ravi
</div>
