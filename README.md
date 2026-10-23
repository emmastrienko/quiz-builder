# Quiz Builder

A full-stack quiz creation platform. Users can build quizzes with three question
types (boolean, short-answer input, and multiple-choice checkbox), browse all
quizzes on a dashboard, view a single quiz in read-only detail, and delete
quizzes.

**Live demo: https://quiz-builder-47ys.vercel.app**

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | Node.js, Express, TypeScript, Zod (validation), CORS               |
| Database | PostgreSQL via Prisma (also works with SQLite by changing `provider`)|
| Frontend | Next.js (Pages Router), React, TypeScript, Tailwind CSS            |
| Forms    | React Hook Form + Zod resolver (`useFieldArray` for dynamic fields) |

## Project Structure

```
quiz-builder/
├── backend/            # Express API
│   ├── prisma/         # schema.prisma + migrations + seed script
│   └── src/            # routes, controllers, services, validators, middleware
├── frontend/           # Next.js app
│   ├── pages/          # /, /create, /quizzes, /quizzes/[id]
│   ├── components/     # QuestionEditor, QuestionDisplay, form schema
│   ├── services/       # API client
│   └── types/          # shared TypeScript types
└── README.md
```

## Prerequisites

- Node.js 18+ (built and tested on Node 22)
- npm 9+
- PostgreSQL server running locally (~:5432)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # Windows PowerShell: Copy-Item .env.example .env
# edit .env and set your Postgres credentials in DATABASE_URL
npx prisma migrate dev     # creates the quiz_builder database + applies migration
npm run db:seed            # (optional) creates the sample quiz
```

Prisma creates the database automatically if the user in `DATABASE_URL` has
sufficient privileges; otherwise create it first:

```sql
CREATE DATABASE quiz_builder;
```

`.env` values:

| Variable       | Description                    | Default                                                        |
| -------------- | ------------------------------ | -------------------------------------------------------------- |
| `DATABASE_URL` | Prisma connection string       | `postgresql://postgres:postgres@localhost:5432/quiz_builder`   |
| `PORT`         | API port                       | `3001`                                                         |
| `CORS_ORIGIN`  | Allowed frontend origin        | `http://localhost:3000`                                        |

Start the dev server (watch mode):

```bash
npm run dev
# -> Quiz Builder API listening on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
# -> http://localhost:3000
```

`.env.local` values:

| Variable                   | Description      | Default                 |
| -------------------------- | ---------------- | ----------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:3001` |

## API Endpoints

| Method   | Endpoint        | Description                                    |
| -------- | --------------- | ---------------------------------------------- |
| `POST`   | `/quizzes`      | Create a quiz (validated with Zod)              |
| `GET`    | `/quizzes`      | List all quizzes with title + question count    |
| `GET`    | `/quizzes/:id`  | Full quiz details including all questions       |
| `DELETE` | `/quizzes/:id`  | Delete a quiz (questions removed by cascade)    |

Error responses:

- `400` — validation failure, with `issues: [{ field, message }]`
- `404` — unknown quiz id or unknown route

### Create payload shape

```json
{
  "title": "Sample quiz",
  "questions": [
    { "type": "boolean", "text": "Is 2+2=4?", "correctAnswer": true },
    { "type": "input", "text": "Capital of Japan?", "correctAnswer": "Tokyo" },
    {
      "type": "checkbox",
      "text": "Pick the even numbers",
      "options": ["1", "2", "3", "4"],
      "correctAnswers": ["2", "4"]
    }
  ]
}
```

Validation rules: every question requires non-empty text; boolean questions
require a true/false answer; input questions require a non-empty answer; checkbox
questions require at least two non-empty, unique options and at least one correct
answer that matches one of the options.

## Creating a Sample Quiz

Either run the seed script:

```bash
cd backend
npm run db:seed
```

The seeder is idempotent (existing quizzes are skipped) and creates three fun
trivia quizzes with all three question types:

- **Tech & Code Trivia** — 5 questions
- **Movie & TV Trivia** — 5 questions
- **Food for Thought** — 5 questions

or use the UI at http://localhost:3000/create.

## Pages

| Route           | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `/`             | Landing page                                                             |
| `/create`       | Quiz builder form — dynamic add/remove questions, React Hook Form + Zod  |
| `/quizzes`      | Dashboard — all quizzes, question counts, link + delete per quiz         |
| `/quizzes/[id]` | Read-only quiz detail — shows questions including correct answers        |

## Scripts

Backend (`cd backend`):

- `npm run dev` — watch-mode dev server
- `npm run build` / `npm start` — compile + run production build
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — seed the sample quizzes
- `npm test` / `npm run test:watch` — Vitest API tests (run against a dedicated
  `quiz_builder_test` database, created automatically)
- `npm run lint` / `npm run format` — ESLint / Prettier

Frontend (`cd frontend`):

- `npm run dev` — Next.js dev server (Turbopack)
- `npm run build` / `npm start` — production build + server
- `npm run lint` / `npm run format` — ESLint / Prettier

## Deployment (Vercel + Neon)

Both apps are deployed as separate Vercel projects with a hosted Neon
PostgreSQL database.

### 1. Provision the database

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled connection string** and the **direct connection string**
   (Prisma needs `?sslmode=require` on both).
3. Point `DATABASE_URL` in `backend/.env` to the **direct** connection string
   and run migrations + seed from your machine:

```bash
cd backend
$env:DATABASE_URL = "<direct connection string>"   # PowerShell
npx prisma migrate deploy
tsx prisma/seed.ts                                  # optional
```

### 2. Deploy the backend

The Express API is exposed as a Vercel serverless function in
`backend/api/index.ts` (all routes are rewritten to it via `vercel.json`).

1. Import the repository in Vercel with **Root Directory = `backend`**;
   framework preset: Other.
2. Set environment variables on the project:
   - `DATABASE_URL` → Neon **pooled** connection string
   - `CORS_ORIGIN` → the deployed frontend URL

### 3. Deploy the frontend

1. Import the repository in Vercel with **Root Directory = `frontend`**;
   framework preset: Next.js (auto-detected).
2. Set the environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` → the backend deployment URL

## Notes

- Never commit `.env` / `.env.local` — `.env.example` files are provided instead.
- The `quiz_builder` PostgreSQL database must exist before migrating (Prisma
  creates it if the configured user has privileges).
