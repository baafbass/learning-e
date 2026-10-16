# LearnHub — E-learning platform

LearnHub is a full-stack e-learning platform: instructors publish courses and lessons, students
enroll, track their progress and receive grades, and administrators manage the whole platform.

| Folder | Stack | Docs |
| --- | --- | --- |
| [`backend/`](backend/) | FastAPI, SQLAlchemy 2, Pydantic 2, PostgreSQL (Neon), JWT | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend/) | Angular 21 (standalone components, signals, zoneless), SCSS | [frontend/README.md](frontend/README.md) |

## Features

- **Authentication** — register as student or instructor, log in/out, profile and password change, JWT sessions.
- **Catalog** — search, filter by category/level/price, sort, paginate; filters live in the URL.
- **Courses** — create, edit, publish/unpublish and delete courses; add, edit, reorder and delete lessons.
- **Learning** — enroll/unenroll, lesson viewer with video embeds, mark lessons complete, automatic progress and completion.
- **My learning** — in-progress and completed tabs, progress bars, grades with feedback.
- **Grades** — per-course gradebook for instructors with letter grades and averages.
- **Students** — student list and detail pages (admins see all, instructors see their own students).
- **Admin panel** — statistics dashboard, user management (roles, activation, deletion), categories, contact messages.
- **Experience** — responsive layout, light/dark theme, toasts, confirmation dialogs, accessible markup.

## Quick start

```bash
# 1. Backend (http://localhost:8000, API docs at /docs)
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
copy .env.example .env           # then paste your Neon connection string and a JWT secret
python -m app.db.init_db --seed  # create tables + demo data
uvicorn app.main:app --reload

# 2. Frontend (http://localhost:4200)
cd frontend
npm install
npm start
```

## Demo accounts (after `--seed`)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@learnhub.dev | Admin@123 |
| Instructor | sarah.johnson@learnhub.dev | Instructor@123 |
| Student | yasmine.haddad@learnhub.dev | Student@123 |
