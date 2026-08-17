/**
 * Scoring functions for deal evaluation
 * Mirrors the Python DealScorer logic for use in the dashboard
 */

/**
 * Calculate composite score from individual dimension scores
 * Weights: Deal Quality 40%, Market 25%, Tenant Demand 20%, Entitlement 15%
 *
 * @param dealQuality - Deal quality score (0-100)
 * @param market - Market intelligence score (0-100)
 * @param tenantDemand - Tenant demand score (0-100)
 * @param entitlement - Entitlement score (0-100)
 * @returns Composite score (0-100)
 */
export function calculateCompositeScore(
  dealQuality: number,
  market: number,
  tenantDemand: number,
  entitlement: number
): number {
  const composite =
    dealQuality * 0.4 + market * 0.25 + tenantDemand * 0.2 + entitlement * 0.15;
  return Math.round(composite * 100) / 100;
}

/**
 * Estimate IRR based on property price, NOI, and cap rate
 * Assumes cap rate compression of 0.5% per year
 *
 * @param price - Purchase price in dollars
 * @param noi - Current NOI in dollars
 * @param currentCapRate - Current cap rate as percentage (e.g., 5.5 for 5.5%)
 * @param holdingYears - Number of years to hold (default 3)
 * @returns Estimated IRR as percentage (0-50)
 */
export function estimateIrr(
  price: number,
  noi: number,
  currentCapRate: number,
  holdingYears: number = 3
): number {
  if (!price || price === 0) {
    return 0;
  }

  // Use provided NOI or default to conservative 6% estimate
  const annualCashFlow = noi || price * 0.06;

  // Estimate exit cap rate (compression of 0.5% per year)
  let exitCapRate = currentCapRate || (annualCashFlow / price) * 100;
  exitCapRate = Math.max(exitCapRate - 0.5 * holdingYears, 0.5);

  // Calculate exit value
  const exitValue =
    exitCapRate > 0 ? annualCashFlow / (exitCapRate / 100) : price;

  // Calculate total return
  const totalCashFlow = annualCashFlow * holdingYears;
  const totalReturn = totalCashFlow + (exitValue - price);

  // Simplified IRR calculation
  const irr = (totalReturn / price / holdingYears) * 100;

  // Clamp between 0 and 50%
  return Math.max(0, Math.min(irr, 50));
}

/**
 * Generate human-readable acquisition strategy
 *
 * @param price - Purchase price in dollars
 * @param irr - Estimated IRR as percentage
 * @param propertyType - Type of property (default: 'Property')
 * @param askingCapRate - Asking cap rate (optional)
 * @param currentCapRate - Current cap rate (optional)
 * @param holdingYears - Holding period (default 3)
 * @returns Strategy description string
 */
export function generateStrategy(
  price: number,
  irr: number,
  propertyType: string = 'Property',
  askingCapRate?: number,
  currentCapRate?: number,
  holdingYears: number = 3
): string {
  // Format price
  let priceStr: string;
  if (price) {
    const priceM = price / 1_000_000;
    priceStr = priceM >= 1 ? `$${priceM.toFixed(1)}M` : `$${Math.round(price / 1000)}K`;
  } else {
    priceStr = 'Market';
  }

  // Base strategy
  let strategy = `Acquire ${propertyType} at ${priceStr}`;

  // Add action plan based on cap rates
  if (askingCapRate !== undefined && currentCapRate !== undefined) {
    if (askingCapRate > currentCapRate) {
      strategy += ', value-add with tenant optimization';
    } else {
      strategy += ', stabilize and hold';
    }
  } else {
    strategy += ', stabilize operations';
  }

  // Add holding period and IRR
  strategy += `, ${holdingYears}-yr hold, ${irr.toFixed(1)}% IRR`;

  return strategy;
}

/**
 * Score deal quality based on cap rate comparison and days on market
 * Returns 0-100 score
 *
 * @param askingCapRate - Asking cap rate as percentage
 * @param currentCapRate - Current/market cap rate as percentage
 * @param daysOnMarket - Days property has been on market
 * @returns Deal quality score (0-100)
 */
export function scoreDealQuality(
  askingCapRate: number,
  currentCapRate: number,
  daysOnMarket: number
): number {
  let score = 50;

  // Cap rate comparison scoring
  if (askingCapRate && currentCapRate) {
    const capRateDiff = askingCapRate - currentCapRate;

    if (capRateDiff > 0) {
      // Undervalued: every 0.5% above market adds 5 points
      score += Math.min(capRateDiff * 10, 25);
    } else {
      // Overvalued
      score += Math.max(capRateDiff * 10, -15);
    }
  }

  // Days on market scoring
  if (daysOnMarket) {
    if (daysOnMarket > 180) score += 20;
    else if (daysOnMarket > 120) score += 15;
    else if (daysOnMarket > 60) score += 10;
    else if (daysOnMarket < 7) score -= 5;
  }

  return Math.max(0, Math.min(score, 100));
}

/**
 * Score market intelligence based on job growth, transaction trend, and cap rate trend
 * Returns 0-100 score
 *
 * @param jobGrowth - Job growth percentage
 * @param transactionTrend - 'up', 'down', or other
 * @param capRateTrend - 'compressed', 'expanded', or other
 * @returns Market intelligence score (0-100)
 */
export function scoreMarketIntelligence(
  jobGrowth?: number,
  transactionTrend?: string,
  capRateTrend?: string
): number {
  let score = 50;

  if (jobGrowth) {
    if (jobGrowth > 2.0) score += 15;
    else if (jobGrowth > 1.0) score += 8;
    else if (jobGrowth < 0) score -= 10;
  }

  if (transactionTrend === 'up') score += 10;
  else if (transactionTrend === 'down') score -= 10;

  if (capRateTrend === 'compressed') score += 15;
  else if (capRateTrend === 'expanded') score -= 10;

  return Math.max(0, Math.min(score, 100));
}

/**
 * Score tenant demand based on occupancy rate and absorption trend
 * Returns 0-100 score
 *
 * @param occupancyRate - Occupancy rate as percentage (e.g., 92.5)
 * @param absorptionTrend - 'positive', 'negative', or other
 * @returns Tenant demand score (0-100)
 */
export function scoreTenantDemand(
  occupancyRate?: number,
  absorptionTrend?: string
): number {
  let score = 50;

  if (occupancyRate) {
    if (occupancyRate > 95) score += 20;
    else if (occupancyRate > 90) score += 18;
    else if (occupancyRate > 85) score += 10;
    else if (occupancyRate < 70) score -= 15;
  }

  if (absorptionTrend === 'positive') score += 15;
  else if (absorptionTrend === 'negative') score -= 15;

  return Math.max(0, Math.min(score, 100));
}

/**
 * Score entitlement based on zoning flexibility and known issues
 * Returns 0-100 score
 *
 * @param zoning - Zoning description
 * @param knownIssuesCount - Number of known issues
 * @returns Entitlement score (0-100)
 */
export function scoreEntitlement(
  zoning?: string,
  knownIssuesCount: number = 0
): number {
  let score = 50;

  if (zoning) {
    const zoningLower = zoning.toLowerCase();
    if (
      zoningLower.includes('mixed-use') ||
      zoningLower.includes('multi-tenant') ||
      zoningLower.includes('flexible')
    ) {
      score += 20;
    }
  }

  // Penalize for known issues
  score -= knownIssuesCount * 5;

  return Math.max(0, Math.min(score, 100));
}
