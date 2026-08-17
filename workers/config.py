import os

# API Configuration
API_BASE = os.getenv('API_BASE', 'http://localhost:3000')

# List of metros to scrape: (state_code, metro_name)
METROS_TO_SCRAPE = [
    ('CA', 'San Francisco Bay Area'),
    ('CA', 'Los Angeles'),
    ('CA', 'San Diego'),
    ('NY', 'New York City'),
    ('NY', 'Buffalo'),
    ('TX', 'Austin'),
    ('TX', 'Houston'),
    ('TX', 'Dallas'),
    ('CO', 'Denver'),
    ('WA', 'Seattle'),
    ('IL', 'Chicago'),
    ('FL', 'Miami'),
    ('FL', 'Tampa'),
    ('AZ', 'Phoenix'),
]
