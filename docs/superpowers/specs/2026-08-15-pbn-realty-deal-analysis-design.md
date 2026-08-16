---
title: PBN Realty Deal Analysis Platform
date: 2026-08-15
author: Sumeet Harish
status: Design Review
---

# PBN Realty: AI-Powered Commercial Real Estate Deal Analysis Platform

## Executive Summary

PBN Realty is a national commercial real estate deal sourcing and analysis platform that identifies top-5 investment opportunities daily, ranks them by 15%+ IRR potential, and tracks property acquisitions through close with investor management. Built as a separate venture from Golden Lotus Labs, it combines property data aggregation (on-market + off-market), AI-powered market intelligence, and a professional management dashboard for value-add retail/office plays.

**Target User:** Sumeet Harish (solo operator with angel investor network)
**Business Model:** Acquire undervalued properties (strip malls, office buildings), fill with tenants, hold 1-5 years, flip for 15%+ IRR
**Timeline:** 1-5 year holds; focus on value-add acquisitions and entitlement plays

---

## 1. System Architecture

### High-Level Flow

```
Data Ingestion Layer
  ├─ Redfin Commercial (scraping)
  ├─ Broker Email Feeds (parsed)
  ├─ Public MLS Exports (commercial)
  └─ Property deduplication & normalization

Intelligence Layer
  ├─ Deal Quality Scoring (cap rate, NOI, price/SF, comps)
  ├─ Market Intelligence (news, economic data, trends)
  ├─ Tenant Demand Analysis (occupancy, commercial activity)
  └─ Entitlement Analysis (zoning, permits, risk)

Deal Ranking Engine
  └─ Composite scoring + IRR estimation → Top-5 daily recommendations

Dashboard & Tracking
  ├─ Recommendation viewer
  ├─ Property tracker (notes, status, issues)
  ├─ Investor management & returns calculation
  └─ Market research drill-down
```

### Component Breakdown

**1. Data Ingestion (Python/Nightly Job)**
- Scrape Redfin Commercial for new listings nationwide
- Parse broker email forwarding for off-market deals
- Ingest public MLS feeds from broker partners
- Deduplicate properties across sources
- Extract structured data: address, property type, price, SF, current income, tenant info, asking cap rate
- Estimate missing data from market comps

**2. Intelligence Layer (Python + Claude AI)**
- Score each property on four dimensions (see Deal Scoring section)
- Fetch market intelligence: news API, economic indicators, population trends, college proximity
- Analyze tenant demand for specific property types/markets
- Evaluate entitlement potential (zoning, permits, regulatory environment)
- Compile market summary narrative for each top deal

**3. Deal Ranking Engine (Python)**
- Calculate composite score (0-100) for each property
- Estimate acquisition strategy:
  - Projected current NOI vs. market comps
  - Estimated renovation/lease-up costs
  - Pro forma NOI after tenant fill and operational improvements
  - Estimated exit price (year 3-5 based on market trends)
  - IRR calculation over holding period
- Rank by IRR potential
- Surface top-5 daily with strategy summary

**4. Dashboard (Next.js + TypeScript)**
- Display top-5 recommendations with scoring breakdown
- Property tracker: save, annotate, track status
- Investor allocations and returns dashboard
- Market research viewer

---

## 2. Data Sources

### Primary Sources

**Redfin Commercial**
- Public commercial property listings
- Updated daily; no authentication required (scrape-friendly)
- Coverage: most US commercial markets
- Extract: address, price, SF, building type, NOI, available cap rate, tenant info

**Broker Email Feeds**
- Off-market wholesale deals sent by brokers/wholesalers
- Parsed from incoming email (forwarded to system)
- Extract: property details, asking price, seller motivation, tenant occupancy
- Higher quality deals (not yet public)

**Public MLS Exports**
- Commercial real estate brokers export listings to public MLSs
- Requested from broker partners on weekly basis
- Coverage: local markets where you're focused
- Extract: same as Redfin

**Fallback: News + Economic Data**
- Market Intelligence: news API (NewsAPI, Google News), local business publications
- Economic Data: Bureau of Labor Statistics (job growth), Census data (population trends)
- Real Estate Metrics: CoStar public data, local market reports

### Data Pipeline

**Nightly Process (Scheduled Job):**
1. Scrape Redfin Commercial nationwide
2. Check incoming email for new broker deals
3. Fetch updated MLS exports (weekly)
4. Deduplicate across sources (match on address)
5. Normalize structured fields
6. Flag missing data (NOI, income, cap rate) for estimation from comps
7. Pass to Intelligence Layer for scoring

---

## 3. Deal Scoring Framework

Each property scored on four weighted dimensions:

### A. Deal Quality Score (40%)
Measures: Is the property undervalued relative to its income potential?

**Inputs:**
- Current asking cap rate vs. market average (20-year comps)
- Price per square foot vs. class/type comps
- NOI calculation from income data
- Days on market (indicator of motivation/pricing)
- Debt Service Coverage Ratio (DSCR) if financing assumed

**Logic:**
- Property trading below market cap rate = higher score (better entry)
- Higher NOI relative to price = higher score
- Long DOM (60+ days) = seller may negotiate = higher score

**Output:** 0-100 sub-score

### B. Market Intelligence Score (25%)
Measures: Are market conditions favorable for 15% IRR exit?

**Inputs:**
- Job growth in metro area (YoY % change)
- Commercial property transaction velocity (deals/month trend)
- Cap rate compression/expansion in market (is market tightening?)
- Economic news: infrastructure projects, zoning changes, major employer announcements
- Demographic trends: population growth, income levels, education

**Logic:**
- Markets with job growth + low unemployment = higher score
- Cap rate compression (caps declining) = buyer competition, easier exit = higher score
- Recent development/infrastructure announcements = future growth catalyst = higher score

**Data Source:** Bureau of Labor Statistics, Google News API, local chambers of commerce, CoStar public data

**Output:** 0-100 sub-score

### C. Tenant Demand Score (20%)
Measures: Can we fill the building with quality tenants in this market?

**Inputs:**
- Commercial occupancy rate in metro (vacancy %)
- Retail/office absorption rate (how much space is leasing YoY?)
- Tenant types in market (e.g., medical, tech, retail mix)
- Wage levels and business density in area

**Logic:**
- Low vacancy + high absorption = tenants actively seeking space = higher score
- Wage growth = tenants can afford rent = higher score
- Diverse tenant mix = less risk = higher score

**Data Source:** CoStar, local market reports, commercial brokers

**Output:** 0-100 sub-score

### D. Entitlement/Risk Score (15%)
Measures: Is there upside from zoning, permits, or risk factors?

**Inputs:**
- Zoning flexibility (can property be re-tenanted, expanded, or rezoned?)
- Recent zoning/permit approvals in area (is market approving development?)
- Environmental concerns (phase 1 ESA if available)
- Structural/mechanical condition (if known)
- Regulatory/compliance risk

**Logic:**
- Zoning upside (re-tenanting potential, expansion) = higher score
- City actively approving development = higher score
- No known environmental/structural issues = higher score

**Output:** 0-100 sub-score

### Composite Score & Ranking

```
Composite = (Quality × 0.40) + (Market × 0.25) + (Tenant × 0.20) + (Entitlement × 0.15)
```

**Top-5 daily:** Rank all properties by Composite score, surface top 5 to dashboard.

---

## 4. Acquisition Strategy Estimation

For each top-5 deal, estimate the likely path to 15% IRR:

### Inputs
- Current asking price & cap rate
- Estimated current NOI
- Market cap rate (what similar properties trade at after improvement)
- Renovation costs (if needed)
- Lease-up timeline and tenant fill strategy
- Holding period (default 3-5 years)

### Calculation Example
```
Year 0 (Acquisition):
  - Acquire at: $X (asking price)
  - Assume $Y in renovations over 18 months
  - Tenant fill: 6 months to stabilized occupancy

Year 1-3 (Hold):
  - Cash flow from rent (adjusted for market rates + tenant quality)
  - Operating expense control
  - Small add-on acquisitions (adjacent properties) if market allows

Year 3-5 (Exit):
  - Estimated exit price: based on projected NOI × market cap rate
  - If market cap rates decline (compression) = higher exit price
  - IRR calculated: (Exit proceeds + cumulative cash flow - Initial investment) / years held
```

### Output to Dashboard
```
"Buy at $X, stabilize with Y tenants, hold 3 years, exit at Z cap rate = 18% IRR"
```

This gives you a quick mental model of the deal without deep underwriting.

---

## 5. Dashboard Features

### 5.1 Home / Daily Recommendations

**Display:**
- Top-5 properties ranked by estimated IRR
- For each property:
  - Photo, address, price, current cap rate
  - Quick deal summary: "Buy $X, add tenants, 3-yr hold, 18% IRR"
  - Scoring breakdown: Deal Quality (85/100), Market (72/100), Tenant Demand (88/100), Entitlement (60/100)
  - Market intelligence snippet: "Growing tech hub, 3.2% job growth, cap rates declining"
  - Quick actions: Save, View Details, Research

**Design:** Responsive grid, same style as GLL Dashboard

### 5.2 Property Tracker

**Save Properties:**
- Save from daily recommendations or manual search
- Status workflow: Prospect → Under Review → Offer Made → Under Contract → Closed
- Mark as Pass (don't pursue)

**Track Daily:**
- Add notes (inspection findings, broker calls, tenant conversations)
- Upload documents (appraisals, proformas, LOIs)
- Log issues & risks
- Estimate your own returns (override algorithm)

**Closed Deals:**
- Tenant roster (name, lease start, monthly rent)
- Cash flow tracking (monthly income, expenses, net)
- Investor allocation (split between LPs and yourself)

### 5.3 Investor Management

**Add Investors:**
- Name, investment amount, % equity, contact

**Allocate Properties:**
- For each closed deal, allocate to LP(s)
- Track their equity %, preferential returns, etc.

**Returns Dashboard (Investor View):**
- List of allocated properties
- Estimated current value
- YTD distributions (cash flow)
- Estimated IRR to date
- Expected exit timing

### 5.4 Market Research Viewer

**Drill-Down by Metro:**
- Select any US metro (e.g., "Denver Metro")
- See:
  - Economic health (job growth, unemployment, wage trends)
  - Real estate trends (cap rates, transaction volume, days on market)
  - Tenant demand (occupancy, absorption, tenant types)
  - Recent news (major employers, infrastructure, development)

**Historical Performance:**
- How past deals in similar markets performed (for learning)

### 5.5 Returns & Analytics

**Portfolio View:**
- Summary: Total invested, total return, weighted avg IRR, cash flow YTD
- Deal-by-deal breakdown: invested capital, current value, cash distributed, remaining runway

---

## 6. Data Model (Database Schema)

### Core Tables

**Properties**
- `id`, `address`, `city`, `state`, `zip`, `lat`, `lon`
- `price`, `sf`, `year_built`, `property_type` (retail, office, industrial, etc.)
- `current_noi`, `current_cap_rate`, `asking_cap_rate`
- `tenant_info` (JSON: list of current tenants, lease terms, occupancy %)
- `days_on_market`, `list_date`
- `source` (Redfin, Email, MLS), `source_url`, `broker_contact`
- `score_deal_quality`, `score_market`, `score_tenant_demand`, `score_entitlement`, `composite_score`
- `estimated_irr`, `acquisition_strategy` (text description)
- `created_at`, `updated_at`

**Saved Properties** (user tracking)
- `id`, `user_id`, `property_id`, `status` (prospect, reviewing, offer, contract, closed, pass)
- `notes` (JSON: array of timestamped notes)
- `user_estimated_irr`, `user_notes`
- `created_at`, `updated_at`

**Closed Deals** (full deal tracking)
- `id`, `property_id`, `acquisition_date`, `acquisition_price`
- `tenants` (JSON: list with lease terms, monthly rent)
- `estimated_monthly_expenses`, `monthly_net_cash_flow`
- `investor_allocation` (JSON: list of LPs, %, preferred returns)
- `created_at`, `updated_at`

**Investors** (LP tracking)
- `id`, `user_id`, `name`, `email`, `invested_total`, `preferred_return_rate`

**Recommendations** (daily top-5 log)
- `id`, `date`, `property_id`, `rank`, `composite_score`, `irr_estimate`

**Market Intelligence** (cached)
- `id`, `metro`, `data_date`, `job_growth`, `unemployment`, `cap_rate_trend`, `occupancy_rate`, `recent_news` (JSON)

---

## 7. Technology Stack

**Frontend:**
- Next.js 14+ (TypeScript)
- React components (reuse from GLL Dashboard if possible)
- Tailwind CSS for styling
- Chart library (Recharts) for returns/analytics
- Vercel deployment

**Backend:**
- Node.js API routes (Next.js API routes)
- Python workers (property scraping, deal scoring, market analysis)
- Claude AI (market narrative generation, deal quality assessment)

**Database:**
- PostgreSQL (Vercel Postgres or self-hosted)
- Drizzle ORM (type-safe queries)

**Data & ML:**
- Python scripts: BeautifulSoup (Redfin scraping), email parsing
- Claude API: market analysis, deal narrative generation
- News API: market intelligence
- Government data APIs: BLS, Census

**Infrastructure:**
- Vercel (frontend + serverless functions)
- Cron jobs (nightly data pipeline, scheduled on Vercel or external service like EasyCron)
- Environment variables for API keys (LoopNet alternative, News API, etc.)

**Monitoring & Logging:**
- Vercel built-in monitoring
- Error tracking (Sentry or similar)

---

## 8. Design System (Tesla/SpaceX Aesthetic)

### Visual Identity

**Brand Philosophy:** Premium, data-driven, high-tech. Like piloting a spacecraft — clean, powerful, trust-inducing.

### Color Palette

**Primary Background:**
- Deep charcoal: `#0A0E27` (main bg)
- Dark slate: `#1A1F3A` (card/panel bg)
- Dark cyan: `#0F2C3D` (hover/active states)

**Accent Colors:**
- Electric cyan: `#00D9FF` (primary actions, highlights, data points)
- Neon green: `#39FF14` (positive indicators, growth)
- Electric orange: `#FF6B35` (alerts, warnings, attention)
- Tesla red: `#E82127` (danger, critical alerts)
- Purple/violet: `#7C3AED` (secondary accent, secondary data)

**Neutrals:**
- Off-white/text: `#E8E8E8` (primary text)
- Light gray: `#B0B0B0` (secondary text)
- Dark gray: `#2D3748` (borders, dividers)

### Typography

**Font Stack:** `Inter`, `SF Pro Display`, or system fonts (modern, geometric)

**Hierarchy:**
- **H1 (Page Title):** 48px, bold, letter-spacing -1px
- **H2 (Section Title):** 32px, semi-bold
- **H3 (Subsection):** 20px, semi-bold
- **Body (Standard Text):** 14px, regular, line-height 1.6
- **Label (UI Labels):** 12px, medium, all-caps, letter-spacing 0.5px
- **Number (Data):** 18px, mono font, bold (for metrics, prices, IRR)

### Component Style

**Cards & Panels:**
- Subtle border: `1px solid rgba(0, 217, 255, 0.2)` (cyan glow)
- Background with gradient: `linear-gradient(135deg, #0F2C3D 0%, #1A1F3A 100%)`
- Border-radius: 8px
- Box-shadow: `0 8px 32px rgba(0, 217, 255, 0.1)` (subtle glow)
- Hover effect: Cyan border brightens, shadow intensifies

**Buttons:**
- Primary: Cyan (`#00D9FF`) background, dark text
- Secondary: Transparent with cyan border, cyan text
- Hover: Slight glow, scale up 1.02x, shadow expands
- Active: Brighter, sharper glow
- Animation: Smooth 200ms transition

**Inputs & Forms:**
- Dark background with cyan accent border (on focus)
- Placeholder text: light gray
- Focus ring: Cyan, glowing effect
- Error state: Orange/red border

**Data Visualizations (Charts):**
- Line charts: Cyan, green, purple gradients
- Background grid: subtle, dark
- Tooltips: Dark bg, cyan text, instant appear (no delay)
- Animations: Smooth line draws, real-time data updates

**Real-Time Indicators:**
- Pulsing dot for "live" data (cyan pulse)
- Numbers animate with smooth transitions (no hard jumps)
- Loading spinner: Rotating cyan ring with subtle glow

### Layout Patterns

**Grid & Spacing:**
- 12-column grid, 16px gutter
- Padding: 24px (sections), 16px (cards)
- Consistent spacing: 8px, 16px, 24px, 32px (scale of 8)

**Recommendation Cards (Home):**
- 2-3 columns on desktop, stack on mobile
- Each card shows: photo, price, IRR, quick scores, one-liner strategy
- Hover: Card lifts, border glows brighter, quick-action buttons appear

**Property Tracker (List View):**
- Minimal table with zebra rows
- Row hover: Background lightens, expand button appears
- Expandable detail panel: Full property info, notes, history

**Dashboard Grid:**
- Top bar: Key metrics (portfolio value, YTD return, active deals) in mini cards
- Charts: Market trends, return distribution, deal pipeline
- Right sidebar: Quick links, filters, search

**Navigation:**
- Top nav bar: Dark, minimal, icon-based primary nav, user menu
- Sidebar (collapsible): Secondary nav, market drill-down
- Breadcrumbs: For property detail pages

### Animations & Interactions

**Transitions:**
- All state changes: 200ms ease-out cubic-bezier (smooth, crisp)
- Page transitions: Fade in (100ms)
- Hover states: Glow + scale
- Card opens: Slide down + fade in

**Real-Time Updates:**
- New recommendations: Slide in from top
- Data refreshes: Smooth number animations
- Loading states: Pulsing skeleton placeholders (dark, faint cyan border)

**Interactions:**
- Buttons: Click feedback (micro-pulse)
- Dropdowns: Smooth slide open
- Modals: Dark overlay, card animates in
- Notifications: Slide from corner, auto-dismiss with countdown

### Typography Examples

**Recommendation Card Title:**
```
ADDRESS: 123 Main St, Denver CO
PRICE: $2.5M | CAP RATE: 5.2% | SCORE: 87/100
```

**Property Detail Page:**
```
[PROPERTY NAME] [STATUS BADGE]
123 Main St, Denver, CO 80202 | 45,000 SF | Office/Retail
```

**Data Metrics:**
```
PORTFOLIO VALUE      YTD RETURN      WEIGHTED AVG IRR      ACTIVE DEALS
$12.5M               +$1.2M (+9.6%)  15.3%                 3
```

### Glassmorphism Effects

- Subtle: Semi-transparent backgrounds with backdrop blur
- Use sparingly: Primary cards only
- Overlays: Modals and sidebars can use glassmorphism
- Fallback: Solid dark backgrounds for older browsers

### Accessibility

- High contrast: Cyan text on dark bg has 7:1+ contrast ratio
- No color-only information: Always use icons + color + text
- Focus states: Visible cyan ring around interactive elements
- Font sizes: 14px minimum for body text

### Visual References

Think of:
- **Tesla Model 3 Dashboard:** Clean, data-focused, minimal chrome
- **SpaceX Starship Timeline:** Dark with cyan accents, real-time metrics
- **Vercel Dashboard:** Modern, spacious, data-dense but scannable
- **Figma Design System:** Smooth, interactive, high-fidelity

---

## 9. Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- Build Next.js dashboard skeleton
- Implement Redfin scraper (nationwide)
- Implement deal scoring (simplified version)
- Daily top-5 recommendations
- Property save/tracker (basic)

### Phase 2: Intelligence (Weeks 5-8)
- Add Claude AI for deal narrative & market analysis
- Integrate market intelligence (news, economic data)
- Refine scoring with real market data
- Investor allocation UI

### Phase 3: Polish (Weeks 9-10)
- Returns calculation & dashboard
- Historical deal tracking
- Mobile responsiveness
- Performance optimization

---

## 10. Success Metrics

- **Daily engagement:** You review top-5 recommendations daily
- **Deal flow:** 20+ deals saved monthly, 5+ offers made annually
- **IRR accuracy:** Algorithm recommendations correlate with actual deal outcomes
- **Platform reliability:** <99% uptime, data synced daily without manual intervention
- **Time savings:** Algorithm saves 10+ hours weekly vs. manual screening

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data quality (missing NOI, cap rates) | Scoring unreliable | Use comps for estimation, flag low-confidence deals |
| Redfin scraping breaks (site changes) | Pipeline fails | Monitor, add email alerts for failures, fallback to manual |
| Market data unavailable in some metros | Coverage gaps | Prioritize major metros first, expand later |
| Scoring doesn't correlate to IRR | Algorithm loses credibility | Track actual outcomes, retrain quarterly |
| Off-market deal sourcing limited | Misses best opportunities | Build broker network relationships over time |

---

## 12. Future Enhancements (Post-MVP)

- Predictive modeling: forecast which markets will see cap rate compression
- LoopNet API integration (if budget allows)
- Automated offer generation & CRM
- Co-investment marketplace (attract other investors)
- Mobile app
- API for broker integration

---

## Sign-Off

**Date:** 2026-08-15
**Status:** Ready for Implementation Plan
**Owner:** Sumeet Harish
