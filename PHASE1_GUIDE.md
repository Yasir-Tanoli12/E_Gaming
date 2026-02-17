# Phase 1: Database & Core Backend — Step-by-Step Guide

This guide walks you through Phase 1 of the E-Gaming project.

---

## What Was Built

- **Prisma** – Database ORM with PostgreSQL
- **Auth API** – Register, Login, JWT, `/auth/me`
- **Games API** – CRUD for games (public list + admin management)
- **Users API** – Admin-only user list and auth activity logs
- **Auth logging** – Signup and signin events stored for admin dashboard

---

## Step 1: Get a PostgreSQL Database

You need a PostgreSQL database. Options:

| Provider | Free Tier | Setup |
|----------|-----------|-------|
| **Supabase** | 500MB | [supabase.com](https://supabase.com) → New Project → Settings → Database → Connection string |
| **Neon** | 512MB | [neon.tech](https://neon.tech) → Create project → Connection string |
| **Railway** | $5 credit | [railway.app](https://railway.app) → New → PostgreSQL |
| **Local** | — | Install PostgreSQL, use `postgresql://user:pass@localhost:5432/egaming` |

Copy the **connection string** (looks like `postgresql://user:password@host:5432/database`).

---

## Step 2: Configure Environment

1. In the `backend` folder, create a `.env` file:

```bash
cd backend
```

2. Copy `.env.example` to `.env`:

```bash
copy .env.example .env   # Windows
# or: cp .env.example .env   # Mac/Linux
```

3. Edit `.env` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="your-super-secret-key-min-32-chars"
PORT=3001
```

**Generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

When prompted for a migration name, use: `init`

This creates all tables: `User`, `AuthLog`, `Game`.

---

## Step 4: Seed the Admin User

```bash
npm run prisma:seed
```

This creates the first admin user:

- **Email:** `admin@egaming.com`
- **Password:** `Admin@123`

To customize:
```bash
set ADMIN_EMAIL=your@email.com
set ADMIN_PASSWORD=YourSecurePass123
npm run prisma:seed
```

---

## Step 5: Generate Prisma Client & Build

```bash
npm run prisma:generate
npm run build
```

---

## Step 6: Start the Backend

```bash
npm run start:dev
```

Backend runs at **http://localhost:3001**

---

## API Endpoints Reference

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/games` | List active games |
| GET | `/` | Health check |

### Protected (Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Current user profile |

### Admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games/admin` | All games |
| GET | `/games/:id` | Single game |
| POST | `/games` | Create game |
| PATCH | `/games/:id` | Update game |
| DELETE | `/games/:id` | Delete game |
| GET | `/users` | List users with contact info |
| GET | `/users/auth-logs` | All signup/signin logs |
| GET | `/users/:id/auth-logs` | Logs for one user |

---

## Testing the API

### 1. Register a user

```bash
curl -X POST http://localhost:3001/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@test.com\",\"password\":\"Test@123\",\"phone\":\"+1234567890\",\"name\":\"Test User\"}"
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@egaming.com\",\"password\":\"Admin@123\"}"
```

Use the `accessToken` from the response for protected routes.

### 3. Get games (public)

```bash
curl http://localhost:3001/games
```

### 4. Create a game (admin)

```bash
curl -X POST http://localhost:3001/games ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"title\":\"Sample Game\",\"gameLink\":\"https://example.com/game\",\"description\":\"Fun game\"}"
```

---

## Database Schema

```
User        → id, email, phone, passwordHash, name, role, isActive, createdAt, lastLoginAt
AuthLog     → id, userId, action (SIGNUP/SIGNIN), ipAddress, userAgent, createdAt
Game        → id, title, description, thumbnailUrl, gameLink, sortOrder, isActive, createdAt
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL` not found | Ensure `.env` exists in `backend/` and contains `DATABASE_URL` |
| Prisma Client not generated | Run `npm run prisma:generate` |
| Migration fails | Check DB URL, credentials, and network access |
| 401 Unauthorized | Include `Authorization: Bearer <token>` header |
| 403 Forbidden | Use an admin user for admin endpoints |

---

## Next: Phase 2

Phase 2 will add the frontend auth module (sign up/sign in forms) and connect them to this backend.
