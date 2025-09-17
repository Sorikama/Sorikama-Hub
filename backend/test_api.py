import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for API
BASE_URL = "http://localhost:8000/api"

# Test data
test_user = {
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
}

test_store = {
    "name": "Test Store",
    "domaine": "test-store",
    "description": "A test store for WebRichesse"
}

test_product = {
    "title": "Test Product",
    "description": "A test product for WebRichesse",
    "price": 19.99,
    "category": "digital",
    "type": "digital"
}

# Store tokens
access_token = None
refresh_token = None
user_id = None
store_id = None
product_id = None

def print_response(response, message):
    """Print response details"""
    print(f"\n--- {message} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print("-" * 50)
    return response.json() if response.status_code < 400 else None

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    return print_response(response, "Health Check")

def test_register():
    """Test user registration"""
    global access_token, refresh_token, user_id
    
    # Check if email is available
    response = requests.post(f"{BASE_URL}/auth/check-email", json={"email": test_user["email"]})
    result = print_response(response, "Check Email")
    
    if result and not result.get("available", False):
        print("Email already registered, trying login instead")
        return test_login()
    
    # Register user
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    result = print_response(response, "Register User")
    
    if result:
        access_token = result.get("access_token")
        refresh_token = result.get("refresh_token")
        user_id = result.get("user", {}).get("id")
        return True
    return False

def test_login():
    """Test user login"""
    global access_token, refresh_token, user_id
    
    response = requests.post(
        f"{BASE_URL}/auth/login", 
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    result = print_response(response, "Login User")
    
    if result:
        access_token = result.get("access_token")
        refresh_token = result.get("refresh_token")
        user_id = result.get("user", {}).get("id")
        return True
    return False

def test_get_current_user():
    """Test get current user endpoint"""
    global user_id
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    result = print_response(response, "Get Current User")
    
    if result:
        user_id = result.get("id")
        return True
    return False

def test_create_store():
    """Test create store endpoint"""
    global store_id
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/stores", json=test_store, headers=headers)
    result = print_response(response, "Create Store")
    
    if result:
        store_id = result.get("id")
        return True
    return False

def test_get_store():
    """Test get store endpoint"""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/stores/me", headers=headers)
    return print_response(response, "Get Store")

def test_create_product():
    """Test create product endpoint"""
    global product_id, store_id
    
    if not store_id:
        print("No store ID available, cannot create product")
        return False
    
    product_data = {**test_product, "storeId": store_id}
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/products", json=product_data, headers=headers)
    result = print_response(response, "Create Product")
    
    if result:
        product_id = result.get("id")
        return True
    return False

def test_get_products():
    """Test get products endpoint"""
    response = requests.get(f"{BASE_URL}/products")
    return print_response(response, "Get Products")

def test_get_store_products():
    """Test get store products endpoint"""
    if not store_id:
        print("No store ID available, cannot get store products")
        return False
    
    response = requests.get(f"{BASE_URL}/products/store/{store_id}")
    return print_response(response, "Get Store Products")

def test_refresh_token():
    """Test refresh token endpoint"""
    global access_token
    
    response = requests.post(
        f"{BASE_URL}/auth/refresh", 
        json={"refresh_token": refresh_token}
    )
    result = print_response(response, "Refresh Token")
    
    if result:
        access_token = result.get("access_token")
        return True
    return False

def run_tests():
    """Run all tests"""
    print("\n=== STARTING API TESTS ===\n")
    
    # Test health check
    test_health_check()
    
    # Test authentication
    if not test_register() and not test_login():
        print("Failed to authenticate, stopping tests")
        return
    
    # Test user info
    test_get_current_user()
    
    # Test store
    test_create_store()
    test_get_store()
    
    # Test products
    test_create_product()
    test_get_products()
    test_get_store_products()
    
    # Test token refresh
    test_refresh_token()
    
    print("\n=== API TESTS COMPLETED ===\n")

if __name__ == "__main__":
    run_tests()
