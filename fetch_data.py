import os
import json
import requests

API_KEY = os.environ.get('PARSE_API_KEY')
headers = {'X-API-Key': API_KEY}

# جلب المخزون
try:
    res = requests.get('https://api.parse.bot/scraper/e534d388-6640-4c19-b9b6-b2ba12930793/get_stock', headers=headers)
    if res.status_code == 200:
        os.makedirs('data', exist_ok=True)
        with open('data/stock.json', 'w') as f:
            json.dump(res.json(), f)
        print("Stock data fetched successfully.")
    else:
        print(f"Stock Error: {res.status_code}")
except Exception as e:
    print(f"Stock Exception: {e}")

# جلب القيم
try:
    res = requests.get('https://api.parse.bot/scraper/66e0bf14-56ac-462d-88c7-8469b6d631e9/get_all_fruits?category=all', headers=headers)
    if res.status_code == 200:
        os.makedirs('data', exist_ok=True)
        with open('data/values.json', 'w') as f:
            json.dump(res.json(), f)
        print("Values data fetched successfully.")
    else:
        print(f"Values Error: {res.status_code}")
except Exception as e:
    print(f"Values Exception: {e}")
