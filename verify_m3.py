import requests
import json
import os

BASE_URL = "http://localhost:3000/api"

def test_health():
    print("Testing API Health...")
    try:
        res = requests.get(f"{BASE_URL}/agents")
        print(f"Agents endpoint: {res.status_code}")
        return res.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_analytics():
    print("\nTesting Analytics Endpoint...")
    res = requests.get(f"{BASE_URL}/analytics")
    print(f"Analytics Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Stats keys: {data.keys()}")
        print(f"Trend data points: {len(data.get('trend', []))}")

def test_rag_audit():
    print("\nTesting RAG Audit Endpoint...")
    payload = {
        "transcript": "Hello, I want a refund for my order #123. The item was damaged."
    }
    res = requests.post(f"{BASE_URL}/audit-with-rag", json=payload)
    print(f"RAG Audit Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"RAG Suggestions: {data.get('suggestions')[:100]}...")
        print(f"Sources found: {len(data.get('sources', []))}")

if __name__ == "__main__":
    if test_health():
        test_analytics()
        test_rag_audit()
    else:
        print("Backend server not running or unreachable at http://localhost:3000")
