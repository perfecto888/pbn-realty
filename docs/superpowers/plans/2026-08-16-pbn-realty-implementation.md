# PBN Realty Deal Analysis Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered commercial real estate deal recommendation engine with daily top-5 suggestions, property tracking, and investor management dashboard using next-gen design.

**Architecture:** Next.js frontend + Node.js API routes, Python data workers (scraping, scoring, market analysis), PostgreSQL database, Claude AI for market narratives, nightly data ingestion pipeline.

**Tech Stack:** Next.js 14+, TypeScript, PostgreSQL (Vercel Postgres), Drizzle ORM, Python 3.11+, BeautifulSoup (scraping), Claude API, News API, Tailwind CSS + custom design tokens, Vercel deployment.

## Global Constraints

- Design system: Dark mode (#0A0E27 base), electric cyan (#00D9FF) accents, glassmorphism effects, smooth animations (200ms transitions)
- Database: PostgreSQL with Drizzle ORM (type-safe queries)
- Scoring weights: Deal Quality 40%, Market 25%, Tenant Demand 20%, Entitlement 15%
- Target IRR: 15%+ for deal recommendations
- Hold period: 1-5 years (default 3 for estimates)
- Data sources: Redfin (primary), broker emails, public MLS, news/economic APIs
- Deployment: Vercel (frontend), cron job for nightly scraping (EasyCron or similar)
- Solo user initially (multi-user LP portal in Phase 2)

---

## Phase 1: MVP (Weeks 1-4)

### Task 1: Project Setup & Infrastructure
Create Next.js project, environment config, Vercel setup.
**Files:** package.json, .env.local, vercel.json, tsconfig.json
**Commits:** 1 (project initialization)

### Task 2: Database Schema & Drizzle ORM Setup
Define PostgreSQL schema, Drizzle ORM configuration.
**Files:** src/lib/schema.ts, src/lib/db.ts, migrations/0001_init.sql
**Commits:** 1 (schema setup)

### Task 3: Design System & Component Library
Implement Tesla/SpaceX design tokens and core components.
**Files:** src/styles/design-tokens.css, Button, Card, Badge, Metric components
**Commits:** 1 (design system)

### Task 4: API Routes Setup (Properties & Recommendations)
Build REST endpoints for properties and daily recommendations.
**Files:** src/app/api/properties/*, src/app/api/recommendations/*, src/lib/types.ts
**Commits:** 1 (API routes)

### Task 5: Redfin Scraper (Python Worker)
Implement Python scraper for Redfin Commercial listings.
**Files:** workers/scraper.py, workers/requirements.txt, workers/config.py
**Commits:** 1 (scraper)

### Task 6: Deal Scoring Algorithm
Implement 40/25/20/15 scoring framework and IRR estimation.
**Files:** workers/deal_scorer.py, src/lib/scoring.ts
**Commits:** 1 (scoring)

### Task 7: Dashboard Home Page (Recommendations)
Build home page displaying top-5 daily recommendations.
**Files:** src/app/(dashboard)/page.tsx, src/components/RecommendationCard.tsx
**Commits:** 1 (home page)

### Task 8: Property Tracker UI
Build property tracking page with status workflow and notes.
**Files:** src/app/(dashboard)/properties/page.tsx, src/components/PropertyTracker.tsx, src/app/api/saved-properties/route.ts
**Commits:** 1 (property tracker)

### Task 9: Nightly Cron Job Setup
Configure nightly data pipeline and recommendations generation.
**Files:** src/app/api/cron/daily-scrape/route.ts, workers/run_nightly.sh, vercel.json
**Commits:** 1 (cron setup)

### Task 10: Build & Deploy to Vercel
Build production version and deploy to Vercel.
**Files:** .env.example, .gitignore updates
**Commits:** 1 (deployment config)

---

## Execution Notes

- Each task is independently testable
- Use git for commits; one commit per task (unless multi-commit clearly warranted)
- Tests verify functionality without manual intervention
- Design system applies to all UI tasks
- Global Constraints bind every task

---
