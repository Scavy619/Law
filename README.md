# LawBridge – Complete Legal Services Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue.svg)](https://www.python.org/)

LawBridge is a full‑stack legal services platform that connects users with verified legal professionals and provides AI‑powered legal assistance. The system supports secure authentication, lawyer consultations, appointment booking, video calls, payments, document analysis, and a production‑grade RAG‑based legal chatbot.

---

## Table of Contents

* Features
* Tech Stack
* Architecture Overview
* Project Structure
* Prerequisites
* Installation
* Environment Setup
* Authentication & Security Model
* API Improvements & Standards
* Running the Application
* API Documentation
* Deployment
* Contributing
* License

---

## Schema – ER Diagram

LawBridge Database Schema:
[https://dbdocs.io/officialdslc1552005/LawBridgeSchema?view=relationships](https://dbdocs.io/officialdslc1552005/LawBridgeSchema?view=relationships)

---

## Features

### User Features

* Secure authentication with access‑token + refresh‑token architecture
* Email verification and optional Two‑Factor Authentication (TOTP)
* Browse lawyers by specialization and availability
* Appointment booking and management
* Razorpay payment integration
* Real‑time video consultations using Stream.io
* AI legal assistant using RAG over Indian Constitutional Law
  ly responsive UI (mobile‑first)

### Lawyer Features

* Professional profile management
* Availability and schedule control
* Appointment dashboard
* Earnings and completed consultation tracking

### Admin Features

* Centralized admin dashboard
* User and lawyer management
* Appointment moderation
* Revenue and platform analytics

---

## Tech Stack

### Frontend

* React 19.1.1
* Vite
* Tailwind CSS 4.x
* React Router DOM 7.x
* Axios
* React Context API
* Stream.io Video SDK
* Moment.js

### Backend

* Node.js
* Express.js 5.x
* MongoDB with Mongoose
* JWT (Access + Refresh tokens)
* Bcrypt
* Zod validation
* Multer + Cloudinary
* Razorpay SDK
* Stream.io Node SDK

### AI / Chatbot

* FastAPI (Python)
* LangChain
* Pinecone Vector Database
* Google Embedding Model 004
* Google Gemini 2.5 Flash
* Custom RAG pipeline with session memory

---

## Architecture Overview

* Frontend communicates with Backend using REST APIs
* Backend issues short‑lived access tokens and long‑lived refresh tokens
* Refresh tokens are stored in HttpOnly cookies
* Chatbot runs as an isolated FastAPI service
* Backend and chatbot communicate using a shared RAG_SECRET_KEY
* All sensitive credentials are environment‑based

---

## Project Structure

```
Law_Bridge_FullStack/
├── Frontend/
├── Backend/
├── Admin/
├── chatbot/
├── doc_analyser/
├── LICENSE
└── README.md
```

---

## Prerequisites

* Node.js v18+
* pnpm v10+
* Python 3.10+
* MongoDB Atlas or local MongoDB
* Git

---

## Installation

Clone the repository:

```
git clone https://github.com/Divyansh1552005/Law_Bridge_Application.git
cd Law_Bridge_FullStack
```

Install dependencies:

Frontend:

```
cd Frontend
pnpm install
```

Backend:

```
cd Backend
pnpm install
```

Admin:

```
cd Admin
pnpm install
```

Chatbot:

```
cd chatbot
python3 -m venv rag
source rag/bin/activate
pip install -r req.txt
```

---

## Environment Setup

### Backend (.env)

```
JWT_SECRET=your_secret
PORT=4000
NODE_ENV=development

MONGODB_URI=your_mongo_uri

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

STREAM_API_KEY=
STREAM_API_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=

RAG_SECRET_KEY=shared_secret
```

### Frontend (.env)

```
VITE_BACKEND_URL=http://localhost:4000
VITE_CHATBOT_URL=http://localhost:8000
VITE_STREAM_API_KEY=
VITE_RAZORPAY_KEY_ID=
```

### Chatbot (.env)

```
GOOGLE_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
RAG_SECRET_KEY=shared_secret
HOST=0.0.0.0
PORT=8000
```

---

## Authentication & Security Model

* Stateless JWT‑based authentication
* Short‑lived access tokens sent via Authorization header
* Refresh tokens stored in HttpOnly cookies
* Centralized refresh and logout endpoints
* Email verification before full access
* Optional TOTP‑based Two‑Factor Authentication
* Password hashing with bcrypt
* Zod‑based request validation
* Role‑based access control (User, Lawyer, Admin)

---

## API Improvements & Standards

* Unified API response format
* Centralized error handling
* Async handler abstraction
* Separate routers for auth, user, lawyer, admin
* Token refresh handled automatically by frontend Axios interceptor
* Shared logout and refresh routes across roles
* Secure cookie configuration (httpOnly, sameSite, secure)

---

## Running the Application

Backend:

```
cd Backend
pnpm start
```

Frontend:

```
cd Frontend
pnpm run dev
```

Admin:

```
cd Admin
pnpm run dev
```

Chatbot:

```
cd chatbot
source rag/bin/activate
python main.py
```

---

<!--## API Documentation

Chatbot Swagger UI:
ht- Backend: Railway / Render / DigitalOcean

* Chatbot: Railway / Render
* MongoDB: Atlas

Ensure production cookies, HTTPS, and environment secrets are configured.-->

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Support

For support, contact: [lawbridgeorg@gmail.com](mailto:lawbridgeorg@gmail.com)

---

## Disclaimer

LawBridge is an informational platform and does not provide legal advice. AI‑generated responses are for educational purposes only. Users must consult qualified legal professionals before making legal decisions.

---

Built by the LawBridge Team
