# Chat Backend — Node.js + Socket.io + MongoDB + Redis

## Stack

- **Runtime**: Node.js 20 (ESM)
- **Framework**: Express 4
- **Real-time**: Socket.io 4 + Redis Pub/Sub Adapter
- **Database**: MongoDB 7 + Mongoose
- **Cache/Presence**: Redis 7 (ioredis)
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator

## Project Structure

```
src/
├── config/
│   ├── db.js          # MongoDB connection
│   └── redis.js       # Redis clients (pub, sub, cache)
├── controllers/
│   ├── authController.js
│   ├── roomController.js
│   └── userController.js
├── middleware/
│   ├── auth.js        # JWT protect + socketAuth
│   ├── errorHandler.js
│   └── validate.js    # express-validator rules
├── models/
│   ├── User.js
│   ├── Room.js
│   └── Message.js     # compound index: {roomId, createdAt}
├── routes/
│   ├── auth.js
│   ├── rooms.js
│   └── users.js
├── socket/
│   └── handlers.js    # all Socket.io events
└── index.js           # entry point
```

## REST API Endpoints

### Auth

| Method | Endpoint           | Auth | Description      |
| ------ | ------------------ | ---- | ---------------- |
| POST   | /api/auth/register | —    | Register         |
| POST   | /api/auth/login    | —    | Login → JWT      |
| GET    | /api/auth/me       | JWT  | Get current user |

### Rooms

| Method | Endpoint                    | Auth | Description     |
| ------ | --------------------------- | ---- | --------------- |
| GET    | /api/rooms                  | JWT  | List all rooms  |
| POST   | /api/rooms                  | JWT  | Create room     |
| GET    | /api/rooms/:roomId/messages | JWT  | Message history |

### Users

| Method | Endpoint           | Auth | Description    |
| ------ | ------------------ | ---- | -------------- |
| GET    | /api/users         | JWT  | List all users |
| GET    | /api/users/online  | JWT  | Online users   |
| PATCH  | /api/users/profile | JWT  | Update avatar  |

### System

| Method | Endpoint    | Auth | Description    |
| ------ | ----------- | ---- | -------------- |
| GET    | /api/health | —    | Health + stats |

## Socket.io Events

### Client → Server

| Event        | Payload             | Description            |
| ------------ | ------------------- | ---------------------- |
| join_room    | { roomId }          | Join a chat room       |
| leave_room   | { roomId }          | Leave a chat room      |
| send_message | { roomId, content } | Send message           |
| typing_start | { roomId }          | Start typing indicator |
| typing_stop  | { roomId }          | Stop typing indicator  |
| heartbeat    | —                   | Keep presence alive    |

### Server → Client

| Event            | Payload                                      | Description              |
| ---------------- | -------------------------------------------- | ------------------------ |
| message_history  | Message[]                                    | Last 30 messages on join |
| new_message      | { \_id, roomId, content, sender, createdAt } | New message in room      |
| user_joined_room | { userId, username, roomId }                 | User joined room         |
| user_left_room   | { userId, username, roomId }                 | User left room           |
| user_online      | { userId, username }                         | User came online         |
| user_offline     | { userId, username }                         | User went offline        |
| user_typing      | { userId, username, roomId }                 | Typing indicator         |
| user_stop_typing | { userId, roomId }                           | Stopped typing           |

## Local Dev (without Docker)

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env
# Edit .env with your MongoDB/Redis URIs

# 3. Start MongoDB and Redis locally, then:
npm run dev
```

## Performance

Target: p95 latency < 100ms with 50 concurrent users.
