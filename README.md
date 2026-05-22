# OptiMall Initial Setup

Repo structure:

- `src/`: React UI (Vite + Tailwind + Clerk Auth)
- `api/server.js`: Vercel serverless function using Express routes
- `python-engine`: FastAPI intelligent service (Dockerized)
- `1db_stuff/OptiMall.sql`: MySQL schema for XAMPP

## Architecture

Frontend (React) -> Vercel API Function (`api/server.js`) -> Python Engine (FastAPI) -> MySQL (XAMPP)

## API Endpoints (single Express app)

- `GET /api/products`
- `POST /api/activity`
- `POST /api/recommendations`

## 1) Database (XAMPP MySQL)

1. Start Apache + MySQL in XAMPP.
2. Create database:
   ```sql
   CREATE DATABASE optimall;
   ```
3. Import schema:
   ```bash
   mysql -u root -p optimall < 1db_stuff/OptiMall.sql
   ```

## 2) Python Engine (Docker)

```bash
cd python-engine
docker compose up --build -d
```

Health check:

```bash
curl http://localhost:8000/health
```

## 3) Install Dependencies

```bash
npm install
```

## 4) Local Development (Recommended)

Single command (starts Python engine + API dev + Vite dev):

```bash
npm run dev:fullstack
```

Manual commands:

Run frontend and API separately:

```bash
npm run api:dev
npm run dev
```

Optional Vercel runtime (if you specifically want to test Vercel rewrites/functions):

```bash
npm run dev:vercel
```

## 5) Clerk Setup

1. Create Clerk app in Clerk dashboard.
2. Enable desired OAuth providers (Google, GitHub, etc.) in Clerk.
3. Put your Clerk publishable key in `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

## 6) Env Vars

Set these in local `.env` (and Vercel project settings for deployment):

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PYTHON_ENGINE_URL`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`

## Notes

- `vercel.json` rewrites all `/api/*` requests to `api/server.js`.
- Python container connects to host XAMPP MySQL using `host.docker.internal`.
- API integration tests for pipeline route: `npm run test:api`.
