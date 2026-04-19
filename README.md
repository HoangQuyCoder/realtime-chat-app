# Real-Time Chat App

A full-stack real-time chat application built with **Node.js**, **Socket.io**, **MongoDB**, **Redis**, and **React**.

## Tech Stack

| Layer                | Technology                         |
| -------------------- | ---------------------------------- |
| **Frontend**         | React 18 + Vite + React Router     |
| **Backend**          | Node.js 20 + Express + Socket.io 4 |
| **Database**         | MongoDB 7 + Mongoose               |
| **Cache / Pub-Sub**  | Redis 7 + @socket.io/redis-adapter |
| **Proxy**            | Nginx                              |
| **Containerization** | Docker Compose                     |

## Project Structure

```
realtime-chat/
├── backend/          # Node.js API + Socket.io server
├── frontend/         # React + Vite client
├── nginx/            # Nginx reverse proxy configuration
└── docker-compose.yml
```

---

## Running with Docker Compose (Recommended)

### 1. Clone / Extract the project

```bash
cd realtime-chat
```

### 2. Configure Backend Environment Variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and change JWT_SECRET to a long random string
```

### 3. Build and Start all Services

```bash
docker compose up --build
```

The first build will take ~2–3 minutes as it downloads Node images and installs npm packages.

### 4. Access the App

Open your browser and navigate to:

```
http://localhost
```

### Stop the Project

```bash
docker compose down

# To remove data volumes (MongoDB + Redis)
docker compose down -v
```

---

## Running Local Development (Without Docker)

### Prerequisites

- Node.js >= 20
- MongoDB running locally (default port 27017)
- Redis running locally (default port 6379)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Adjust MONGO_URI and REDIS_URL in .env if necessary
npm run dev
# Server will be running at http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Client will be running at http://localhost:3000
```

---

## Core Features

- **Authentication** — Register/Login with JWT, bcrypt, and session restoration.
- **Multiple Chat Rooms** — Create and join/leave rooms in real-time.
- **Message History** — Persistent history stored in MongoDB, loaded upon joining.
- **Online Presence** — Tracked via Redis with heartbeats and real-time status badges.
- **Typing Indicators** — Real-time "is typing..." status for users in the same room.
- **Scalability** — Redis Pub/Sub adapter allows horizontal scaling across multiple Node instances.

## REST API Overview

| Method  | Endpoint                  | Description                                |
| ------- | ------------------------- | ------------------------------------------ |
| `POST`  | `/api/auth/register`      | Register a new user                        |
| `POST`  | `/api/auth/login`         | Login and receive JWT                      |
| `GET`   | `/api/auth/me`            | Get current user info                      |
| `GET`   | `/api/rooms`              | List all available rooms                   |
| `POST`  | `/api/rooms`              | Create a new room                          |
| `GET`   | `/api/rooms/:id/messages` | Get message history (query: before, limit) |
| `GET`   | `/api/users`              | List all users                             |
| `GET`   | `/api/users/online`       | List currently online users                |
| `PATCH` | `/api/users/profile`      | Update user avatar                         |
| `GET`   | `/api/health`             | System health check and stats              |

## Socket.io Events

### Client to Server

- `join_room`: `{ roomId }`
- `leave_room`: `{ roomId }`
- `send_message`: `{ roomId, content }`
- `typing_start`: `{ roomId }`
- `typing_stop`: `{ roomId }`
- `heartbeat`: Keep presence alive

### Server to Client

- `message_history`: Last 30 messages upon joining a room
- `new_message`: Real-time new message broadcast
- `user_online` / `user_offline`: Status change notifications
- `user_typing` / `user_stop_typing`: Typing indicator updates
- `user_joined_room` / `user_left_room`: Room activity notifications

## Performance

Target: p95 latency < 100ms with 50 concurrent users.
