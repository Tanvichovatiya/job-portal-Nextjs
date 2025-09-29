# Job Portal – Monorepo (Next.js + Express/Socket.IO + Prisma/MongoDB)
# currently Running
A full‑stack job portal with a Next.js frontend and a Node/Express Socket.IO backend using Prisma with a MongoDB datasource.

## Tech Stack
- Frontend: Next.js 15, React 19, Bootstrap
- Backend: Node.js, Express, Socket.IO
- DB/ORM: MongoDB via Prisma

## Quick Start (6 steps)
1) Clone and enter the project
```bash
git clone <your-repo-url> job-portal && cd job-portal
```

2) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

3) Configure backend env
Create `backend/.env` with your values:
```bash
# backend/.env
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
JWT_SECRET="replace_with_strong_secret"
FRONTEND_ORIGIN="http://localhost:3000"
PORT=4000
```

4) Generate Prisma client and sync schema
```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

5) Run the backend (dev)
```bash
npm run dev
# Server will listen on http://localhost:4000
```

6) Run the frontend (dev)
```bash
cd ../frontend
npm run dev
# App will be on http://localhost:3000
```

## Project Structure
```
backend/          Express + Socket.IO + Prisma
frontend/         Next.js app
```

## Important Files
- Backend entry: `backend/src/server.ts`
- Socket setup: `backend/src/socket/index.ts`
- Auth utils (JWT): `backend/src/utils/auth.ts`
- Prisma schema: `backend/prisma/schema.prisma`
- Frontend socket client: `frontend/lib/socket.ts`

## Socket Authentication
The frontend connects to the backend Socket.IO server at `http://localhost:4000` (see `frontend/lib/socket.ts`). After obtaining a JWT, the client authenticates the socket by emitting an `authenticate` event with the token.

Example usage in the frontend:
```ts
// frontend/lib/socket.ts
// socket.emit("authenticate", token, cb)
```

Backend expects `JWT_SECRET` to validate tokens and will join a private room `user:<userId>` on success.

## Scripts
### Backend (`backend/package.json`)
- `npm run dev`: Start dev server with ts-node-dev
- `npm run build`: TypeScript build to `dist/`
- `npm start`: Run compiled server
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:push`: Push schema to DB

### Frontend (`frontend/package.json`)
- `npm run dev`: Next.js dev server
- `npm run build`: Next.js production build
- `npm start`: Start production server
- `npm run lint`: Lint

## Production
- Backend
  ```bash
  cd backend
  npm run build
  npm start
  ```
- Frontend
  ```bash
  cd frontend
  npm run build
  npm start
  ```

Set appropriate environment variables in your deployment environment. Ensure the frontend is allowed in `FRONTEND_ORIGIN` for CORS and Socket.IO.

## Notes
- MongoDB is required. Use MongoDB Atlas or a local instance; provide the `DATABASE_URL`.
- The frontend socket URL is currently hardcoded in `frontend/lib/socket.ts`. Update if deploying to a different host/port.

## Troubleshooting
- Connection/CORS issues: confirm `FRONTEND_ORIGIN` matches the frontend URL.
- Prisma errors: ensure `DATABASE_URL` is valid, then re-run `npm run prisma:generate` and `npm run prisma:push` in `backend`.

