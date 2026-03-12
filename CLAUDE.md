# GenAI Marketing Lab - Claude Code Configuration

## Project Overview
GenAI Marketing Lab is a hands-on playground where marketing professionals can practice Generative AI skills through free experimentation and structured guided activities.

## Tech Stack
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy + SQLAdmin
- **Frontend**: React 19 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **AI**: OpenRouter API (multi-model support — Claude, GPT-4, Gemini, Mistral, and more)
- **Database**: SQLite (dev) / PostgreSQL (prod-ready)
- **Containerization**: Docker + Docker Compose

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── ai_service.py    # OpenRouter multi-model integration
│   │   ├── admin.py         # SQLAdmin configuration
│   │   ├── routers/
│   │   │   ├── playground.py    # Free playground endpoints
│   │   │   ├── activities.py    # Guided activities endpoints
│   │   │   ├── history.py       # Prompt history endpoints
│   │   │   └── auth.py          # Auth endpoints
│   │   └── seed/
│   │       └── activities.py    # Seed data for guided activities
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── pytest.ini
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── lib/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
└── prompts/
```

## Development Commands
- Backend: `cd backend && uvicorn app.main:app --reload --port 8000`
- Frontend: `cd frontend && npm run dev`
- Docker: `docker compose up --build`
- Tests: `cd backend && pytest`

## Key Conventions
- Backend API is served at `/api/` prefix
- Frontend proxies API requests to backend
- All AI calls go through `ai_service.py`
- Guided activities are seeded from `seed/activities.py`
- Use Pydantic for request/response validation
- Use SQLAlchemy ORM for all database operations

## Environment Variables
- `OPENROUTER_API_KEY` - Required for AI features; provides access to multiple models (Claude, GPT-4, Gemini, Mistral, etc.) via OpenRouter
- `DATABASE_URL` - Database connection string (defaults to SQLite)
- `CORS_ORIGINS` - Allowed CORS origins (defaults to localhost:5173)

## AI Usage Documentation
This project was developed with extensive assistance from Claude Code (Anthropic's CLI tool).

Claude was used for:
- Architecture design and project structure
- Backend API implementation (FastAPI + SQLAlchemy)
- Frontend scaffolding (React + shadcn/ui)
- Prompt engineering for marketing activities
- Docker configuration
- Test writing
- Documentation

The prompts used to build this project are documented in the `prompts/` directory.
