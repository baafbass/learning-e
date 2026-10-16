# LearnHub API (FastAPI)

REST API for LearnHub. Interactive documentation is served at `http://localhost:8000/docs`.

## Project structure

```
app/
├── main.py            # application factory, CORS, exception handlers
├── core/              # settings, security (bcrypt + JWT), domain exceptions
├── db/                # engine/session, declarative base, init + seed script
├── models/            # SQLAlchemy models (users, categories, courses, lessons, enrollments, grades…)
├── schemas/           # Pydantic request/response models
├── services/          # business rules (ownership, progress, grades, statistics)
└── api/
    ├── deps.py        # DB session, current user, role checks, query params
    ├── router.py      # mounts every route module under /api
    └── routes/        # thin HTTP layer, one module per resource
tests/                 # pytest suite running on in-memory SQLite
```

Routes stay thin: they validate input with schemas, call one service function and return the
result. Services raise domain exceptions (`NotFoundError`, `PermissionDeniedError`, …) that are
translated into HTTP responses in one place (`core/exceptions.py`).

## Setup with Neon

1. Create a project on [neon.tech](https://neon.tech) and copy the connection string
   (`postgresql://user:password@ep-….neon.tech/neondb?sslmode=require`).
2. Configure the environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
   pip install -r requirements-dev.txt
   copy .env.example .env             # macOS/Linux: cp .env.example .env
   ```

   In `.env`, set `DATABASE_URL` to the Neon string (the `postgresql://` prefix is converted to
   the psycopg 3 driver automatically) and `JWT_SECRET_KEY` to a long random value:
   `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

3. Create the tables and load demo data, then start the server:

   ```bash
   python -m app.db.init_db --seed     # --reset drops everything first
   uvicorn app.main:app --reload
   ```

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | — (required) | PostgreSQL connection string (Neon) |
| `JWT_SECRET_KEY` | — (required, ≥ 16 chars) | Secret used to sign tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime |
| `CORS_ORIGINS` | `http://localhost:4200` | Comma-separated allowed origins |
| `AUTO_CREATE_TABLES` | `true` | Create missing tables on startup |

## Quality checks

```bash
pytest            # 27 API tests on an in-memory SQLite database
ruff check .      # linting
ruff format .     # formatting
```
