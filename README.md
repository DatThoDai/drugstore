# 🏥 Drugstore E-commerce Platform

## 🎬 Demo Video

👉 YouTube: [Watch Demo Video](https://youtu.be/JNiTnSiiQGw)

---

## 📌 Overview

**Drugstore** is a fullstack e-commerce web application for selling over-the-counter (OTC) medications, health supplements, and medical devices.

The platform provides a smooth shopping experience for customers and a comprehensive management system for administrators, built on a modern, scalable architecture.

This project focuses on:

- Healthcare product management
- Secure JWT-based authentication
- Real-time email notifications via Apache Kafka
- Cloud image storage with AWS S3
- Online payment integration with PayPal
- Prescription upload and approval workflow
- Redis caching for improved performance
- AI-powered medical assistant chatbot (Google Gemini 2.5 Flash)
- Containerized deployment with Docker

---

## 🚀 Key Features

### 👤 User Features

- Register and login with JWT authentication
- Browse products by category
- Search and filter medications
- Product detail pages with reviews and ratings
- Add to cart and manage cart items
- Add products to favorites / wishlist
- Checkout with PayPal (Sandbox)
- Order placement and order history tracking
- User profile management
- Upload prescription for restricted medications
- Email notification on registration (via Kafka + Gmail SMTP)
- **AI Medical Assistant**: floating chatbot powered by Google Gemini 2.5 Flash for drug interaction queries, dosage guidance, and general health Q&A

---

### 🧑‍💼 Admin Features

- Dashboard with overview statistics
- Product management (Create / Edit / Delete)
- Category management
- Order management and status updates
- User account management
- Banner and slide management
- Prescription review and approval

---

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Client App    │     │    Admin App    │
│  (ReactJS :3000)│     │ (ReactJS :4000) │
└────────┬────────┘     └────────┬────────┘
         │  REST API (/api)       │
         │  AI Proxy  (/ai) ──────┼──────────────────────────┐
         └───────────┬───────────┘                           │
                     │ REST API                              │
         ┌───────────▼───────────┐              ┌────────────▼──────────┐
         │  Spring Boot Backend  │              │  Medical AI Assistant │
         │       (:8081)         │              │  Flask + Gemini 2.5   │
         └──┬──────┬──────┬──────┘              │       (:5000)         │
            │      │      │                     └───────────────────────┘
    ┌───────▼─┐ ┌──▼──┐ ┌▼──────┐
    │  MySQL  │ │Redis│ │ Kafka │
    └─────────┘ └─────┘ └───┬───┘
                             │
                      ┌──────▼──────┐
                      │ Gmail SMTP  │
                      │  (Email)    │
                      └─────────────┘
         ┌──────────────────────────┐
         │        AWS S3            │
         │    (Image Storage)       │
         └──────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Client         | ReactJS, Redux, Axios               |
| Admin          | ReactJS, Redux, Axios               |
| Backend        | Spring Boot 3.2.0 (Java 17)         |
| Database       | MySQL 8                             |
| Cache          | Redis (redis/redis-stack:7.2.0)     |
| Message Queue  | Apache Kafka (confluentinc 7.9.1)   |
| Cloud Storage  | AWS S3 (SDK v2)                     |
| Payment        | PayPal REST SDK (Sandbox)           |
| Authentication | Spring Security + JWT (jjwt 0.13.0) |
| Email          | Spring Mail + Gmail SMTP            |
| AI Chatbot     | Python Flask + Google Gemini 2.5 Flash |
| DevOps         | Docker, Docker Compose              |

---

## 📂 Project Structure

```
DOANCybersoft/
│
├── client/                    # ReactJS client application (port 3000)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Page-level components
│   │   ├── Redux/             # Redux store, actions, reducers
│   │   └── App.js
│   └── package.json
│
├── admin/                     # ReactJS admin dashboard (port 4000)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Admin page-level components
│   │   ├── Redux/             # Redux store, actions, reducers
│   │   └── App.js
│   └── package.json
│
├── backend-spring/            # Spring Boot REST API (port 8081)
│   ├── src/main/java/
│   │   └── com/datn/drugstore/
│   │       ├── config/        # Security, Kafka, Redis, AWS config
│   │       ├── controller/    # REST controllers
│   │       ├── service/       # Business logic
│   │       ├── repository/    # JPA repositories
│   │       ├── model/         # JPA entities
│   │       └── dto/           # Data transfer objects
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   ├── docker-compose.yml       # Backend container
│   └── docker-compose.kafka.yml # Kafka + Kafka UI for this project
│
├── Medical-Assisstant/          # AI Medical Chatbot service (port 5000)
│   ├── app.py                   # Flask app with Gemini 2.5 Flash API
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env                     # GOOGLE_API_KEY (not committed)
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js >= 16
- Java 17 + Maven
- MySQL 8
- Redis
- Apache Kafka
- Docker & Docker Compose (optional but recommended)

---

### 1️⃣ Clone repository

```bash
git clone <your-repo-url>
cd DOANCybersoft
```

---

### 2️⃣ Backend setup

Configure environment variables (see [Environment Variables](#-environment-variables) section), then:

```bash
cd backend-spring
mvn clean package -DskipTests
java -jar target/drugstore-0.0.1-SNAPSHOT.jar
```

---

### 3️⃣ Client frontend setup

```bash
cd client
npm install
npm start
# Runs on http://localhost:3000
```

---

### 4️⃣ Admin frontend setup

```bash
cd admin
npm install
npm start
# Runs on http://localhost:4000
```

---

### 5️⃣ Docker (recommended for backend)

**Start Kafka:**
```bash
cd backend-spring
docker-compose -f docker-compose.kafka.yml up -d
```

**Build and start backend:**
```bash
cd backend-spring
mvn clean package -DskipTests
docker build -t drugstore-backend .
docker-compose up -d
```

**Build and start AI Medical Assistant:**
```bash
cd Medical-Assisstant
docker compose up --build -d
```

**View logs:**
```bash
docker logs -f drugstore-backend
docker logs -f medical-assistant
```

---

## 🔐 Environment Variables

The backend reads configuration from environment variables. When running with Docker, set these in `docker-compose.yml`. When running locally, export them or set in your IDE run configuration.

| Variable               | Description                        | Example                                      |
| ---------------------- | ---------------------------------- | -------------------------------------------- |
| `DB_URL`               | MySQL JDBC connection URL          | `jdbc:mysql://localhost:3307/drugstore?...`  |
| `DB_USERNAME`          | MySQL username                     | `root`                                       |
| `DB_PASSWORD`          | MySQL password                     | `yourpassword`                               |
| `JWT_SECRET`           | JWT signing secret (Base64)        | `wRX3rsm0Eh/nzsc...`                         |
| `REDIS_HOST`           | Redis host                         | `localhost`                                  |
| `REDIS_PORT`           | Redis port                         | `6379`                                       |
| `REDIS_PASSWORD`       | Redis password                     | `yourpassword`                               |
| `MAIL_USERNAME`        | Gmail address for sending email    | `yourapp@gmail.com`                          |
| `MAIL_PASSWORD`        | Gmail App Password                 | `xxxx xxxx xxxx xxxx`                        |
| `PAYPAL_CLIENT_ID`     | PayPal REST API client ID          | `AV0xw66...`                                 |
| `AWS_ACCESS_KEY`       | AWS IAM access key                 | `AKIA...`                                    |
| `AWS_SECRET_KEY`       | AWS IAM secret key                 | `OX08z...`                                   |
| `AWS_REGION`           | AWS region                         | `us-east-1`                                  |
| `AWS_S3_BUCKET_NAME`   | S3 bucket name                     | `drugstore-upload`                           |
| `AWS_S3_ENDPOINT_URL`  | S3 bucket endpoint URL             | `https://drugstore-upload.s3.amazonaws.com/` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address            | `localhost:9094`                             |

> ⚠️ **Never commit your `.env` or `docker-compose.yml` (with secrets) to GitHub.**

---

## ☁️ Cloud Storage

Product and user images are stored on **AWS S3**.

Upload flow:
1. Client sends image to backend via multipart request
2. Backend uploads to S3 using AWS SDK v2
3. Public URL is stored in MySQL and returned to frontend

```
https://<bucket>.s3.<region>.amazonaws.com/<filename>
```

---

## 💳 Payment

PayPal Sandbox integration for order checkout.

Flow:
1. User places order → backend creates PayPal payment
2. User is redirected to PayPal approval page
3. PayPal redirects back with payment confirmation
4. Backend captures payment and updates order status

> To test: use PayPal Sandbox buyer account credentials.

---

## 📧 Email Notification

Registration confirmation emails are sent asynchronously using **Apache Kafka** + **Gmail SMTP**:

1. User registers → backend publishes event to Kafka topic `user-registration`
2. Kafka consumer picks up event
3. Spring Mail sends confirmation email via Gmail SMTP

---

## 🤖 AI Medical Assistant

A floating chatbot integrated into the client frontend, powered by **Google Gemini 2.5 Flash**.

- Built with **Python Flask** (port 5000), containerized with Docker
- React client proxies `/ai/*` requests to the Flask service via Craco dev proxy
- Supports natural language queries about medications, dosages, drug interactions, and general health advice
- Fully isolated service — runs independently from the Spring Boot backend

```
User types question
       ↓
React client  →  POST /ai/api/chat  →  Flask (Docker :5000)
                                              ↓
                                    Google Gemini 2.5 Flash API
                                              ↓
                                    Response streamed back to UI
```

---

## 🗄️ Caching

**Redis** is used to cache frequently accessed data (e.g., product listings, categories) to reduce database load and improve API response times.




