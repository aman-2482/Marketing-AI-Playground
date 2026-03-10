# GenAI Marketing Lab

A hands-on playground where marketing professionals can practice Generative AI skills through free experimentation and structured guided activities.

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd genai-marketing-lab

# 2. Add your API key
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 3. Run with Docker
docker compose up --build

# 4. Open your browser
# App: http://localhost:3000
# Admin Panel: http://localhost:3000/admin/login
# API Docs: http://localhost:8000/docs
```

## Features

### Free AI Playground
Open-ended prompt interface where marketers can experiment with any marketing task. Includes:
- Customizable AI roles (system prompts) - Brand Strategist, Copywriter, Social Media Manager, etc.
- Temperature/creativity slider to learn how it affects output
- Full prompt history with favorites

### Guided Activities
8 structured exercises with objectives, instructions, tips, and pre-filled examples:

| Activity | What You Practice |
|----------|------------------|
| **Social Media Post Generator** | Platform-specific copy, hashtags, tone control |
| **Email Campaign Builder** | Subject lines, body copy, CTAs, email types |
| **Ad Copy Workshop** | Headlines within character limits, A/B ad variations |
| **Brand Voice Lab** | Defining brand voice, testing consistency across channels |
| **Content Repurposer** | Transforming one piece of content into multiple formats |
| **Customer Persona Generator** | Building detailed buyer personas from market data |
| **SEO Content Optimizer** | Keyword integration, meta descriptions, content structure |
| **Prompt A/B Tester** | Side-by-side prompt comparison to learn prompt engineering |

### Prompt A/B Tester
The most educational feature: compare two prompts side-by-side to see how small changes affect output. Includes pre-built experiments:
- Specificity Test
- Role Test
- Format Test
- Audience Test

### Prompt History
Review past prompts and responses. Favorite the best ones for quick reference.

### Admin Panel
SQLAdmin interface at `/admin` to manage activities and view usage data.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS v4 |
| Backend | FastAPI (Python 3.11) |
| ORM | SQLAlchemy |
| Admin | SQLAdmin |
| AI | OpenRouter API (multi-model) |
| Database | SQLite |
| Container | Docker + Docker Compose |

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # add your API key
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` with API proxied to `http://localhost:8000`.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Settings & env vars
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models.py         # DB models (Activity, PromptHistory)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── ai_service.py     # Claude API integration
│   │   ├── admin.py          # SQLAdmin config
│   │   ├── routers/
│   │   │   ├── playground.py # Free playground + A/B compare
│   │   │   ├── activities.py # Guided activities CRUD + generate
│   │   │   └── history.py    # Prompt history management
│   │   └── seed/
│   │       └── activities.py # 8 guided activities seed data
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # Home, Playground, Activities, Compare, History
│   │   ├── components/       # Layout, MarkdownOutput
│   │   └── lib/              # API client, session, utils
│   ├── Dockerfile
│   └── nginx.conf
├── prompts/                   # AI prompts used to build this project
├── docker-compose.yml
├── .env.example
├── CLAUDE.md                  # Claude Code configuration
├── AGENTS.md                  # AI agent documentation
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/models` | List available AI models |
| POST | `/api/playground/generate` | Free playground generation |
| POST | `/api/playground/compare` | A/B prompt comparison |
| GET | `/api/activities/` | List all guided activities |
| GET | `/api/activities/{slug}` | Get activity details |
| POST | `/api/activities/{slug}/generate` | Generate for an activity |
| GET | `/api/history/` | List prompt history |
| PATCH | `/api/history/{id}/favorite` | Toggle favorite |
| DELETE | `/api/history/{id}` | Delete history entry |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key (required) — get one at [openrouter.ai](https://openrouter.ai) | - |
| `DATABASE_URL` | Database connection string | `sqlite:///./genai_marketing_lab.db` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `ENV` | Environment | `development` |
