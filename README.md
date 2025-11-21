<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# gnidoC terceS - Multi-AI Orchestration Engine

**gnidoC terceS** (read it backward 😉) is a next-generation multi-AI orchestration engine that turns raw ideas into complete, production-ready applications.

[![CI/CD Pipeline](https://github.com/dobleduche/gnidoctercesv1/actions/workflows/ci.yml/badge.svg)](https://github.com/dobleduche/gnidoctercesv1/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 🚀 Features

- **Multi-AI Provider Support**: Integrates with Gemini, OpenAI, Anthropic, DeepSeek, and XAI
- **Queue-Based Build System**: Powered by BullMQ and Redis for reliable background processing
- **Full-Stack Architecture**: Express backend + React/Vite frontend
- **Production Ready**: Includes security middleware, rate limiting, and Docker support
- **Type-Safe**: Built with TypeScript for enhanced developer experience

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v10 or higher)
- **Redis** (for queue management)
- **Git**

Optional but recommended:

- **Docker** (for containerized deployment)
- **Docker Compose** (for local Redis setup)

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/dobleduche/gnidoctercesv1.git
cd gnidoctercesv1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys and configuration. See [Environment Configuration](#environment-configuration) for details.

### 4. Start Redis (if not already running)

Using Docker:

```bash
docker run -d -p 6379:6379 redis:alpine
```

Or using Docker Compose, create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
```

Then run:

```bash
docker-compose up -d
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
APP_BASE_URL=http://localhost:5173

# AI Provider API Keys (at least one required)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
XAI_API_KEY=your_xai_api_key_here

# Database & Cache
REDIS_URL=redis://localhost:6379
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_secure_random_string_here

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_PRO=price_xxx_pro
STRIPE_PRICE_PREMIUM=price_xxx_premium
STRIPE_PRICE_ULT=price_xxx_ultimate
```

**Important**:

- Never commit `.env` files to version control
- Use strong, unique values for secrets in production
- Reference `.env.example` for the complete list of variables

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This starts:

- Frontend dev server on http://localhost:5173
- Backend API server on http://localhost:3001

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

Tests are written using Vitest and React Testing Library. Test files are located in the `tests/` directory.

## Code Quality

### Linting

Check for code issues:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

### Formatting

Check code formatting:

```bash
npm run format:check
```

Auto-format code:

```bash
npm run format
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Building for Production

### Build the application

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### Preview production build locally

```bash
npm run preview
```

### Run production server

```bash
npm run start
```

Make sure to:

1. Set `NODE_ENV=production` in your environment
2. Configure all required environment variables
3. Have Redis running and accessible

## Deployment

### Docker Deployment

#### Build Docker image

```bash
docker build -t gnidoc-terces:latest .
```

#### Run container

```bash
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name gnidoc-terces \
  gnidoc-terces:latest
```

### Platform-Specific Deployment

#### Render

1. Connect your GitHub repository
2. Configure environment variables from `.env.example`
3. Use the included `render.yaml` configuration
4. Deploy!

#### Fly.io

```bash
# Install fly CLI
curl -L https://fly.io/install.sh | sh

# Login and initialize
fly auth login
fly launch

# Set secrets
fly secrets set GEMINI_API_KEY=your_key
# ... set other secrets

# Deploy
fly deploy
```

#### Vercel (Frontend) + Railway/Render (Backend)

Deploy frontend to Vercel:

```bash
npm install -g vercel
vercel
```

Deploy backend separately to Railway or Render with the Docker configuration.

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Lints** the codebase
2. **Runs tests** to ensure quality
3. **Builds** the application
4. **Creates Docker image** on main branch
5. **Deploys** (configure for your platform)

Required GitHub Secrets:

- `DEPLOY_TOKEN` or platform-specific credentials
- All environment variables from `.env.example`

## Project Structure

```
gnidoctercesv1/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── server/
│   ├── index.ts                # Express server entry
│   ├── queue.ts                # BullMQ configuration
│   ├── orchestrator.ts         # AI orchestration logic
│   ├── routes/                 # API routes
│   └── lib/                    # Shared utilities
├── components/                 # React components
├── hooks/                      # Custom React hooks
├── state/                      # State management
├── tests/                      # Test files
├── public/                     # Static assets
├── dist/                       # Production build output
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── Dockerfile                  # Docker configuration
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## API Endpoints

### Health & Status

- `GET /api/health` - Health check
- `GET /api/key-status` - Check configured AI providers

### Build Management

- `POST /api/builds` - Create new build job
- `GET /api/builds/:id/status` - Get build status
- `GET /api/builds/:id` - Get build result
- `GET /api/builds/:id/preview` - Preview generated app

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents abuse (100 requests/15 min in production)
- **CORS**: Configurable origin restrictions
- **Environment Variables**: Sensitive data isolation
- **Input Validation**: Request payload limits

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Or with Docker
docker ps | grep redis
```

### Port Already in Use

Change the port in `.env`:

```env
PORT=3002
```

### Build Errors

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- Tests pass: `npm test`
- Code is linted: `npm run lint`
- Code is formatted: `npm run format`
- Build succeeds: `npm run build`

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report Issues](https://github.com/dobleduche/gnidoctercesv1/issues)
- 📧 Contact: Intruvurt Labs
- 🌐 Website: [AI Studio](https://ai.studio)

---

Built with ❤️ by Intruvurt Labs
