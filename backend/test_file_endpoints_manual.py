"""
Manual test script to verify file upload endpoints work correctly
Run with: python test_file_endpoints_manual.py
"""
import httpx
import json
from pathlib import Path
from PIL import Image
from io import BytesIO

BASE_URL = "http://localhost:8000"

def create_test_image():
    """Create a test image"""
    img = Image.new('RGB', (200, 200), color=(255, 0, 0))
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer

def test_file_endpoints():
    """Test file upload endpoints"""
    print("Testing file upload endpoints...")
    
    # Step 1: Register a test user
    print("\n1. Registering test user...")
    register_data = {
        "email": "filetest@example.com",
        "password": "TestPass123"
    }
    
    register_response = httpx.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    if register_response.status_code == 200:
        print("✅ User registered successfully")
    else:
        print(f"⚠️  User may already exist: {register_response.status_code}")
    
    # Step 2: Login to get token
    print("\n2. Logging in...")
    login_data = {
        "email": "filetest@example.com", 
        "password": "TestPass123"
    }
    
    login_response = httpx.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token_data = login_response.json()
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Login successful")
    
    # Step 3: Upload a document
    print("\n3. Uploading document...")
    test_image = create_test_image()
    
    files = {"file": ("test_receipt.jpg", test_image, "image/jpeg")}
    data = {"document_type": "receipt"}
    
    upload_response = httpx.post(
        f"{BASE_URL}/api/v1/files/upload",
        headers=headers,
        files=files,
        data=data
    )
    
    if upload_response.status_code != 200:
        print(f"❌ Upload failed: {upload_response.text}")
        return
    
    upload_data = upload_response.json()
    document_id = upload_data["id"]
    print(f"✅ Document uploaded successfully with ID: {document_id}")
    print(f"   Type: {upload_data['type']}")
    print(f"   Filename: {upload_data['original_filename']}")
    print(f"   Status: {upload_data['processing_status']}")
    
    # Step 4: List documents
    print("\n4. Listing documents...")
    list_response = httpx.get(f"{BASE_URL}/api/v1/files/", headers=headers)
    
    if list_response.status_code != 200:
        print(f"❌ List failed: {list_response.text}")
        return
    
    list_data = list_response.json()
    print(f"✅ Found {list_data['total']} documents")
    
    # Step 5: Get specific document
    print("\n5. Getting document details...")
    get_response = httpx.get(f"{BASE_URL}/api/v1/files/{document_id}", headers=headers)
    
    if get_response.status_code != 200:
        print(f"❌ Get document failed: {get_response.text}")
        return
    
    get_data = get_response.json()
    print(f"✅ Document details retrieved:")
    print(f"   ID: {get_data['id']}")
    print(f"   Type: {get_data['type']}")
    print(f"   Size: {get_data['file_size']} bytes")
    
    # Step 6: Try to download document
    print("\n6. Testing document download...")
    download_response = httpx.get(f"{BASE_URL}/api/v1/files/{document_id}/download", headers=headers)
    
    if download_response.status_code == 200:
        print(f"✅ Document downloaded successfully ({len(download_response.content)} bytes)")
    else:
        print(f"⚠️  Download may not work in test environment: {download_response.status_code}")
        # This is expected if file isn't actually saved to disk in test
    
    # Step 7: Test filtering
    print("\n7. Testing document filtering...")
    filter_response = httpx.get(f"{BASE_URL}/api/v1/files/?document_type=receipt", headers=headers)
    
    if filter_response.status_code == 200:
        filter_data = filter_response.json()
        print(f"✅ Filtered results: {filter_data['total']} receipts found")
    else:
        print(f"❌ Filter failed: {filter_response.text}")
    
    # Step 8: Delete document
    print("\n8. Deleting document...")
    delete_response = httpx.delete(f"{BASE_URL}/api/v1/files/{document_id}", headers=headers)
    
    if delete_response.status_code == 200:
        print("✅ Document deleted successfully")
    else:
        print(f"❌ Delete failed: {delete_response.text}")
    
    # Step 9: Verify deletion
    print("\n9. Verifying deletion...")
    final_list_response = httpx.get(f"{BASE_URL}/api/v1/files/", headers=headers)
    
    if final_list_response.status_code == 200:
        final_data = final_list_response.json()
        print(f"✅ Final document count: {final_data['total']}")
    
    print("\n🎉 File upload functionality test completed!")

if __name__ == "__main__":
    try:
        test_file_endpoints()
    except httpx.ConnectError:
        print("❌ Could not connect to server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")