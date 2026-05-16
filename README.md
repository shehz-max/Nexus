# Nexus - SaaS Workflow Automation Platform

A modern, production-ready workflow automation platform - a simpler, more affordable alternative to Zapier.

![Nexus](https://via.placeholder.com/1200x600/0f172a/34d399?text=Nexus+Workflow+Automation)

## Features

- **Visual Workflow Builder** - Drag-and-drop interface for creating automations
- **Multiple Integrations** - Google Sheets, Gmail, Slack, Notion, HubSpot
- **Real-time Monitoring** - Track workflow runs and performance
- **Secure Authentication** - JWT-based auth with secure session management
- **Modern UI** - Dark theme with emerald accents, responsive design

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Fastify, Prisma ORM, PostgreSQL
- **Deployment:** Vercel (Frontend + Serverless API)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nexus.git
cd nexus

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Set up database
npm run db:push

# Start development servers
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
nexus/
├── src/                    # Backend (Fastify)
│   ├── routes/            # API routes
│   ├── lib/               # Prisma client & utilities
│   ├── plugins/           # Fastify plugins (auth, error handling)
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   └── index.ts          # Server entry point
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Route pages
│   │   ├── store/        # Zustand state management
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # React entry point
│   └── vite.config.ts    # Vite configuration
├── api/                   # Vercel serverless functions
├── prisma/
│   └── schema.prisma     # Database schema
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Scripts

```bash
# Development
npm run dev           # Start both servers concurrently
npm run dev:backend   # Start API server only (port 3000)
npm run dev:frontend  # Start frontend only (port 5173)

# Build
npm run build         # Build for production
npm run build:frontend # Build frontend only

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations

# Deployment
vercel               # Deploy to Vercel (preview)
vercel --prod        # Deploy to production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out

### Integrations
- `GET /api/integrations` - List all integrations
- `GET /api/integrations/:id` - Get integration details

### Workflows
- `GET /api/workflows` - List user's workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PATCH /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/enable` - Enable workflow
- `POST /api/workflows/:id/disable` - Disable workflow

### Runs
- `GET /api/runs` - List workflow runs
- `GET /api/runs/:id` - Get run details
- `POST /api/runs/:id/retry` - Retry failed run
- `GET /api/runs/stats` - Get run statistics

## Environment Variables

See `.env.example` for all available variables.

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically detect and build both the frontend and serverless API functions.

## License

MIT