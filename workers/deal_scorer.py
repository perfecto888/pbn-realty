"""
Deal Scoring Algorithm for PBN Realty
Evaluates properties on 4 weighted dimensions and estimates IRR
"""

from typing import List, Dict, Optional
import math


class DealScorer:
    """
    Scores real estate deals based on quality, market conditions, tenant demand, and entitlements.
    Uses a 40/25/20/15 weighting framework.
    """

    def __init__(self, market_data: Dict):
        """
        Initialize DealScorer with market data for lookups.

        Args:
            market_data: Dict with structure {market_key: {job_growth, transaction_trend,
                        cap_rate_trend, occupancy_rate, absorption_trend}}
        """
        self.market_data = market_data or {}

    def score_deal_quality(self, property_dict: Dict) -> float:
        """
        Score the quality of a specific deal opportunity.
        Compares asking cap rate to market average and factors in days on market.
        Returns 0-100 score.

        Args:
            property_dict: Dictionary with property data (asking_cap_rate, currentCapRate, daysOnMarket, price)

        Returns:
            float: Deal quality score (0-100)
        """
        score = 50.0  # Baseline

        asking_cap_rate = self._safe_float(property_dict.get('askingCapRate'))
        current_cap_rate = self._safe_float(property_dict.get('currentCapRate'))
        days_on_market = self._safe_float(property_dict.get('daysOnMarket'))

        # Scoring based on asking cap rate vs current market cap rate
        if asking_cap_rate is not None and current_cap_rate is not None:
            cap_rate_diff = asking_cap_rate - current_cap_rate

            # If asking cap rate is higher than market (undervalued), add points
            if cap_rate_diff > 0:
                # Every 0.5% above market cap rate adds 5 points
                score += min(cap_rate_diff * 10, 25)
            else:
                # If asking is lower than market (overvalued), subtract points
                score += max(cap_rate_diff * 10, -15)

        # Scoring based on days on market (high DOM = better deal opportunity)
        if days_on_market is not None:
            if days_on_market > 180:  # Over 6 months
                score += 20
            elif days_on_market > 120:  # Over 4 months
                score += 15
            elif days_on_market > 60:  # Over 2 months
                score += 10
            elif days_on_market < 7:  # Fresh listing (neg signal)
                score -= 5

        return self._clamp_score(score)

    def score_market_intelligence(self, city: str, state: str) -> float:
        """
        Score market conditions using market intelligence data.
        Factors: job_growth (>2%=+15), transaction_trend (up=+10), cap_rate_trend (compressed=+15)
        Returns 0-100 score.

        Args:
            city: City name
            state: State name

        Returns:
            float: Market intelligence score (0-100)
        """
        score = 50.0  # Baseline

        # Create market key for lookup
        market_key = f"{city}, {state}"
        market_info = self.market_data.get(market_key, {})

        # Job growth factor (>2% is positive)
        job_growth = self._safe_float(market_info.get('job_growth'))
        if job_growth is not None:
            if job_growth > 2.0:
                score += 15
            elif job_growth > 1.0:
                score += 8
            elif job_growth < 0:
                score -= 10

        # Transaction trend factor (up trend is positive)
        transaction_trend = market_info.get('transaction_trend')
        if transaction_trend == 'up':
            score += 10
        elif transaction_trend == 'down':
            score -= 10

        # Cap rate trend factor (compression is positive)
        cap_rate_trend = market_info.get('cap_rate_trend')
        if cap_rate_trend == 'compressed':
            score += 15
        elif cap_rate_trend == 'expanded':
            score -= 10

        return self._clamp_score(score)

    def score_tenant_demand(self, city: str, state: str, property_type: str) -> float:
        """
        Score tenant demand in the market.
        Factors: occupancy_rate (>90%=+20), absorption_trend (positive=+15)
        Returns 0-100 score.

        Args:
            city: City name
            state: State name
            property_type: Type of property (e.g., 'apartment', 'office', 'retail')

        Returns:
            float: Tenant demand score (0-100)
        """
        score = 50.0  # Baseline

        # Create market key for lookup
        market_key = f"{city}, {state}"
        market_info = self.market_data.get(market_key, {})

        # Occupancy rate factor (>90% is strong)
        occupancy_rate = self._safe_float(market_info.get('occupancy_rate'))
        if occupancy_rate is not None:
            if occupancy_rate > 95:
                score += 20
            elif occupancy_rate > 90:
                score += 18
            elif occupancy_rate > 85:
                score += 10
            elif occupancy_rate < 70:
                score -= 15

        # Absorption trend factor (positive absorption is good)
        absorption_trend = market_info.get('absorption_trend')
        if absorption_trend == 'positive':
            score += 15
        elif absorption_trend == 'negative':
            score -= 15

        return self._clamp_score(score)

    def score_entitlement(self, property_dict: Dict) -> float:
        """
        Score zoning and entitlement flexibility.
        Checks for zoning flexibility (multi-tenant, mixed-use) = +20
        Penalizes known issues (environmental, structural) = -5 per issue
        Returns 0-100 score.

        Args:
            property_dict: Dictionary with property data (zoning, known_issues)

        Returns:
            float: Entitlement score (0-100)
        """
        score = 50.0  # Baseline

        # Zoning flexibility bonus
        zoning = property_dict.get('zoning', '')
        if isinstance(zoning, str):
            zoning_lower = zoning.lower()
            if 'mixed-use' in zoning_lower or 'multi-tenant' in zoning_lower or 'flexible' in zoning_lower:
                score += 20

        # Known issues penalties
        known_issues = property_dict.get('known_issues', [])
        if isinstance(known_issues, list):
            score -= len(known_issues) * 5
        elif isinstance(known_issues, dict):
            score -= len(known_issues) * 5

        return self._clamp_score(score)

    def score_property(self, property_dict: Dict, market_data: Optional[Dict] = None) -> Dict:
        """
        Calculate all scoring dimensions for a property.
        Returns dict with individual scores and composite score (40/25/20/15 weighting).

        Args:
            property_dict: Dictionary with property data
            market_data: Optional market data dict (if not provided, uses initialized data)

        Returns:
            Dict with keys: deal_quality, market_intelligence, tenant_demand, entitlement, composite_score
        """
        # Use provided market_data if given, otherwise use initialized data
        if market_data is not None:
            original_market_data = self.market_data
            self.market_data = market_data

        try:
            # Calculate individual scores
            deal_quality = self.score_deal_quality(property_dict)

            city = property_dict.get('city', '')
            state = property_dict.get('state', '')
            property_type = property_dict.get('propertyType', '')

            market_intelligence = self.score_market_intelligence(city, state)
            tenant_demand = self.score_tenant_demand(city, state, property_type)
            entitlement = self.score_entitlement(property_dict)

            # Calculate composite score using 40/25/20/15 weighting
            composite_score = (
                deal_quality * 0.40 +
                market_intelligence * 0.25 +
                tenant_demand * 0.20 +
                entitlement * 0.15
            )

            return {
                'deal_quality': round(deal_quality, 2),
                'market_intelligence': round(market_intelligence, 2),
                'tenant_demand': round(tenant_demand, 2),
                'entitlement': round(entitlement, 2),
                'composite_score': round(composite_score, 2)
            }
        finally:
            # Restore original market data if we temporarily swapped it
            if market_data is not None:
                self.market_data = original_market_data

    def estimate_irr(self, property_dict: Dict, holding_years: int = 3) -> float:
        """
        Estimate IRR based on NOI and cap rate trends.
        Assumes cap rate compression of 0.5% per year.

        Args:
            property_dict: Dictionary with property data (price, currentNoi, currentCapRate)
            holding_years: Number of years to hold (default 3)

        Returns:
            float: Estimated IRR (0-50%)
        """
        price = self._safe_float(property_dict.get('price'))
        current_noi = self._safe_float(property_dict.get('currentNoi'))
        current_cap_rate = self._safe_float(property_dict.get('currentCapRate'))

        # Conservative estimate if NOI not provided
        if current_noi is None or price is None:
            if price is None:
                return 0.0
            # Assume 6% NOI if not provided
            current_noi = price * 0.06

        if price == 0:
            return 0.0

        # Calculate annual cash flow based on NOI
        annual_cash_flow = current_noi

        # Estimate exit cap rate (assuming compression of 0.5% per year)
        exit_cap_rate = current_cap_rate if current_cap_rate else (annual_cash_flow / price * 100)
        if exit_cap_rate is not None:
            exit_cap_rate = max(exit_cap_rate - (0.5 * holding_years), 0.5)
        else:
            exit_cap_rate = (annual_cash_flow / price * 100)

        # Estimate exit value based on exit cap rate
        exit_value = annual_cash_flow / (exit_cap_rate / 100) if exit_cap_rate > 0 else price

        # Calculate total return
        total_cash_flow = annual_cash_flow * holding_years
        total_return = total_cash_flow + (exit_value - price)

        # Simplified IRR calculation
        if price > 0:
            irr = (total_return / price / holding_years) * 100
        else:
            irr = 0.0

        # Clamp IRR between 0 and 50%
        return max(0.0, min(irr, 50.0))

    def generate_strategy(self, property_dict: Dict, irr: float) -> str:
        """
        Generate a human-readable acquisition strategy string.

        Args:
            property_dict: Dictionary with property data
            irr: Estimated IRR

        Returns:
            str: Strategy description (e.g., "Buy at $2.5M, stabilize tenants, 3-yr hold, 18.5% IRR")
        """
        price = self._safe_float(property_dict.get('price'))
        property_type = property_dict.get('propertyType', 'Property')
        city = property_dict.get('city', '')

        # Format price
        if price is not None:
            price_m = price / 1_000_000
            price_str = f"${price_m:.1f}M" if price_m >= 1 else f"${int(price / 1000)}K"
        else:
            price_str = "Market"

        # Determine strategy based on property type and market conditions
        current_cap_rate = self._safe_float(property_dict.get('currentCapRate'))
        asking_cap_rate = self._safe_float(property_dict.get('askingCapRate'))

        # Base strategy
        strategy = f"Acquire {property_type} at {price_str}"

        # Add action plan based on cap rates
        if asking_cap_rate is not None and current_cap_rate is not None:
            if asking_cap_rate > current_cap_rate:
                strategy += ", value-add with tenant optimization"
            else:
                strategy += ", stabilize and hold"
        else:
            strategy += ", stabilize operations"

        # Add holding period and IRR
        strategy += f", 3-yr hold, {irr:.1f}% IRR"

        return strategy

    def _safe_float(self, value) -> Optional[float]:
        """
        Safely convert value to float, handling None and string values.

        Args:
            value: Value to convert

        Returns:
            float or None
        """
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    def _clamp_score(self, score: float) -> float:
        """
        Clamp score to valid range [0, 100].

        Args:
            score: Raw score

        Returns:
            float: Clamped score
        """
        return max(0.0, min(score, 100.0))


def score_all_properties(properties: List[Dict], market_data: Dict) -> List[Dict]:
    """
    Score a batch of properties and estimate IRR for each.
    Adds scores and IRR estimates to each property dict.

    Args:
        properties: List of property dictionaries
        market_data: Market data for scoring

    Returns:
        List of updated property dictionaries with scores and IRR estimates
    """
    scorer = DealScorer(market_data)
    scored_properties = []

    for prop in properties:
        # Score the property
        scores = scorer.score_property(prop)

        # Estimate IRR
        irr = scorer.estimate_irr(prop)

        # Generate strategy
        strategy = scorer.generate_strategy(prop, irr)

        # Update property dict with scores
        updated_prop = {**prop}
        updated_prop['scoreDealQuality'] = scores['deal_quality']
        updated_prop['scoreMarket'] = scores['market_intelligence']
        updated_prop['scoreTenantDemand'] = scores['tenant_demand']
        updated_prop['scoreEntitlement'] = scores['entitlement']
        updated_prop['compositeScore'] = scores['composite_score']
        updated_prop['estimatedIrr'] = irr
        updated_prop['acquisitionStrategy'] = strategy

        scored_properties.append(updated_prop)

    return scored_properties


def fetch_properties_from_api(api_base: str) -> List[Dict]:
    """
    Fetch all properties from the API that need scoring.

    Args:
        api_base: Base URL of the API (e.g., http://localhost:3000)

    Returns:
        List of property dictionaries
    """
    import requests

    properties = []
    limit = 100
    offset = 0

    try:
        while True:
            url = f"{api_base}/api/properties?limit={limit}&offset={offset}"
            print(f"[FETCH] Fetching properties from {url}")

            response = requests.get(url, timeout=30)
            response.raise_for_status()

            data = response.json()
            batch = data.get('properties', [])

            if not batch:
                break

            properties.extend(batch)
            offset += limit

            print(f"[FETCH] Loaded {len(batch)} properties (total: {len(properties)})")

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to fetch properties: {e}")
        return []

    return properties


def update_property_scores(api_base: str, property_id: int, scores: Dict) -> bool:
    """
    Update a property's scores via the API.

    Args:
        api_base: Base URL of the API
        property_id: ID of the property to update
        scores: Dictionary with score fields

    Returns:
        bool: True if successful, False otherwise
    """
    import requests

    try:
        url = f"{api_base}/api/properties/{property_id}"

        update_data = {
            'scoreDealQuality': scores['scoreDealQuality'],
            'scoreMarket': scores['scoreMarket'],
            'scoreTenanDemand': scores['scoreTenanDemand'],
            'scoreEntitlement': scores['scoreEntitlement'],
            'compositeScore': scores['compositeScore'],
            'estimatedIrr': scores['estimatedIrr'],
            'acquisitionStrategy': scores['acquisitionStrategy'],
        }

        response = requests.put(url, json=update_data, timeout=10)

        if response.status_code == 200:
            print(f"[UPDATE] Property {property_id} scored: composite={scores['compositeScore']}")
            return True
        else:
            print(f"[ERROR] Failed to update property {property_id}: HTTP {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Error updating property {property_id}: {e}")
        return False


def main():
    """
    Main entry point for batch scoring all properties in the database.
    Fetches unscored properties, scores them, and updates the database.
    """
    from datetime import datetime
    from config import API_BASE

    print("=" * 60)
    print("Starting Property Scoring Pipeline")
    print(f"API Base: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)

    # For MVP, use a simple market data dict (could be enhanced with real data)
    market_data = {
        # Market data keys follow format: "City, State"
        # This is a placeholder - in production, fetch from external API
    }

    # Fetch properties from API
    print("\n[STEP 1] Fetching properties from API...")
    properties = fetch_properties_from_api(API_BASE)

    if not properties:
        print("[WARN] No properties found to score")
        return

    print(f"[SUCCESS] Fetched {len(properties)} properties")

    # Score all properties
    print("\n[STEP 2] Scoring all properties...")
    scored_properties = score_all_properties(properties, market_data)

    # Update scores in API
    print("\n[STEP 3] Updating property scores in API...")
    updated_count = 0
    failed_count = 0

    for scored_prop in scored_properties:
        if update_property_scores(
            API_BASE,
            scored_prop['id'],
            {
                'scoreDealQuality': scored_prop.get('scoreDealQuality'),
                'scoreMarket': scored_prop.get('scoreMarket'),
                'scoreTenanDemand': scored_prop.get('scoreTenanDemand'),
                'scoreEntitlement': scored_prop.get('scoreEntitlement'),
                'compositeScore': scored_prop.get('compositeScore'),
                'estimatedIrr': scored_prop.get('estimatedIrr'),
                'acquisitionStrategy': scored_prop.get('acquisitionStrategy'),
            }
        ):
            updated_count += 1
        else:
            failed_count += 1

    print("\n" + "=" * 60)
    print("Scoring Pipeline Complete")
    print(f"Properties Processed: {len(scored_properties)}")
    print(f"Successfully Updated: {updated_count}")
    print(f"Failed: {failed_count}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)


if __name__ == '__main__':
    main()
