# RevaShow 2026

RevaShow is a centralized event discovery and booking platform specifically for REVA University campus events, featuring live events for the upcoming REVA Show 2026.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS v4, Vite, Lucide-React.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

## Features
- **Student Home**: Search and filter events by category or venue, with dynamic skeletons and personalized recommendations.
- **Authentication**: Dedicated login/signup for Students, Organizers, and Admins.
- **Registration**: Real-time seat availability check and booking.
- **Organizer Tools**: CRUD for event management and comprehensive analytics dashboard.

## Getting Started

### 1. Prerequisite
Ensure you have Node.js installed and a PostgreSQL database instance running.

### 2. Install Dependencies
Install dependencies for both the client, server, and root directories:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the `server` directory (based on `.env.example`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/revashow?sslmode=disable"
JWT_SECRET="your_jwt_secret"
PORT=5000
```
Create a `.env` file in the `client` directory (based on `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Run the Application
You can now start both the frontend and backend servers simultaneously from the root directory using the `concurrently` script:
```bash
npm run dev
```
- Frontend will run on `http://localhost:5173`
- Backend API will run on `http://localhost:5000`

## Folder Structure
Refer to `brain/project_overview.md` for a detailed breakdown.
