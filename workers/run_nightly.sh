#!/bin/bash

# PBN Realty Nightly Data Pipeline Orchestrator
# Runs the complete data pipeline: scrape → score → generate recommendations
# Executed by Vercel cron at 2 AM UTC daily

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/tmp/pbn_realty_nightly.log"
API_BASE="${API_BASE:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-}"

# Color output for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Header
{
  echo "========================================"
  echo "PBN Realty Nightly Pipeline"
  echo "Started at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "========================================"
} | tee -a "$LOG_FILE"

# Activate Python virtual environment
log_info "Setting up Python environment..."
cd "$SCRIPT_DIR"

if [ ! -d "venv" ]; then
  log_error "Virtual environment not found at $SCRIPT_DIR/venv"
  log_info "Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

source venv/bin/activate

# Step 1: Scrape Redfin properties
log_info "Step 1: Starting Redfin scraper..."
if python scraper.py >> "$LOG_FILE" 2>&1; then
  log_info "Step 1 completed: Redfin scraper finished successfully"
else
  log_error "Step 1 failed: Redfin scraper encountered an error"
  exit 1
fi

# Step 2: Score all properties
log_info "Step 2: Scoring all properties..."
if python deal_scorer.py >> "$LOG_FILE" 2>&1; then
  log_info "Step 2 completed: Deal scoring finished successfully"
else
  log_error "Step 2 failed: Deal scorer encountered an error"
  exit 1
fi

# Step 3: Trigger the cron endpoint to generate recommendations
log_info "Step 3: Generating daily recommendations..."

if [ -z "$CRON_SECRET" ]; then
  log_warn "CRON_SECRET not set - cron endpoint will reject the request"
fi

# Create temp files for response body and http code
TEMP_RESPONSE=$(mktemp)
HTTP_CODE=$(curl -s -w "%{http_code}" \
  -X GET \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -H "Content-Type: application/json" \
  -o "$TEMP_RESPONSE" \
  "$API_BASE/api/cron/daily-scrape")

RESPONSE_BODY=$(cat "$TEMP_RESPONSE")
rm -f "$TEMP_RESPONSE"

if [ "$HTTP_CODE" = "200" ]; then
  log_info "Step 3 completed: Recommendations generated successfully"
  echo "$RESPONSE_BODY" | tee -a "$LOG_FILE"
elif [ "$HTTP_CODE" = "401" ]; then
  log_error "Step 3 failed: Unauthorized - invalid CRON_SECRET"
  echo "$RESPONSE_BODY" | tee -a "$LOG_FILE"
  exit 1
else
  log_error "Step 3 failed: HTTP $HTTP_CODE"
  echo "$RESPONSE_BODY" | tee -a "$LOG_FILE"
  exit 1
fi

# Footer
{
  echo "========================================"
  echo "Nightly Pipeline Completed Successfully"
  echo "Finished at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo "========================================"
} | tee -a "$LOG_FILE"

log_info "Pipeline results logged to: $LOG_FILE"
