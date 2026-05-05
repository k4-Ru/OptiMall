# OptiMall Initial Setup

Monorepo structure based on `OptiMall_Architecture.md`:

- `frontend`: React UI (Vite + Tailwind + Clerk Auth)
- `api/server.js`: Single Vercel serverless function using Express routes
- `python-engine`: FastAPI intelligent service (Dockerized)
- `db_stuff/schema.sql`: MySQL schema for XAMPP

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
   mysql -u root -p optimall < db_stuff/schema.sql
   ```

## 2) Python Engine (Docker)

```bash
cd python-engine
docker compose up --build
```

Health check:

```bash
curl http://localhost:8000/health
```

## 3) API Dependencies

```bash
npm install
cp .env.example .env
```

## 4) Frontend + Clerk

1. Create Clerk app in Clerk dashboard.
2. Enable desired OAuth providers (Google, GitHub, etc.) in Clerk.
3. Set frontend env:

```bash
cd frontend
cp .env.example .env
```

4. Put your Clerk publishable key in `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

5. Install and run frontend:

```bash
npm install
npm run dev
```

## 5) Env Vars

Set these in Vercel project settings:

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
