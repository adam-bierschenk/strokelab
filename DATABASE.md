# Database Setup - StrokeLab

## Overview

StrokeLab uses **Neon PostgreSQL** (the successor to Vercel Postgres) with **Prisma ORM** for database management.

## Tech Stack

- **Database**: Neon PostgreSQL (Serverless Postgres)
- **ORM**: Prisma 7
- **Client**: @prisma/client
- **Driver**: Built-in Prisma PostgreSQL driver

## Setup Instructions

### 1. Create a Neon Database

1. Go to [Neon](https://neon.tech/) and sign up
2. Create a new project
3. Create a database named `strokelab` (or use the default)
4. Get your connection string from the Neon console
5. Copy the connection string - it will look like:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/strokelab?sslmode=require
   ```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` with your Neon connection string:

```env
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/strokelab?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Or push schema directly (for development)
npx prisma db push
```

### 4. Verify Connection

```bash
# Open Prisma Studio to view data
npx prisma studio
```

## Database Schema

### Models

- **User**: User accounts for authentication
- **Account**: OAuth account linking (NextAuth.js)
- **Session**: Session management (NextAuth.js)
- **VerificationToken**: Email verification tokens
- **Course**: Golf course information
- **Hole**: Individual holes for each course
- **Round**: Golf rounds played by users
- **Score**: Hole-by-hole scores for each round

### Relationships

- User ←→ Round (1:N)
- Course ←→ Hole (1:N)
- Course ←→ Round (1:N)
- Round ←→ Score (1:N)
- Hole ←→ Score (1:N)

## Development Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (drops and recreates)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npx prisma studio

# Seed database (when seed.ts exists)
npx prisma db seed
```

## Deployment

### Vercel Integration

1. In your Vercel project, go to **Settings** → **Integrations**
2. Find and install the **Neon** integration
3. Connect your Neon project
4. Vercel will automatically set the `DATABASE_URL` environment variable

### Environment Variables

Make sure these are set in Vercel:

- `DATABASE_URL` - Neon connection string
- `NEXTAUTH_SECRET` - Random string for JWT signing
- `NEXTAUTH_URL` - Your app URL
- `GITHUB_ID` / `GITHUB_SECRET` - OAuth credentials (optional)

## Files

- `prisma/schema.prisma` - Database schema definition
- `prisma.config.ts` - Prisma configuration
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/db.ts` - Database helper functions

## Notes

- Prisma 7+ uses the new configuration format with `prisma.config.ts`
- The `url` property is no longer in `schema.prisma`, it's in `prisma.config.ts`
- Always use the singleton pattern in `src/lib/prisma.ts` to avoid connection pool exhaustion
- The Neon connection requires `sslmode=require`
