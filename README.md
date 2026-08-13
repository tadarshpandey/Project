# WasteTrack — Civic Waste Reporting & Tracking Platform (MVP)

**WasteTrack** is a clean, modern, and production-minded web application enabling citizens and students to report street waste and illegal garbage dumping with photo uploads, GPS coordinates, and real-time civic cleanup tracking.

---

## 1. Problem & MVP Solution

* **Problem**: Garbage and waste dumped in public areas, roadsides, and college perimeters often go unmonitored and untracked due to the lack of a transparent reporting mechanism.
* **MVP Solution**: Citizens capture a photo, pinpoint their location (via GPS or manual pin), and submit a report. The community and civic authorities can view reported incidents on an interactive map and manage the lifecycle status from **`REPORTED`** $\rightarrow$ **`IN_PROGRESS`** $\rightarrow$ **`RESOLVED`**.

---

## 2. Technology Stack

### Backend
* **Python 3.13+**
* **Django 5.0+**
* **Django REST Framework (DRF)**
* **django-cors-headers** (CORS management)
* **Pillow** (Image processing & validation)
* **dj-database-url / psycopg2-binary** (PostgreSQL integration with SQLite3 zero-config fallback)
* **Gunicorn & WhiteNoise** (Production WSGI server & static asset handling)

### Frontend
* **React 18**
* **Vite** (Next-generation frontend tooling)
* **React Router v6**
* **Axios** (Centralized API client)
* **Leaflet & OpenStreetMap** (Interactive mapping without paid API keys)
* **Lucide React** (Modern civic UI icons)
* **Canvas-Confetti** (Micro-interaction for cleanup celebrations)

### Database & Storage
* **Database**: PostgreSQL (with automatic SQLite fallback for local development)
* **Media Storage**: Django media storage (`media/reports/`) structured for future S3/Cloudinary migration

---

## 3. Project Architecture & Deployment Files

```text
wastetrack/
│
├── backend/
│   ├── config/              # Django project settings, root URLs, WSGI/ASGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── reports/             # Waste reporting app (models, views, serializers, tests)
│   ├── media/               # Uploaded waste photographs
│   ├── build.sh             # Render build script (pip install, collectstatic, migrate)
│   ├── Procfile             # Render / Heroku entrypoint (gunicorn)
│   ├── runtime.txt          # Python runtime (python-3.13.1)
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── _redirects       # Netlify SPA redirect rules
│   ├── src/                 # Components, pages, services, styles
│   ├── netlify.toml         # Netlify build & redirect config
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── netlify.toml             # Root Netlify configuration
├── render.yaml              # Render Blueprint (Web service + Managed PostgreSQL)
├── .gitignore
└── README.md
```

---

## 4. REST API Specification

| Method | Endpoint | Description | Payload / Query Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports/` | Create a new waste report | `multipart/form-data`: `image`, `description`, `location_name`, `latitude`, `longitude` |
| `GET` | `/api/reports/` | List all waste reports | Params: `?status=REPORTED`, `?search=phaphamau`, `?ordering=-created_at` |
| `GET` | `/api/reports/<id>/` | Get detailed information for a single report | — |
| `PATCH` | `/api/reports/<id>/` | Update report status | `application/json`: `{"status": "IN_PROGRESS"}` (`REPORTED`, `IN_PROGRESS`, `RESOLVED`) |
| `DELETE`| `/api/reports/<id>/` | Delete a report | — |
| `GET` | `/api/reports/stats/`| Aggregate summary counts for dashboard | Returns `{ total, reported, in_progress, resolved }` |

---

## 5. Local Setup & Installation

### Backend Setup
1. `cd backend`
2. Create and activate venv: `python -m venv venv && .\venv\Scripts\activate` (or `source venv/bin/activate` on Linux/macOS)
3. Install dependencies: `pip install -r requirements.txt`
4. Copy env file: `cp .env.example .env`
5. Run migrations: `python manage.py migrate`
6. Run tests: `python manage.py test reports`
7. Start server: `python manage.py runserver 8000`

### Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Copy env file: `cp .env.example .env`
4. Start dev server: `npm run dev`
5. Open `http://localhost:5173/` in your browser.

---

## 6. Production Deployment

### Option A: Deploying Backend to Render
1. Push your repository to GitHub / GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect this repository — Render will automatically detect [`render.yaml`](file:///d:/BBS/BBS-SIH/Project/render.yaml) and provision:
   - **PostgreSQL Database** (`wastetrack-db`)
   - **Django Web Service** (`wastetrack-backend`) running `./build.sh` and `gunicorn config.wsgi:application`
5. Once deployed, copy your backend URL (e.g. `https://wastetrack-backend.onrender.com`).

### Option B: Deploying Frontend to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** $\rightarrow$ **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect [`netlify.toml`](file:///d:/BBS/BBS-SIH/Project/frontend/netlify.toml):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. In Netlify Site Configuration $\rightarrow$ **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://wastetrack-backend.onrender.com/api` (your Render backend API URL)
6. Click **Deploy Site**.

---

## 7. Recommended Next Development Phases (Version 2+)

* **User Authentication & Profiles**: JWT-based authentication for citizens and role-based access for municipal staff.
* **Waste Categorization**: Tags for Plastic, Organic, Electronic, Hazardous, Construction waste.
* **Municipal Workflow & Assignment**: Assigning reports to specific municipal wards/contractors.
* **Push Notifications & SMS**: Real-time alerts when a reported waste incident is resolved.
* **Cloud Storage**: Seamless transition from local media storage to AWS S3 or Cloudinary.
