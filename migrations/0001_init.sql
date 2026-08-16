-- PBN Realty Initial Schema
-- Run this migration to set up the database

-- Properties Table
CREATE TABLE IF NOT EXISTS "properties" (
    "id" SERIAL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "lat" NUMERIC(10, 8),
    "lng" NUMERIC(11, 8),
    "property_type" VARCHAR(50),
    "square_feet" INTEGER,
    "lot_size" NUMERIC(12, 2),
    "year_built" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" NUMERIC(5, 2),
    "list_price" NUMERIC(15, 2),
    "cap_rate" NUMERIC(5, 3),
    "description" TEXT,
    "image_url" TEXT,
    "source_url" TEXT UNIQUE,
    "source_id" VARCHAR(100) UNIQUE,
    "data_source" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_properties_city_state" ON "properties" ("city", "state");
CREATE INDEX IF NOT EXISTS "idx_properties_price" ON "properties" ("list_price");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_properties_source_id" ON "properties" ("source_id", "data_source");

-- Deals Table
CREATE TABLE IF NOT EXISTS "deals" (
    "id" SERIAL PRIMARY KEY,
    "property_id" INTEGER NOT NULL REFERENCES "properties" ("id"),
    "deal_quality_score" NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "market_score" NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "tenant_demand_score" NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "entitlement_score" NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "total_score" NUMERIC(5, 2) NOT NULL DEFAULT 0,
    "estimated_irr" NUMERIC(5, 2),
    "hold_period" INTEGER DEFAULT 3,
    "analysis_data" JSONB,
    "market_narrative" TEXT,
    "risk_factors" JSONB,
    "opportunities" JSONB,
    "analyzed_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_deals_property_id" ON "deals" ("property_id");
CREATE INDEX IF NOT EXISTS "idx_deals_total_score" ON "deals" ("total_score");
CREATE INDEX IF NOT EXISTS "idx_deals_estimated_irr" ON "deals" ("estimated_irr");

-- SavedProperties Table
CREATE TABLE IF NOT EXISTS "saved_properties" (
    "id" SERIAL PRIMARY KEY,
    "property_id" INTEGER NOT NULL REFERENCES "properties" ("id"),
    "status" VARCHAR(50) NOT NULL DEFAULT 'watching' CHECK ("status" IN ('watching', 'interested', 'offer_pending', 'passed')),
    "notes" TEXT,
    "investment_notes" TEXT,
    "estimated_purchase_price" NUMERIC(15, 2),
    "investment_thesis" TEXT,
    "tags" JSONB,
    "saved_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_saved_properties_property_id" ON "saved_properties" ("property_id");
CREATE INDEX IF NOT EXISTS "idx_saved_properties_status" ON "saved_properties" ("status");

-- Recommendations Table
CREATE TABLE IF NOT EXISTS "recommendations" (
    "id" SERIAL PRIMARY KEY,
    "deal_id" INTEGER NOT NULL REFERENCES "deals" ("id"),
    "rank" INTEGER NOT NULL,
    "recommendation_score" NUMERIC(5, 2) NOT NULL,
    "reasoning" TEXT,
    "generated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "valid_until" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_recommendations_deal_id" ON "recommendations" ("deal_id");
CREATE INDEX IF NOT EXISTS "idx_recommendations_rank" ON "recommendations" ("rank");
CREATE INDEX IF NOT EXISTS "idx_recommendations_generated_at" ON "recommendations" ("generated_at");

-- MarketData Table
CREATE TABLE IF NOT EXISTS "market_data" (
    "id" SERIAL PRIMARY KEY,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "avg_cap_rate" NUMERIC(5, 3),
    "avg_noi" NUMERIC(15, 2),
    "vacancy_rate" NUMERIC(5, 3),
    "population_growth" NUMERIC(5, 3),
    "job_growth" NUMERIC(5, 3),
    "rental_growth" NUMERIC(5, 3),
    "economic_outlook" VARCHAR(20) CHECK ("economic_outlook" IN ('strong', 'moderate', 'weak')),
    "last_updated" TIMESTAMP DEFAULT NOW() NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE ("city", "state")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_market_data_city_state" ON "market_data" ("city", "state");

-- ScrapeLog Table
CREATE TABLE IF NOT EXISTS "scrape_logs" (
    "id" SERIAL PRIMARY KEY,
    "source" VARCHAR(50) NOT NULL,
    "city" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL CHECK ("status" IN ('success', 'failed', 'partial')),
    "properties_count" INTEGER DEFAULT 0,
    "error_message" TEXT,
    "execution_time" INTEGER,
    "started_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_scrape_logs_source" ON "scrape_logs" ("source");
CREATE INDEX IF NOT EXISTS "idx_scrape_logs_status" ON "scrape_logs" ("status");
CREATE INDEX IF NOT EXISTS "idx_scrape_logs_started_at" ON "scrape_logs" ("started_at");
