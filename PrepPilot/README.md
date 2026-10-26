# PrepPilot

PrepPilot is a full-stack placement preparation platform for students. It brings
DSA progress tracking, quizzes, resume analysis, mock interviews, personalized
roadmaps, and readiness analytics together in one application.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Application guide](#application-guide)
- [API reference](#api-reference)
- [How the dashboard score works](#how-the-dashboard-score-works)
- [AI providers](#ai-providers)
- [Security and data notes](#security-and-data-notes)
- [Available scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

## Features

- **Accounts and profiles:** Register and log in with email and password;
  update profile and placement preferences.
- **Dashboard:** Review a blended readiness score, performance across four
  pillars, DSA topic counts, recent activity, and a personalized four-week
  roadmap.
- **DSA tracker:** Record solved problems by topic, difficulty, platform,
  elapsed time, and optional URL; set topic goals and remove entries.
- **Quizzes:** Browse quizzes by category, take timed quizzes, submit answers,
  and review personal quiz history.
- **Resume analyzer:** Upload PDF or plain-text resumes, select a target role,
  and receive ATS scoring, matched and missing keywords, strengths, and
  improvement suggestions.
- **Mock interview practice:** Practice technical, HR, or behavioral questions
  and receive feedback on clarity, relevance, and confidence.
- **Theme and navigation:** Use the PrepPilot logo to return to the dashboard.
  Choose a Light, Dark, or Warm theme from the navigation bar; the selection is
  saved in the current browser.

## Technology

| Area | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Charts | Recharts |
| HTTP client | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Authentication | JWT and bcryptjs |
| Resume parsing | Multer in-memory uploads and pdf-parse |
| AI | OpenAI, Google Gemini, or a built-in offline heuristic provider |

## Project structure

The tree below lists the application source and configuration files. Dependency
folders (`node_modules`) and generated build output (`frontend/dist`) are
created locally and are not part of the source tree.

```text
PrepPilot/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── dsaController.js
│   │   ├── interviewController.js
│   │   ├── quizController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── DSAProgress.js
│   │   ├── InterviewAttempt.js
│   │   ├── Quiz.js
│   │   ├── QuizResult.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── dsaRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── quizRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   └── aiService.js
│   └── utils/
│       ├── atsScorer.js
│       ├── generateToken.js
│       └── seed.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProgressChart.jsx
        │   ├── ProtectedRoute.jsx
        │   └── ReadinessScore.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── DSATracker.jsx
            ├── InterviewPrep.jsx
            ├── Login.jsx
            ├── Profile.jsx
            ├── QuizAttempt.jsx
            ├── Quizzes.jsx
            ├── Register.jsx
            └── ResumeAnalyzer.jsx
```

### Backend file guide

| Path | Responsibility |
|---|---|
| `backend/server.js` | Loads environment variables, connects to MongoDB, configures Express middleware and rate limiting, mounts routes, and starts the API server. |
| `backend/config/db.js` | Connects Mongoose to the configured MongoDB database. |
| `backend/controllers/` | Implements request handling and application logic for accounts, dashboard data, DSA, interviews, quizzes, and resume analysis. |
| `backend/middleware/auth.js` | Verifies bearer tokens and attaches the authenticated user to the request; also exports role authorization middleware. |
| `backend/middleware/errorHandler.js` | Handles unknown routes and formats API errors. |
| `backend/models/` | Defines MongoDB schemas for users, DSA progress, quizzes and results, resumes, and interview attempts. |
| `backend/routes/` | Declares API paths and applies authentication protection to private endpoints. |
| `backend/services/aiService.js` | Provides a shared interface for resume analysis, interview answer grading, and roadmap generation. |
| `backend/utils/atsScorer.js` | Provides deterministic resume scoring when mock AI is selected or a provider call fails. |
| `backend/utils/generateToken.js` | Signs user JWTs using the configured secret and expiration. |
| `backend/utils/seed.js` | Replaces the quiz collection with the bundled starter quiz set. |
| `backend/.env.example` | Documents backend environment variables; copy it to `.env` for local development. |

### Frontend file guide

| Path | Responsibility |
|---|---|
| `frontend/src/main.jsx` | Mounts React, the router, authentication provider, and global stylesheet. |
| `frontend/src/App.jsx` | Declares application routes and initializes/persists the selected theme. |
| `frontend/src/index.css` | Imports Tailwind styles, declares Light/Dark/Warm color variables, and defines shared component styles. |
| `frontend/src/api/axios.js` | Configures the `/api` HTTP client, attaches JWTs, and clears expired sessions after unauthorized responses. |
| `frontend/src/context/AuthContext.jsx` | Manages the signed-in user, token persistence, profile refresh, login, registration, and logout. |
| `frontend/src/components/Navbar.jsx` | Provides application navigation, dashboard logo link, theme selector, and logout action. |
| `frontend/src/components/ProtectedRoute.jsx` | Redirects users who are not signed in to the login page. |
| `frontend/src/components/ReadinessScore.jsx` | Renders the circular readiness score indicator. |
| `frontend/src/components/ProgressChart.jsx` | Renders the DSA topic progress chart with Recharts. |
| `frontend/src/pages/` | Contains the login, registration, dashboard, DSA, quiz, resume, interview, and profile screens. |
| `frontend/vite.config.js` | Configures the Vite development server and proxies `/api` requests to the backend at port 5000. |
| `frontend/tailwind.config.js` | Configures Tailwind content scanning and theme-aware colors. |
| `frontend/postcss.config.js` | Enables Tailwind CSS and Autoprefixer in the stylesheet build. |
| `frontend/index.html` | Browser document entry point used by Vite. |

## Requirements

- Node.js 18 or newer and npm.
- MongoDB running locally or a MongoDB Atlas connection string.
- Optional: an OpenAI or Google Gemini API key for live AI responses. The
  default mock provider works without external AI keys.

## Getting started

### 1. Configure the backend

In a terminal, change to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a local environment file by copying the example:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

- `MONGO_URI` to your MongoDB connection string.
- `JWT_SECRET` to a long, private random value.

The example configuration uses a local database at
`mongodb://127.0.0.1:27017/preppilot` and the offline `mock` AI provider.

### 2. (Optional) Seed starter quizzes

From the `backend` directory:

```bash
npm run seed
```

**Warning:** this command deletes all existing documents in the `Quiz`
collection before inserting three starter quizzes. Do not run it against a
database whose quiz data you need to keep.

### 3. Start the backend

Keep MongoDB running, then start the API from `backend`:

```bash
npm run dev
```

The API starts at `http://localhost:5000`. Its health endpoint is
`http://localhost:5000/api/health`.

For a non-watch process, use `npm start` instead.

### 4. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Create an account or log in to use the protected
application pages. During development, Vite forwards `/api` requests to
`http://localhost:5000`.

### Production frontend build

From `frontend`:

```bash
npm run build
npm run preview
```

The generated production files are written to `frontend/dist`.

## Environment configuration

The backend reads settings from `backend/.env`. Never commit real credentials
or API keys.

| Variable | Purpose | Example/default |
|---|---|---|
| `PORT` | Express API port | `5000` |
| `NODE_ENV` | Runtime mode; request logging is disabled when set to `test` | `development` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/preppilot` |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens | Set a private random value |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `AI_PROVIDER` | AI implementation: `mock`, `openai`, or `gemini` | `mock` |
| `OPENAI_API_KEY` | OpenAI credential when using the OpenAI provider | Empty |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4o-mini` |
| `GEMINI_API_KEY` | Google Gemini credential when using Gemini | Empty |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `CLIENT_URL` | Allowed browser origin for CORS | `http://localhost:5173` |

Frontend API calls use a relative `/api` base URL. In local development, the
Vite proxy target is configured in `frontend/vite.config.js`.

## Application guide

1. Register with your name, email, and password. College, branch, graduation
   year, and target role are optional profile information.
2. Navigate using the desktop or mobile navigation links. Selecting the
   PrepPilot logo returns to the dashboard.
3. Use **Color theme** to select Light, Dark, or Warm. The preference is stored
   in browser `localStorage` under `preppilot_theme`.
4. Record practice in the DSA tracker, take quizzes, analyze a resume, and
   submit mock interview answers. These activities feed into the dashboard.
5. Update your personal details on the Profile page. Passwords are not exposed
   in API profile responses.

### Authentication behavior

- Registration and login return a JWT and a safe user profile.
- The frontend stores the token and profile in browser `localStorage`.
- API requests include the token as a bearer authorization header.
- On application startup, the frontend refreshes the profile with
  `GET /api/auth/me`.
- Logging out removes the stored token and profile from the current browser.

## API reference

All endpoints are prefixed with `/api`. Except for health, registration, and
login, endpoints below require an `Authorization: Bearer <token>` header.
Responses use JSON unless the endpoint accepts a multipart file upload.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | API health status. |
| `POST` | `/auth/register` | Public | Create a user account and initial DSA progress record. |
| `POST` | `/auth/login` | Public | Authenticate with email and password. |
| `GET` | `/auth/me` | Signed in | Get the current user's profile. |
| `PUT` | `/auth/me` | Signed in | Update the current user's profile. |
| `GET` | `/dashboard` | Signed in | Get readiness pillars, activity counts, latest resume analysis, and roadmap. |
| `GET` | `/dsa` | Signed in | Get DSA progress, topic breakdown, goals, and score. |
| `POST` | `/dsa/solve` | Signed in | Add a solved problem. |
| `DELETE` | `/dsa/:problemId` | Signed in | Remove a solved problem by its ID. |
| `PUT` | `/dsa/goals` | Signed in | Set DSA topic goals. |
| `GET` | `/quizzes` | Signed in | List quizzes; supports `category` and `difficulty` query filters. |
| `GET` | `/quizzes/history/me` | Signed in | Get the current user's quiz history. |
| `GET` | `/quizzes/:id` | Signed in | Get quiz content for an attempt. |
| `POST` | `/quizzes/:id/submit` | Signed in | Submit answers and record a quiz result. |
| `POST` | `/resume/analyze` | Signed in | Analyze an uploaded PDF or plain-text resume. Send multipart form data with the file field named `resume`; maximum file size is 5 MB. |
| `GET` | `/resume/history` | Signed in | List the current user's resume analyses. |
| `GET` | `/resume/:id` | Signed in | Get one of the current user's resume analyses. |
| `GET` | `/interview/questions` | Signed in | Get interview questions; supports a `type` query parameter (`Technical`, `HR`, or `Behavioral`). |
| `GET` | `/interview/history` | Signed in | Get the current user's interview history. |
| `POST` | `/interview/attempt` | Signed in | Submit an interview attempt for answer grading and save feedback. |

The backend applies security headers, CORS, JSON request-size limits, request
logging outside test mode, and a rate limit of 300 API requests per 15 minutes
per client.

## How the dashboard score works

The dashboard combines four scores into a rounded readiness score:

```text
readiness = DSA score × 0.30
          + average quiz score × 0.25
          + latest resume ATS score × 0.20
          + average interview score × 0.25
```

The DSA score factors in the difficulty of solved problems and total problem
volume (up to 150 problems for the volume component). The dashboard uses up to
20 recent quiz results and up to 10 recent interview attempts when computing
the corresponding averages. Resume readiness uses the latest resume analysis.

## AI providers

Resume analysis, interview answer grading, and roadmap generation are exposed
through `backend/services/aiService.js`. The API keys remain on the backend.

- **`mock`** — default; no network AI request is made. Resume scoring uses the
  deterministic ATS scorer, interview grading uses a lightweight heuristic,
  and roadmap generation uses a rule-based template.
- **`openai`** — configure `OPENAI_API_KEY`; optionally set `OPENAI_MODEL`.
- **`gemini`** — configure `GEMINI_API_KEY`; optionally set `GEMINI_MODEL`.

When a configured live provider call fails, the service logs the failure and
falls back to the corresponding heuristic implementation.

## Security and data notes

- Passwords are hashed with bcrypt before being saved and are excluded from
  normal user queries and safe API responses.
- Use a strong, unique `JWT_SECRET` outside local development.
- Resume uploads are limited to PDF and plain text and capped at 5 MB. Uploads
  are held in memory while parsed; extracted resume text and analysis are saved
  to MongoDB for the user's history.
- Quiz seeding is destructive to existing quiz documents; see the warning
  before running `npm run seed`.
- Use HTTPS, production CORS settings, protected environment variables, and
  managed storage/database backups before deploying with real user data.

## Available scripts

Run each command from the indicated package directory.

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with Nodemon file watching. |
| `npm start` | Start the API with Node.js. |
| `npm run seed` | Delete existing quizzes and insert the three starter quizzes. |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server on port 5173. |
| `npm run build` | Build the production frontend into `dist/`. |
| `npm run preview` | Serve the production build locally for preview. |

## Troubleshooting

- **MongoDB connection fails:** Confirm MongoDB is running and `MONGO_URI` in
  `backend/.env` points to the correct instance.
- **Port is already in use:** Stop the existing process using port 5000 or 5173,
  or adjust the backend port and Vite configuration consistently.
- **Frontend API requests fail:** Start the backend and frontend, then verify
  that the Vite `/api` proxy target matches the backend host and port.
- **Authentication fails after changing the JWT secret:** Existing tokens are
  signed with the previous secret; log in again after the backend restarts.
- **Live AI falls back to mock results:** Check the selected `AI_PROVIDER`, its
  API key, model setting, and backend logs.
- **Quiz list is empty:** Seed the development database only if it is safe to
  replace the existing quiz collection.
