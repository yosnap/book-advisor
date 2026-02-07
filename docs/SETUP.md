# Local Development Setup Guide

## Quick Start (< 10 minutes)

### 1. Prerequisites

- Node.js 22+ ([download](https://nodejs.org))
- npm or pnpm
- Git
- PostgreSQL client (optional, for direct DB access)

Verify installation:
```bash
node --version  # v22.x.x or higher
npm --version   # 10.x.x or higher
git --version   # 2.x.x or higher
```

### 2. Clone Repository

```bash
git clone <repository-url> book-advisor
cd book-advisor
npm install
```

### 3. Setup Environment Variables

Copy the example file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Node environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# API Keys (optional for development)
ANTHROPIC_API_KEY=sk-your-key
N8N_API_KEY=your-key
TELEGRAM_BOT_TOKEN=your-token
```

To get DATABASE_URL and DIRECT_URL:
1. Create account at [Neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

### 4. Setup Database

Create database schema:
```bash
npm run db:migrate
```

(Optional) Seed with sample data:
```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Access at: http://localhost:3000

### 6. Verify Installation

1. Open http://localhost:3000 in browser
2. You should see the home page with the recommendation form
3. Check API: http://localhost:3000/api/v1/books

### 7. (Optional) Prisma Studio

View and edit database in GUI:
```bash
npm run db:studio
```

Opens at http://localhost:5555

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` | Check DATABASE_URL is correct |
| `SyntaxError in .env` | Remove quotes around URLs |
| Port 3000 in use | `lsof -i :3000` then kill process |
| Dependencies error | Delete `node_modules`, run `npm install` again |
| Database migration fails | Check DATABASE_URL format and connection |

---

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| DATABASE_URL | Yes | postgresql://user:pass@host/db |
| DIRECT_URL | Yes | postgresql://user:pass@host/db |
| NODE_ENV | No | development |
| NEXT_PUBLIC_API_URL | No | http://localhost:3000 |
| ANTHROPIC_API_KEY | No (production yes) | sk-... |

---

## Available npm Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

# Testing
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # End-to-end tests

# Database
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema changes
npm run prisma:seed      # Seed database
```

---

## Project Structure

```
book-advisor/
├── app/                      # Next.js app directory
│   ├── api/v1/              # API endpoints
│   │   ├── recommendations/
│   │   ├── books/
│   │   └── context/
│   ├── admin/               # Admin pages
│   ├── page.tsx             # Home page
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── Modal.tsx
├── lib/                     # Utilities & helpers
│   ├── db.ts                # Prisma client
│   ├── validation.ts        # Zod schemas
│   ├── errors.ts            # Error handling
│   └── orchestrator.ts      # Recommendation logic
├── prisma/                  # Database
│   └── schema.prisma        # Database schema
├── docs/                    # Documentation
├── tests/                   # Tests
└── public/                  # Static assets
```

---

## API Quick Start

### Get Books
```bash
curl "http://localhost:3000/api/v1/books?limit=10"
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "mood": "reflexivo",
      "profile": "intermedio",
      "interests": ["ficción", "desarrollo personal"],
      "intent": "aprendizaje"
    }
  }'
```

### Save Context
```bash
curl -X POST http://localhost:3000/api/v1/context \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "context": {
      "mood": "reflexivo",
      "profile": "intermedio",
      "interests": ["ficción"],
      "intent": "aprendizaje"
    }
  }'
```

---

## Tips & Tricks

### Debug Mode
Enable verbose logging:
```bash
DEBUG=prisma:* npm run dev
```

### Inspect Database with GUI
```bash
npm run db:studio
# Opens Prisma Studio at localhost:5555
```

### Format & Lint Before Commit
```bash
npm run lint
npm run format
npm run type-check
```

### Hot Reload
Next.js automatically reloads on file changes. Just edit and save!

---

## Troubleshooting

### "Cannot find module '@/components'"
Path aliases are configured in tsconfig.json. Try:
```bash
rm -rf .next
npm run dev
```

### "Database connection failed"
1. Check DATABASE_URL format
2. Verify Neon project is active
3. Check network connectivity

### "Port 3000 already in use"
Kill the existing process:
```bash
lsof -i :3000
kill -9 <PID>
```

---

**Setup Time**: 5-10 minutes
**Last Updated**: February 7, 2026
