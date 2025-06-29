# Planning Poker Backend

A real-time Planning Poker application backend built with NestJS and Socket.IO. This application allows teams to conduct agile planning poker sessions with real-time voting, timers, and vote reveal functionality.

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

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Project Structure

```
src/
├── app.controller.ts          # Main HTTP controller
├── app.service.ts             # Main service
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
└── poker/                     # Planning poker module
    ├── poker.gateway.ts       # WebSocket gateway
    ├── poker.service.ts       # Business logic
    ├── poker.module.ts        # Module definition
    └── types.ts               # Type definitions
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Development

### Adding New Features

1. Create feature module in `src/`
2. Implement business logic in service
3. Add WebSocket handlers in gateway
4. Write tests for new functionality
5. Update documentation

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For questions and support, please open an issue in the repository.
