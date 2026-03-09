# RevaShow

RevaShow is a centralized event discovery and booking platform specifically for REVA University campus events.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS v4, Vite, Lucide-React.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

## Features
- **Student Home**: Search and filter events by category or venue.
- **Authentication**: Dedicated login/signup for Students, Organizers, and Admins.
- **Registration**: Real-time seat availability check and booking.
- **Organizer Tools**: CRUD for event management.

## Getting Started

### 1. Prerequisite
Ensure you have a PostgreSQL database instance running.

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/revashow"
JWT_SECRET="your_jwt_secret"
```
Run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Start server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

## Folder Structure
Refer to `brain/project_overview.md` for a detailed breakdown.
