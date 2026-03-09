# LawBridge – Complete Legal Services Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-blue.svg)](https://www.python.org/)

LawBridge is a full-stack legal services platform that connects users with verified legal professionals and provides AI-powered legal assistance. The system supports secure authentication with Two-Factor Authentication, lawyer consultations, appointment booking, Razorpay payment processing, Stream.io-based video consultations, a credit-gated AI legal chatbot, and a production-grade RAG pipeline built over Indian Constitutional Law documents.

---

## Schema – ER Diagram

LawBridge Database Schema:
[https://dbdocs.io/officialdslc1552005/LawBridgeSchema?view=relationships](https://dbdocs.io/officialdslc1552005/LawBridgeSchema?view=relationships)

---

## Features

### User Features

- Secure registration with email verification via hashed tokens
- JWT-based stateless authentication using short-lived access tokens and long-lived refresh tokens stored in HttpOnly cookies
- Optional Two-Factor Authentication (TOTP) via QR code or manual key entry; supports setup, verification, and disabling with password confirmation
- Password reset via time-limited email tokens
- Account deletion with OTP confirmation sent to registered email
- Profile management including name, phone, address, gender, date of birth, and profile image upload via Cloudinary
- Browse lawyers filtered by specialisation
- Appointment booking with slot selection and conflict prevention
- Razorpay payment integration for appointment fees with signature verification
- Appointment cancellation with automatic slot release back to the lawyer
- Real-time one-on-one video consultations using Stream.io Video SDK with call lifecycle tracking (join, leave, end, duration)
- AI legal chatbot with session-based conversation history, Markdown-rendered responses, and a daily credit system (10 credits per user per day, reset at midnight)
- Resources and legal information pages
- Contact, Privacy Policy, Terms and Conditions, and Refund Policy pages

### Lawyer Features

- Professional profile management including speciality, degree, experience, fees, about section, and profile image
- Availability toggle to open or close appointment slots
- Appointment dashboard with upcoming and completed consultation history
- Earnings tracking for completed appointments
- Video call participation using Stream.io with the same call lifecycle as users
- Lawyer-specific authentication with separate JWT flow

### Admin Features

- Admin authentication with dedicated JWT flow
- Add new lawyers to the platform with full profile and image upload
- View and manage all registered lawyers and users
- View and manage all appointments across the platform
- Revenue tracking and platform-wide analytics dashboard

---

## Tech Stack

### Frontend (React Application)

- React 19.1.1
- Vite 7.x
- Tailwind CSS 4.x with Typography plugin
- React Router DOM 7.x with data router (`RouterProvider`)
- Axios with a custom interceptor for automatic silent token refresh, 429 rate-limit handling, and daily credit exhaustion handling
- React Context API for global application state (`AppContext`)
- Stream.io Video React SDK 1.26.x for video consultations
- React Markdown with remark-gfm and PrismJS for syntax-highlighted chatbot responses
- Lucide React for icons
- React Toastify for notifications
- Moment.js for date formatting

### Admin Panel (React Application)

- React 19.1.1
- Vite 7.x
- Tailwind CSS 4.x
- React Router DOM 7.x
- Axios
- Stream.io Video React SDK 1.26.x
- Lucide React
- React Toastify

### Backend (Node.js API Server)

- Node.js with ES Modules
- Express.js 5.x
- MongoDB with Mongoose 8.x
- JWT access tokens (short-lived, sent via Authorization header) and refresh tokens (long-lived, stored in HttpOnly cookies)
- Bcrypt 6.x for password hashing
- Zod 4.x for request body validation
- Multer 2.x for multipart file handling
- Cloudinary 2.x for image storage
- Razorpay SDK 2.x for payment order creation and signature verification
- Stream.io Node SDK for video token generation and call management
- ioredis 5.x for Redis-backed rate limiting and chatbot credit tracking
- Helmet for HTTP security headers
- express-mongo-sanitize for MongoDB operator injection prevention
- Nodemailer and Brevo (Sendinblue) for transactional email delivery
- otpauth and qrcode for TOTP-based Two-Factor Authentication
- cookie-parser for HttpOnly refresh token cookies

### AI Chatbot Service (Python FastAPI)

- Python 3.12
- FastAPI 0.123.x with Uvicorn 0.38.x
- LangChain 0.3.x ecosystem (langchain, langchain-core, langchain-community, langchain-text-splitters, langchain-google-genai, langchain-pinecone)
- Google Gemini 2.5 Flash as the language model via `langchain-google-genai`
- Google `gemini-embedding-001` embedding model (3072-dimensional vectors) for document and query embeddings
- Pinecone 7.x serverless vector database for similarity search over legal documents
- PyPDF2 and pypdf for PDF document loading
- LangChain `RecursiveCharacterTextSplitter` for chunking (chunk size 1000, overlap 200)
- Custom production-safe batch embedding pipeline with resume-from-checkpoint, rate-limit retry logic, daily quota detection, and per-batch progress persistence
- Session-aware RAG pipeline passing last 10 conversation turns as chat history into the prompt
- Secure key header (`secure_key`) for backend-to-chatbot authentication
- pydantic 2.x for request/response models
- python-dotenv for environment management

---

## Architecture Overview

```
                          Browser / Mobile
                               |
                 +-------------+-------------+
                 |                           |
           Frontend (React)          Admin Panel (React)
                 |                           |
                 +-------------+-------------+
                               |
                      Backend (Express.js)
                       |         |       |
                  MongoDB    Cloudinary  Redis
                       |
              RAG Chatbot (FastAPI)
                       |
               Pinecone Vector DB
               Google Gemini 2.5 Flash
```

- The Frontend and Admin Panel are separate React applications communicating with the Backend via REST APIs.
- The Backend issues short-lived access tokens (sent in the `Authorization` header) and long-lived refresh tokens (stored in HttpOnly cookies). The frontend Axios interceptor silently refreshes access tokens on 401 responses using a queuing mechanism to prevent duplicate refresh calls.
- Redis backs both the global rate limiter (fixed-window, per-IP, 200 requests per 60 seconds across all routes) and the per-route limiter, as well as the per-user chatbot credit counter which auto-expires at midnight.
- The chatbot service is an isolated FastAPI process running on port 4000. The Express backend proxies user messages to it, attaching a shared `RAG_SECRET_KEY` header. The chatbot validates this key before processing any request.
- Conversation history is persisted in MongoDB and the last 10 messages are forwarded to the RAG pipeline on each request to maintain conversational context.
- All sensitive credentials are environment-based with no hardcoded secrets.

---

## Project Structure

```
Law_Bridge_FullStack/
├── Frontend/                        # User-facing React application
│   ├── src/
│   │   ├── api/                     # Axios API modules (user, lawyer, appointment, chat, payment, video)
│   │   ├── components/              # Shared UI components (Navbar, Footer, Sidebar, etc.)
│   │   ├── context/                 # React Context (AppContext, token helpers)
│   │   ├── layouts/                 # Route layout wrappers
│   │   ├── pages/                   # Page components (Home, Lawyers, Appointment, Chatbot, etc.)
│   │   └── routes/                  # React Router configuration
│   ├── package.json
│   └── vite.config.js
│
├── Admin/                           # Admin and Lawyer panel React application
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Admin/               # Admin pages (Dashboard, LawyerList, AllAppointments, AddLawyer)
│   │   │   └── Lawyer/              # Lawyer pages (LawyerDashboard, LawyerAppointments, LawyerProfile, LawyerVideoCall)
│   │   └── routes/
│   ├── package.json
│   └── vite.config.js
│
├── Backend/                         # Express.js REST API server
│   ├── config/                      # MongoDB, Cloudinary, Redis, Stream.io connections
│   ├── controllers/                 # Route handlers (user, lawyer, admin, chat, message, video)
│   ├── middleware/                  # Auth guards, rate limiters, credit manager, multer, mongo sanitize
│   ├── models/                      # Mongoose models (User, Lawyer, Appointment, Conversation)
│   ├── routes/                      # Express routers (auth, user, lawyer, admin, chat, message, video)
│   ├── services/                    # Email templates and mail service
│   ├── utils/                       # Token generation, hashing, cookie options, crypto helpers
│   ├── validations/                 # Zod schemas for request and token validation
│   └── server.js                    # Application entry point
│
├── chatbot/                         # Python FastAPI RAG chatbot service
│   ├── data/                        # PDF legal documents (Indian Constitutional Law)
│   ├── src/
│   │   ├── api/
│   │   │   └── chat.py              # FastAPI endpoints (/chat, /health)
│   │   ├── config/                  # Environment, Gemini, and Pinecone initialisation
│   │   ├── embeddings/              # Embedding creation pipeline
│   │   ├── loaders/                 # PDF loader using PyPDFLoader
│   │   ├── processors/              # Text chunker using RecursiveCharacterTextSplitter
│   │   └── vectorStore_Retrieval/   # Pinecone vector store, batch uploader, retriever
│   ├── main.py                      # Entry point (setup, server, or both)
│   └── req.txt                      # Python dependencies
│
├── doc_analyser/                    # Document analyser module (in development)
├── LICENSE
└── README.md
```

---

## Data Models

### User

Fields: `name`, `email`, `password` (bcrypt hashed), `image`, `phone`, `address`, `gender`, `dob`, `emailVerified`, `emailVerificationToken`, `emailVerificationExpiry`, `resetPasswordToken`, `resetPasswordExpiry`, `deleteOtp`, `deleteOtpExpiresAt`, `refreshToken`, `twoFactorEnabled`, `twoFactorSecret`, `credits` (dailyLimit, remaining, lastReset)

### Lawyer

Fields: `name`, `email`, `password` (bcrypt hashed), `image`, `speciality`, `degree`, `experience`, `about`, `available`, `fees`, `slots_booked`, `address`, `date`, `refreshToken`

### Appointment

Fields: `userId`, `lawyerId`, `slotDate`, `slotTime`, `userData` (snapshot), `lawyerData` (snapshot), `amount`, `date`, `cancelled`, `payment`, `isCompleted`, `videoCall` (callId, roomId, status, startedAt, endedAt, duration, userJoined, lawyerJoined), `createdAt`, `updatedAt`

### Conversation

Fields: `userId` (ref: User), `sessionId`, `title`, `messages` (array of `{role, content, timestamps}`), `createdAt`, `updatedAt`. Compound unique index on `(userId, sessionId)`.

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/refresh` | Refresh access token using HttpOnly refresh token cookie |
| POST | `/logout` | Clear refresh token and revoke session |

### User (`/api/user`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user account |
| POST | `/login` | Login; returns access token and sets refresh cookie |
| POST | `/verify-email` | Verify email with hashed token from email link |
| POST | `/resend-verification` | Resend email verification link |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password using token from email |
| GET | `/profile` | Get authenticated user profile |
| PUT | `/update-profile` | Update profile fields and/or upload profile image |
| POST | `/book-appointment` | Book an appointment slot with a lawyer |
| GET | `/appointments` | List all appointments for the authenticated user |
| POST | `/cancel-appointment` | Cancel a booked appointment |
| POST | `/payment-razorpay` | Create a Razorpay payment order |
| POST | `/verify-razorpay` | Verify Razorpay payment signature and mark as paid |
| POST | `/request-delete-otp` | Request OTP to confirm account deletion |
| POST | `/verify-delete-otp` | Verify OTP and permanently delete account |
| POST | `/setup-2fa` | Generate TOTP secret and QR code for 2FA setup |
| POST | `/verify-2fa` | Verify TOTP code and enable 2FA |
| POST | `/disable-2fa` | Disable 2FA after password and TOTP verification |

### Lawyer (`/api/lawyer`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Lawyer login |
| GET | `/profile` | Get authenticated lawyer profile |
| POST | `/update-profile` | Update lawyer profile and image |
| GET | `/appointments` | Get lawyer's appointment list |
| POST | `/cancel-appointment` | Cancel an appointment |
| POST | `/complete-appointment` | Mark appointment as completed |
| GET | `/dashboard` | Get dashboard stats (earnings, appointments) |
| POST | `/change-availability` | Toggle availability status |

### Admin (`/api/admin`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Admin login |
| POST | `/add-lawyer` | Add a new lawyer with image upload |
| GET | `/lawyers` | List all lawyers |
| GET | `/users` | List all users |
| GET | `/appointments` | List all appointments |
| POST | `/cancel-appointment` | Cancel any appointment |
| GET | `/dashboard` | Platform-wide stats and revenue data |

### Video (`/api/video`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/get-token` | Generate Stream.io token and create video call room for an appointment |
| POST | `/update-status` | Update call status (join, leave, end) and calculate duration |
| GET | `/call-details/:appointmentId` | Retrieve video call metadata for an appointment |

### Chat (`/api/chat`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/create` | Create a new chat session |
| GET | `/:sessionId` | Get chat messages for a session |
| GET | `/sessions` | Get all chat sessions for the user |
| POST | `/update-title` | Update the title of a chat session |
| DELETE | `/delete` | Delete a chat session |

### Message (`/api/message`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/send` | Send a message; proxies to RAG chatbot, decrements credit, saves conversation in background |

### Chatbot Service (`FastAPI` on port 4000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service status |
| POST | `/chat` | Accepts `sessionId`, `history`, and `message`; returns RAG-generated legal response. Requires `secure_key` header. |
| GET | `/health` | Health check |

---

## Authentication and Security Model

- Stateless JWT authentication with two-token architecture
- Access tokens are short-lived and transmitted via the `Authorization: Bearer` header
- Refresh tokens are long-lived and stored exclusively in HttpOnly, secure, sameSite cookies
- Refresh tokens are stored in the database and invalidated on logout or account deletion
- Email verification is required before full platform access
- TOTP-based Two-Factor Authentication using the `otpauth` library; setup delivers a QR code and a manual base32 key; a 2-window delta is accepted to tolerate clock skew
- Brute-force protection on TOTP verification using Redis-backed attempt counters
- Password hashing with bcrypt (salted)
- Zod schema validation on all sensitive request bodies
- Role-based access control enforced via three separate middleware guards: `authUser`, `authLawyer`, `authAdmin`
- MongoDB operator injection prevention via `express-mongo-sanitize`
- HTTP security headers via Helmet
- CORS restricted to an explicit allowlist (`ALLOWED_ORIGINS` env variable); non-origin requests blocked in production
- Global Redis-backed rate limiter: 200 requests per 60 seconds per IP across all routes
- Per-route rate limiter available for sensitive endpoints (e.g. login, 2FA verification)
- Chatbot service protected by a shared `RAG_SECRET_KEY` validated on every request

---

## Chatbot Credit System

Each user is allocated 10 chatbot queries per day. Credits are tracked in two places simultaneously:

- Redis: a per-user key (`credits:<userId>`) auto-expires at midnight using a TTL calculated to the next 00:00:00
- MongoDB: `credits.remaining` on the User document, decremented atomically with Redis and reset on the next day's first request

When credits are exhausted, the backend returns HTTP 403 with a `daily credit limit` message. The frontend Axios interceptor catches this and permanently disables the chat input for the session with a persistent toast notification.

---

## RAG Pipeline

The chatbot service implements a Retrieval Augmented Generation pipeline:

1. PDF documents from the `chatbot/data/` directory are loaded page-by-page using `PyPDFLoader` with source filename metadata tagging.
2. Documents are chunked using `RecursiveCharacterTextSplitter` with a chunk size of 1000 characters and an overlap of 200 characters.
3. Chunks are embedded using Google `gemini-embedding-001` (3072 dimensions) and stored in a Pinecone serverless index (cosine similarity, AWS us-east-1).
4. The embedding upload pipeline processes batches of 25 chunks, enforces a 1-second delay between batches, retries on HTTP 429 with exponential backoff (up to 5 retries), stops immediately on daily quota exhaustion, and persists batch progress to `progress.json` for resumable uploads.
5. At query time, the top 3 most similar chunks are retrieved from Pinecone using similarity search.
6. The retrieved context, the last 10 messages of conversation history, and the current question are combined into a structured prompt and sent to Google Gemini 2.5 Flash.
7. The prompt instructs the model to answer strictly from context when relevant, fall back to general Indian legal guidance when not, avoid referencing the context or system prompt, and use Markdown formatting when detailed output is requested.

---

## Prerequisites

- Node.js v18 or higher
- pnpm v10 or higher
- Python 3.12
- MongoDB Atlas or a local MongoDB instance
- Redis instance (local or hosted, e.g. Upstash)
- Pinecone account with a 3072-dimensional cosine index
- Google Cloud project with Gemini API enabled
- Cloudinary account
- Razorpay account
- Stream.io account
- Brevo (Sendinblue) account for transactional email

---

## Installation

Clone the repository:

```
git clone https://github.com/Divyansh1552005/Law_Bridge_Application.git
cd Law_Bridge_FullStack
```

Install Frontend dependencies:

```
cd Frontend
pnpm install
```

Install Backend dependencies:

```
cd Backend
pnpm install
```

Install Admin dependencies:

```
cd Admin
pnpm install
```

Install Chatbot dependencies:

```
cd chatbot
python3 -m venv rag
source rag/bin/activate
pip install -r req.txt
```

---

## Environment Setup

Each service requires its own `.env` file. Refer to the `.env.example` file in the `Frontend`, `Backend`, `Admin`, and `chatbot` directories for the required variables.

Key variables by service:

**Backend**
- `MONGODB_URI` – MongoDB connection string
- `REDIS_URL` – Redis connection URL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – JWT signing secrets
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `STREAM_API_KEY`, `STREAM_API_SECRET`
- `RAG_CHATBOT_API_URL` – Base URL of the FastAPI chatbot service
- `RAG_SECRET_KEY` – Shared secret for backend-to-chatbot authentication
- `ALLOWED_ORIGINS` – Comma-separated list of allowed CORS origins
- `BREVO_API_KEY` or SMTP credentials for email delivery

**Chatbot**
- `GOOGLE_API_KEY` – Google Gemini API key
- `PINECONE_API_KEY` – Pinecone API key
- `PINECONE_INDEX` – Name of the Pinecone index
- `APP_SECRET_KEY` – Must match `RAG_SECRET_KEY` in the Backend

**Frontend / Admin**
- `VITE_BACKEND_URL` – URL of the Express backend

---

## Running the Application

Start the Backend:

```
cd Backend
pnpm start
```

Start the Frontend:

```
cd Frontend
pnpm run dev
```

Start the Admin panel:

```
cd Admin
pnpm run dev
```

Start the Chatbot service (first-time setup, creates embeddings then starts server):

```
cd chatbot
source rag/bin/activate
python main.py
```

Start the Chatbot service (subsequent runs, embeddings already exist):

```
cd chatbot
source rag/bin/activate
python main.py server
```

Create embeddings only without starting the server:

```
python main.py setup
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes with descriptive messages
4. Open a pull request against the main branch

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Support

For support, contact: [lawbridgeorg@gmail.com](mailto:lawbridgeorg@gmail.com)

---

## Disclaimer

LawBridge is an informational platform and does not constitute legal advice. AI-generated responses are based on publicly available legal documents and are intended for educational purposes only. Users must consult a qualified legal professional before making any legal decisions.

---

Built by Divyansh