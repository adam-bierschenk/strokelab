# StrokeLab

Personal Golf Statistics Dashboard — Track, analyze, and share golf performance data.

## Tagline
"Track. Analyze. Improve."

## Overview

StrokeLab is a responsive web application for serious golfers to track, analyze, and share their performance data. Built for mobile-first score entry on the course with rich desktop analytics.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Vercel Postgres + Prisma ORM
- NextAuth.js

## Features

### MVP (Phase 1)
- User authentication (GitHub/Google OAuth)
- Course database with White Eagle seed data
- Mobile-first round entry (score, putts)
- Round history and list view
- Simple dashboard with basic stats

### Phase 2
- Fairway/GIR/putts detailed tracking
- Charts and analytics
- Goals feature
- Coach sharing
- PWA offline mode
- Photo uploads

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Auto-deploys to Vercel on push to `main`.

## Project

- **AgentDeck:** [StrokeLab Project](http://localhost:5174)
- **GitHub:** https://github.com/adam-bierschenk/strokelab

For full project specification, see `memory/Projects/StrokeLab/PROJECT.md`.
