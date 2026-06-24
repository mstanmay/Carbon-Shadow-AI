# Carbon Shadow AI & Questly SaaS

A complete production-ready, AI-powered decision intelligence application that predicts the environmental impact of future user decisions before they are created. 

It implements the premium **Questly** landing page and connects it to a powerful, dark-themed **Carbon Shadow** console powered by a FastAPI/PostgreSQL backend and an 8-agent LangGraph workflow.

---

## 🌟 Key Features
- **Questly SaaS Landing Hero**: Beautiful, custom-animated landing page featuring the custom SVG logo, responsive layout links, search forms, and a scaled browser mockup.
- **8-Agent LangGraph Pipeline**: Sequential multi-agent workflow analyzing intent, carbon simulation, alternatives, debating tradeoffs, judging scores, forecasting future twin trends, calculating 100x recurrence regret, and generating choice recommendations.
- **Carbon Shadow Time Machine™**: Timeline simulator evaluating choices ("What if I buy an electric scooter?") against a visual 1-year timeline path.
- **Carbon Shadow Copilot™**: Proactive suggestion deck pushing optimization alerts based on user schedules or alerts.
- **Audited Security Hardening**: Strict Content Security Policy (CSP), JWT Auth with Refresh tokens, rate limiting, and SQL database audit trails logging actions.

---

## 🛠️ Tech Stack
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS 3, Zustand, Recharts, Lucide React.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, LangGraph, LangChain, Pytest.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions.

---

## 📂 Project Structure
```
├── src/
│   ├── components/
│   │   ├── Logo.tsx               # Custom SVG Logo
│   │   ├── Navbar.tsx             # Responsive nav bar with dropdowns
│   │   ├── Hero.tsx               # Main hero backdrop & grass overlay
│   │   ├── ScaledDashboard.tsx    # Mockup dynamic scaling wrapper
│   │   ├── DashboardMockup.tsx    # CareNest browser chrome mockup
│   │   ├── CarbonDashboard.tsx    # Sleek dark-mode dashboard shell
│   │   ├── AIAssistant.tsx        # conversational workflow & agent logs
│   │   ├── TimeMachine.tsx        # Time warp timeline comparator
│   │   ├── AnalyticsView.tsx      # Recharts trend and category splits
│   │   └── SettingsView.tsx       # Profile parameters & security audit list
│   └── stores/
│       └── carbonStore.ts         # Zustand global state manager
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                # FastAPI server entrypoint
│       ├── core/                  # DB, security, and Pydantic configs
│       ├── models/                # SQLAlchemy database models
│       ├── schemas/               # Pydantic validation schemas
│       ├── api/                   # Router endpoints (auth, simulations)
│       ├── agents/                # 8-agent LangGraph workflow
│       └── tests/                 # automated unit test suite
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

---

## 🚀 Setup & Execution

### 1. Locally

#### Requirements:
- Node.js v20+
- Python 3.11+

#### Backend:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root based on `.env.example`:
   ```bash
   # In root
   copy .env.example .env
   ```
5. Run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API docs will be active at `http://localhost:8000/api/v1/docs`.

#### Frontend:
1. Install node modules:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### 2. Docker Compose (Recommended)

1. Launch the entire stack (PostgreSQL database, FastAPI backend, and React frontend):
   ```bash
   docker-compose up --build
   ```
2. Access the applications:
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/api/v1/docs`

---

## 🧪 Running Tests

### Backend Tests:
To run the full suite of backend tests (covering API routers, authentication flow, rate-limiting rules, database inputs validation, and wallet integrations):
```bash
# On Windows PowerShell:
$env:TESTING="true"; $env:PYTHONPATH="backend"
python -m pytest backend/app/tests -v --tb=short

# On macOS/Linux:
TESTING=true PYTHONPATH=backend python -m pytest backend/app/tests -v --tb=short
```

### Frontend Tests:
To run the full suite of React/TypeScript frontend tests (covering state store managers, theme/language providers, and component/accessibility tab traversal assertions):
```bash
npx vitest run
```

### Frontend Builds:
Verify TypeScript compilation and Vite build bundles:
```bash
npm run build
```

