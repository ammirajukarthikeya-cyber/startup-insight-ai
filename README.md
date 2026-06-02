# Startup Insight AI - Full-Stack SaaS Platform

**Startup Insight AI** is a startup-grade SaaS web application built to help entrepreneurs validate business ideas, analyze competitors, scan vulnerability risk indices, discover sponsor and investor channels, register for networking events, and consult an AI Startup Mentor co-pilot.

---

## Technical Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite (default for development), JWT sessions, Bcrypt hashing
- **Database**: SQLite (zero-config local db file: `startup_insight.db`) or PostgreSQL (switchable via environment parameters)

---

## Directory Structure
- `frontend/`: The Next.js client application
- `backend/`: The FastAPI REST API service
- `backup-v1/`: Backup of the original HTML mockup files for reference
- `run.bat`: Concurrent local development servers launcher

---

## Setup & Local Run Configurations

### Method 1: Easy Launcher (Windows)
Double-click the **`run.bat`** file in the root directory. It will check your installations and spin up the backend API and Next.js client in separate terminal windows.

### Method 2: Manual Initialization

#### 1. Start Backend API
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the uvicorn API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The database table schemas will automatically initialize, and default seed metrics, plans, events, news, and admin user credentials will be written.*

#### 2. Start Next.js Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Access the web application in your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## Demo Test Credentials & Sandboxes

The database is pre-seeded with verification accounts to simplify local evaluations:

### 1. Developer Administrator Panel Account
- **Email**: `admin@startupinsight.ai`
- **Password**: `adminsecure123`
*Log in with this account to view transaction lists, suspend user accounts, dynamically adjust subscription prices, create discount coupons, or publish tech updates.*

### 2. Standard User Account
- **Email**: `demo@startupinsight.ai`
- **Password**: `demopass123`
*Standard account starts on the "Free" tier. Use this account to test subscription upgrade checkouts or idea analysis constraints.*

### 3. Payment Gateway Sandbox
When upgrading to "Pro" or "Enterprise" plans:
- Select **Credit Card** or **UPI**.
- Enter any credentials (or mock UPI details).
- Clicking **Authorize Sandbox Payment** simulates payment success, generates transaction reports, activates subscription plans in the user profile database, and creates downloadable invoices instantly.
