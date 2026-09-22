import os
import json
import requests

# 🔑 المفتاح موجود هنا مباشرة
API_KEY = 'pmx_b0bc47ca05c6dbc49dc14bb94be36b53'
headers = {'X-API-Key': API_KEY}

os.makedirs('data', exist_ok=True)

# جلب المخزون
try:
    res = requests.get('https://api.parse.bot/scraper/e534d388-6640-4c19-b9b6-b2ba12930793/get_stock', headers=headers)
    if res.status_code == 200:
        with open('data/stock.json', 'w') as f:
            json.dump(res.json(), f)
        print("Stock data saved.")
    else:
        print(f"Stock Error: {res.status_code}")
except Exception as e:
    print(f"Stock Exception: {e}")

# جلب القيم
try:
    res = requests.get('https://api.parse.bot/scraper/66e0bf14-56ac-462d-88c7-8469b6d631e9/get_all_fruits?category=all', headers=headers)
    if res.status_code == 200:
        with open('data/values.json', 'w') as f:
            json.dump(res.json(), f)
        print("Values data saved.")
    else:
        print(f"Values Error: {res.status_code}")
except Exception as e:
    print(f"Values Exception: {e}")
