# Chat Frontend — React + Vite

The client-side application for the Real-Time Chat project.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM 6
- **Real-time**: Socket.io Client
- **Styling**: Vanilla CSS (Modern CSS variables)
- **API Client**: Axios

## Features
- 🔑 **Auth Flow**: Persistent login with JWT stored in local storage.
- 💬 **Real-time Chat**: Instant messaging using WebSockets.
- 📁 **Room Management**: Browse and create chat rooms.
- 🟢 **Presence System**: Real-time online/offline status indicators.
- ⌨️ **Typing Indicators**: Visual feedback when others are typing.
- 📱 **Responsive Design**: Mobile-friendly layout for chatting on the go.

## Getting Started

### Prerequisites
- Node.js >= 20

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Production Build
Generate a production-ready bundle in the `dist` folder:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Folder Structure
```
src/
├── components/   # Reusable UI components (ChatBox, RoomList, etc.)
├── context/      # Context providers (AuthContext, SocketContext)
├── pages/        # Main page components (Login, Register, Chat)
├── services/     # API and Socket helper functions
├── App.jsx       # Main application routing
└── main.jsx      # Entry point
```

## Environment Variables
The application expects the backend to be available at `/api` and the socket connection at the root. When running locally without a proxy, ensure the base URLs in `services/api.js` and `services/socket.js` are configured correctly.
