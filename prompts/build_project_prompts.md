# Prompts Used to Build GenAI Marketing Lab

These are the high-level product requirement prompts used with Claude Code to create this project.

## Prompt 1: Research & Design

```
You are tasked with creating a playground to teach Marketing People about Generative AI.
They have read a lot of articles, watched videos, completed Coursera/Udemy/LinkedIn Learning
courses, but they lack the practical component. They are eager to get their hands dirty and
practice everything they've read about!

Research similar products on the internet and help me design the best approach.
The playground should allow users to "free roam" and try GenAI skills, but also should have
guided activities.

Technical Requirements:
- Backend: FastAPI with SQLAlchemy and SQLAdmin
- Frontend: React + shadcn/ui + tailwind CSS
- Docker Compose for easy setup
```

## Prompt 2: Architecture & Implementation

```
Build the GenAI Marketing Lab with:

1. Free AI Playground - open-ended prompt interface with system prompt customization,
   temperature control, and prompt history

2. Guided Activities (6-8 exercises):
   - Social Media Post Generator
   - Email Campaign Builder
   - Ad Copy Workshop
   - Brand Voice Lab
   - Content Repurposer
   - Customer Persona Generator
   - SEO Content Optimizer
   - Prompt A/B Tester

3. Each activity needs: objective, instructions, pre-filled examples, tips, output area

4. Prompt A/B Comparison Tool - side-by-side prompt comparison for learning

5. Prompt History & Favorites

6. Admin Panel via SQLAdmin

Tech: FastAPI + SQLAlchemy + SQLAdmin backend, React + shadcn/ui + Tailwind frontend,
Docker Compose, OpenRouter API (multi-model: Claude/GPT/Gemini/Mistral/etc.)
```

## Prompt 3: Backend Implementation

```
Create the FastAPI backend with:
- SQLAlchemy models for activities and prompt_history
- Pydantic schemas for request/response validation
- AI service module wrapping OpenRouter chat completions API with model whitelist
- Router for free playground (POST /api/playground/generate)
- Router for guided activities (GET /api/activities, POST /api/activities/{slug}/generate)
- Router for history (GET /api/history, PATCH favorite, DELETE entry)
- Router for auth (register/login/me)
- SQLAdmin for database management
- Seed data for all guided activities
- Error handling, CORS, environment variables
```

## Prompt 4: Frontend Implementation

```
Create the React frontend with:
- Home page with activity cards and welcome section
- Free Playground page with prompt input, system prompt config, temperature slider
- Guided Activities listing page
- Individual Activity page with instructions, tips, form inputs, output display
- Prompt A/B Comparison page
- History page showing past prompts and responses
- Use shadcn/ui components and Tailwind CSS
- Clean, modern, minimal UI following KISS principle
```

## Prompt 5: Docker & DevOps

```
Create Docker setup:
- Backend Dockerfile (Python 3.11)
- Frontend Dockerfile (Node 22, multi-stage build)
- docker-compose.yml running both services
- Nginx config to serve frontend and proxy API
- .env.example with all required variables
- Should work with: docker compose up
```

## Prompt 6: Authentication

```
Add simple user authentication for the learning app:
- Create register and login endpoints
- Store users and issued tokens in the database
- Add a /api/auth/me endpoint to validate bearer tokens
- Use secure password hashing and timing-safe comparisons
- Protect frontend app routes with client-side auth checks
- Keep admin panel auth separate from app-user auth
```

## Prompt 7: Testing & Validation

```
Add backend automated tests and test configuration:
- Add pytest tests for core meta endpoints (/api/health and /api/models)
- Add pytest.ini to define testpaths and asyncio fixture loop scope
- Ensure tests run successfully in Docker with:
   docker compose run --rm backend pytest
- Document test commands in project docs for both Docker and local PowerShell usage
```
