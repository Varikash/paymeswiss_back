# Planning Poker Backend

A real-time Planning Poker application backend built with NestJS and Socket.IO. This application allows teams to conduct agile planning poker sessions with real-time voting, timers, and vote reveal functionality.

**Note**: This is a test assignment project demonstrating real-time WebSocket communication and agile planning poker functionality.

## Features

- **Real-time Communication**: WebSocket-based communication using Socket.IO
- **Room Management**: Create and join planning poker rooms
- **Voting System**: Support for standard Fibonacci sequence (1, 2, 3, 5, 8, 13) and special values (?, coffee)
- **Timer Functionality**: Built-in timer for voting sessions
- **Host Management**: Automatic host assignment and transfer
- **Vote Reveal**: Automatic reveal when all players have voted
- **User Management**: Track users joining and leaving rooms

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **WebSocket**: Socket.IO
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd planning-poker-backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Endpoints

### WebSocket Events

#### Client to Server Events

- `join_room`: Join a planning poker room
  ```typescript
  {
    roomId: string;
    username: string;
  }
  ```

- `vote`: Submit a vote
  ```typescript
  {
    roomId: string;
    value: VoteValue; // 1 | 2 | 3 | 5 | 8 | 13 | '?' | 'coffee'
  }
  ```

- `reset`: Reset all votes in the room
  ```typescript
  {
    roomId: string;
  }
  ```

- `start_timer`: Start a voting timer
  ```typescript
  {
    roomId: string;
    duration: number; // seconds
  }
  ```

- `stop_timer`: Stop the current timer
  ```typescript
  {
    roomId: string;
  }
  ```

#### Server to Client Events

- `room_update`: Room state update
- `vote_reveal`: Votes have been revealed
- `vote_reset`: Votes have been reset
- `join_error`: Error joining room

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  vote?: VoteValue;
  isHost?: boolean;
  joinedAt: Date;
}
```

### Room
```typescript
interface Room {
  id: string;
  name: string;
  users: User[];
  revealed: boolean;
  timer?: {
    duration: number;
    startTime?: Date;
    isActive: boolean;
  };
  createdAt: Date;
  hostId: string;
}
```

### VoteValue
```typescript
type VoteValue = 1 | 2 | 3 | 5 | 8 | 13 | '?' | 'coffee';
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Port Configuration

- **Backend**: Runs on port 3000 (default)
- **Frontend**: Should run on port 3001

Make sure your frontend application is configured to connect to the backend on `localhost:3000`.

