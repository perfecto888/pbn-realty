import requests
import json
import time
from typing import List, Dict, Optional
from datetime import datetime
from urllib.parse import urlencode
from config import API_BASE, METROS_TO_SCRAPE

# User-Agent to avoid being blocked
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

REDFIN_API_URL = 'https://www.redfin.com/api/home/search/comps'


def scrape_redfin_commercial(state_code: str, metro: str) -> List[Dict]:
    """
    Scrapes Redfin Commercial listings for a specific metro.

    Args:
        state_code: Two-letter state code (e.g., 'CA')
        metro: Metro name (e.g., 'San Francisco Bay Area')

    Returns:
        List of property dictionaries with extracted data
    """
    properties = []

    try:
        # Build query parameters for Redfin API
        params = {
            'state': state_code,
            'search': metro,
            'type': 'commercial',
            'sort': 'price-desc'
        }

        headers = {
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
        }

        print(f"[SCRAPE] Fetching Redfin data for {metro}, {state_code}")
        response = requests.get(REDFIN_API_URL, params=params, headers=headers, timeout=30)
        response.raise_for_status()

        data = response.json()

        # Parse results from Redfin API
        if 'searchResults' in data:
            for result in data.get('searchResults', []):
                try:
                    # Extract fields from Redfin result
                    property_dict = {
                        'address': result.get('address'),
                        'city': result.get('city'),
                        'state': result.get('state'),
                        'zip': result.get('postalCode'),
                        'source': 'redfin',
                        'sourceUrl': f"https://www.redfin.com{result.get('url', '')}",
                    }

                    # Add optional fields if present
                    if result.get('latitude'):
                        property_dict['lat'] = result.get('latitude')
                    if result.get('longitude'):
                        property_dict['lon'] = result.get('longitude')
                    if result.get('price'):
                        property_dict['price'] = result.get('price')
                    if result.get('sqFt'):
                        property_dict['squareFeet'] = result.get('sqFt')
                    if result.get('yearBuilt'):
                        property_dict['yearBuilt'] = result.get('yearBuilt')
                    if result.get('propertyType'):
                        property_dict['propertyType'] = result.get('propertyType')
                    if result.get('currentCapRate') is not None:
                        property_dict['currentCapRate'] = result.get('currentCapRate')
                    if result.get('askingCapRate') is not None:
                        property_dict['askingCapRate'] = result.get('askingCapRate')
                    if result.get('daysOnMarket') is not None:
                        property_dict['daysOnMarket'] = result.get('daysOnMarket')
                    if result.get('listDate'):
                        property_dict['listDate'] = result.get('listDate')
                    if result.get('brokerContact'):
                        property_dict['brokerContact'] = result.get('brokerContact')

                    # Only add if it has required fields
                    if property_dict.get('address') and property_dict.get('city') and \
                       property_dict.get('state') and property_dict.get('zip'):
                        properties.append(property_dict)

                except (KeyError, TypeError) as e:
                    print(f"[WARN] Error parsing property result: {e}")
                    continue

        print(f"[SUCCESS] Scraped {len(properties)} properties from {metro}, {state_code}")
        return properties

    except requests.exceptions.ConnectionError as e:
        print(f"[ERROR] Connection error scraping {metro}, {state_code}: {e}")
        return []
    except requests.exceptions.Timeout as e:
        print(f"[ERROR] Timeout scraping {metro}, {state_code}: {e}")
        return []
    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] HTTP error scraping {metro}, {state_code}: {e}")
        if 'rate limit' in str(e).lower() or response.status_code == 429:
            print("[WARN] Rate limit detected - may need to implement backoff")
        return []
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON response from {metro}, {state_code}: {e}")
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected error scraping {metro}, {state_code}: {e}")
        return []


def save_properties_to_api(properties: List[Dict]) -> int:
    """
    POSTs each property to the API for storage.

    Args:
        properties: List of property dictionaries to save

    Returns:
        Number of properties successfully saved
    """
    saved_count = 0

    if not properties:
        print("[INFO] No properties to save")
        return 0

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
    }

    for prop in properties:
        try:
            api_url = f"{API_BASE}/api/properties"
            print(f"[POST] Saving property: {prop.get('address')}, {prop.get('city')}")

            response = requests.post(api_url, json=prop, headers=headers, timeout=10)

            if response.status_code in [200, 201]:
                print(f"[SUCCESS] Property saved: {prop.get('address')}")
                saved_count += 1
            elif response.status_code == 400:
                print(f"[ERROR] Bad request for {prop.get('address')}: {response.json().get('error')}")
            elif response.status_code == 500:
                print(f"[ERROR] Server error saving {prop.get('address')}: {response.json().get('error')}")
            else:
                print(f"[ERROR] Unexpected status {response.status_code} for {prop.get('address')}")

        except requests.exceptions.ConnectionError as e:
            print(f"[ERROR] Connection error saving property {prop.get('address')}: {e}")
        except requests.exceptions.Timeout as e:
            print(f"[ERROR] Timeout saving property {prop.get('address')}: {e}")
        except Exception as e:
            print(f"[ERROR] Unexpected error saving property {prop.get('address')}: {e}")

        # Small delay between requests to be respectful
        time.sleep(0.5)

    print(f"[SUMMARY] Successfully saved {saved_count}/{len(properties)} properties")
    return saved_count


def main():
    """
    Orchestrates scraping for major US metros and saves results to API.
    """
    print("=" * 60)
    print("Starting Redfin Commercial Scraper")
    print(f"API Base: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)

    total_scraped = 0
    total_saved = 0

    for state_code, metro in METROS_TO_SCRAPE:
        try:
            print(f"\n[STARTING] {metro}, {state_code}")

            # Scrape Redfin for this metro
            properties = scrape_redfin_commercial(state_code, metro)
            total_scraped += len(properties)

            # Save to API
            saved = save_properties_to_api(properties)
            total_saved += saved

            # Rate limiting: Redfin may have rate limits, add delay between metros
            time.sleep(2)

        except Exception as e:
            print(f"[ERROR] Unexpected error for {metro}, {state_code}: {e}")
            continue

    print("\n" + "=" * 60)
    print("Scraper Complete")
    print(f"Total Properties Scraped: {total_scraped}")
    print(f"Total Properties Saved: {total_saved}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)


if __name__ == '__main__':
    main()
