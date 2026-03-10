# AI Agents & Usage Documentation

## Development AI Agent: Claude Code

This project was developed with Claude Code (Anthropic's CLI tool for AI-assisted development).

### How Claude Code Was Used

1. **Architecture Design**: Designed the full-stack architecture (FastAPI + React + Docker) based on project requirements and competitive research.

2. **Market Research**: Researched existing AI marketing tools (Jasper, Copy.ai, Writesonic, Meta AI Sandbox, LearnPrompting.org) to identify gaps and design a differentiated learning-focused product.

3. **Backend Implementation**: Generated all FastAPI endpoints, SQLAlchemy models, Pydantic schemas, and the Claude API integration service.

4. **Frontend Implementation**: Built the React application with shadcn/ui components, routing, API client, and all 6 pages (Home, Playground, Activities, Activity Detail, Compare, History).

5. **Guided Activities Design**: Designed 8 marketing-focused guided activities with expert-level system prompts, instructions, tips, and example inputs — drawing from marketing education best practices.

6. **Docker Configuration**: Created multi-stage Docker builds and docker-compose setup for one-command deployment.

7. **Documentation**: Generated README, CLAUDE.md, AGENTS.md, and project prompts documentation.

## Application AI Agent: Multi-Model via OpenRouter

The application uses the OpenRouter API (`OPENROUTER_API_KEY`) to access multiple AI models for content generation. OpenRouter acts as a unified gateway, supporting models from Anthropic (Claude), OpenAI (GPT-4), Google (Gemini), Mistral, Meta (Llama), and more — all through a single API key.

### Agent Capabilities

The AI agent in this application can:

- **Generate Marketing Content**: Social media posts, email campaigns, ad copy, blog content
- **Adopt Marketing Roles**: Brand strategist, copywriter, social media manager, SEO specialist
- **Follow Brand Guidelines**: Takes system prompts that define brand voice and tone
- **Optimize Content**: SEO optimization, content repurposing, A/B variations
- **Build Personas**: Create detailed customer personas from market data
- **Compare Approaches**: Generate two responses for A/B prompt testing

### System Prompt Architecture

Each guided activity uses a specialized system prompt that instructs the selected model to behave as a domain expert:

| Activity | AI Role |
|----------|---------|
| Social Media Generator | Expert social media marketing strategist |
| Email Campaign Builder | Expert email marketing copywriter |
| Ad Copy Workshop | Performance marketing specialist |
| Brand Voice Lab | Brand strategist and copywriter |
| Content Repurposer | Content strategist for multi-channel distribution |
| Customer Persona Generator | Market research expert in buyer personas |
| SEO Content Optimizer | SEO content specialist |
| Prompt A/B Tester | General marketing assistant (neutral for comparison) |

### Temperature Configuration

Users can adjust the AI's creativity level:
- **0.0 - 0.3**: Precise, consistent, fact-focused outputs
- **0.4 - 0.7**: Balanced creativity and consistency (default: 0.7)
- **0.8 - 1.0**: Highly creative, varied, experimental outputs

This teaches marketers how AI parameters affect content generation.

### Model Selection

Users can select from any model available via OpenRouter. The model is passed per-request, allowing comparison across providers within the same activity.
