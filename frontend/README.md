# LearnHub web app (Angular)

Single-page application for LearnHub, built with Angular 21: standalone components, signals,
zoneless change detection, lazy-loaded routes and typed reactive forms. No UI library — the design
system lives in `src/styles/` as CSS custom properties with light and dark themes.

## Getting started

Requires Node.js 20.19+ (or 22.12+ / 24+) and the backend running on `http://localhost:8000`.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
```

The API address is configured in `src/environments/environment*.ts`.

## Project structure

```
src/
├── styles/                    # design tokens, base, buttons, forms, tables, utilities
└── app/
    ├── core/
    │   ├── models/            # TypeScript interfaces mirroring the API schemas
    │   ├── services/          # API services, auth state, toasts, confirm dialog, theme
    │   ├── guards/            # authGuard, guestGuard, roleGuard(...)
    │   ├── interceptors/      # attaches the JWT, handles expired sessions
    │   └── utils/             # HTTP helpers, validators, storage, navigation
    ├── shared/
    │   ├── components/        # course card, cover, avatar, pagination, stat card, dialogs…
    │   └── pipes/             # price, status label, letter grade, video embed
    ├── layout/                # navbar, footer, dashboard (sidebar) layout
    └── features/
        ├── home/  auth/  courses/  learning/  profile/
        ├── teach/             # course management, course form, lessons, gradebook
        ├── students/          # student list + detail (Teach and Admin areas)
        ├── admin/             # dashboard, users, categories, messages
        └── pages/             # about, contact, FAQ, privacy/terms, 404
```

## Routes

| Path | Access |
| --- | --- |
| `/`, `/courses`, `/courses/:id`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms` | Public |
| `/login`, `/register` | Guests |
| `/profile`, `/courses/:id/learn/:lessonId` | Signed in |
| `/my-learning` | Students |
| `/teach/**` | Instructors and admins |
| `/admin/**` | Admins |
