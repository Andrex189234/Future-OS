#!/usr/bin/env python3
"""
FutureOS Backend API Test Suite
Tests all backend APIs for the FutureOS simulated operating system
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend env
BACKEND_URL = "https://6860d82e-d131-4e5a-9f58-503bd41776ea.preview.emergentagent.com/api"

class FutureOSAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "FutureOS API" in data.get("message", ""):
                    self.log_test("API Root", True, "API root accessible")
                    return True
                else:
                    self.log_test("API Root", False, f"Unexpected response: {data}")
            else:
                self.log_test("API Root", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
        return False
    
    def test_settings_api(self):
        """Test Settings API endpoints"""
        print("\n=== Testing Settings API ===")
        
        # Test GET /api/settings/
        try:
            response = self.session.get(f"{self.base_url}/settings/")
            if response.status_code == 200:
                settings = response.json()
                required_fields = ["user_id", "language", "theme", "first_run"]
                if all(field in settings for field in required_fields):
                    self.log_test("Settings GET", True, "Retrieved user settings successfully")
                else:
                    self.log_test("Settings GET", False, f"Missing required fields in response: {settings}")
            else:
                self.log_test("Settings GET", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Settings GET", False, f"Error: {str(e)}")
        
        # Test POST /api/settings/ (update settings)
        try:
            update_data = {
                "language": "en",
                "theme": "light",
                "notifications": False
            }
            response = self.session.post(f"{self.base_url}/settings/", json=update_data)
            if response.status_code == 200:
                updated_settings = response.json()
                if updated_settings.get("language") == "en" and updated_settings.get("theme") == "light":
                    self.log_test("Settings POST", True, "Updated settings successfully")
                else:
                    self.log_test("Settings POST", False, f"Settings not updated correctly: {updated_settings}")
            else:
                self.log_test("Settings POST", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Settings POST", False, f"Error: {str(e)}")
        
        # Test GET /api/settings/system-info
        try:
            response = self.session.get(f"{self.base_url}/settings/system-info")
            if response.status_code == 200:
                system_info = response.json()
                required_fields = ["os_name", "version", "uptime"]
                if all(field in system_info for field in required_fields):
                    self.log_test("System Info GET", True, "Retrieved system info successfully")
                else:
                    self.log_test("System Info GET", False, f"Missing fields in system info: {system_info}")
            else:
                self.log_test("System Info GET", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("System Info GET", False, f"Error: {str(e)}")
        
        # Test POST /api/settings/setup-complete
        try:
            response = self.session.post(f"{self.base_url}/settings/setup-complete?language=it")
            if response.status_code == 200:
                result = response.json()
                if "Setup completato" in result.get("message", ""):
                    self.log_test("Setup Complete POST", True, "Setup completion successful")
                else:
                    self.log_test("Setup Complete POST", False, f"Unexpected response: {result}")
            else:
                self.log_test("Setup Complete POST", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Setup Complete POST", False, f"Error: {str(e)}")
    
    def test_filesystem_api(self):
        """Test FileSystem API endpoints"""
        print("\n=== Testing FileSystem API ===")
        
        # Test GET /api/filesystem/?path=/
        try:
            response = self.session.get(f"{self.base_url}/filesystem/?path=/")
            if response.status_code == 200:
                items = response.json()
                if isinstance(items, list) and len(items) > 0:
                    self.log_test("FileSystem GET Root", True, f"Retrieved {len(items)} root items")
                else:
                    self.log_test("FileSystem GET Root", False, f"No items in root directory: {items}")
            else:
                self.log_test("FileSystem GET Root", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem GET Root", False, f"Error: {str(e)}")
        
        # Test GET /api/filesystem/item?path=/home/user
        try:
            response = self.session.get(f"{self.base_url}/filesystem/item?path=/home/user")
            if response.status_code == 200:
                item = response.json()
                if item.get("type") == "folder" and item.get("name") == "user":
                    self.log_test("FileSystem GET Item", True, "Retrieved specific item successfully")
                else:
                    self.log_test("FileSystem GET Item", False, f"Unexpected item data: {item}")
            else:
                self.log_test("FileSystem GET Item", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem GET Item", False, f"Error: {str(e)}")
        
        # Test POST /api/filesystem/ (create new file)
        try:
            new_file = {
                "name": "test_file.txt",
                "type": "file",
                "path": "/home/user/test_file.txt",
                "parent_path": "/home/user",
                "content": "This is a test file created by the API test suite."
            }
            response = self.session.post(f"{self.base_url}/filesystem/", json=new_file)
            if response.status_code == 200:
                created_file = response.json()
                if created_file.get("name") == "test_file.txt":
                    self.log_test("FileSystem POST Create", True, "Created new file successfully")
                else:
                    self.log_test("FileSystem POST Create", False, f"File not created correctly: {created_file}")
            else:
                self.log_test("FileSystem POST Create", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem POST Create", False, f"Error: {str(e)}")
        
        # Test PUT /api/filesystem/home/user/test_file.txt (update file)
        try:
            update_data = {
                "content": "Updated content for the test file."
            }
            response = self.session.put(f"{self.base_url}/filesystem/home/user/test_file.txt", json=update_data)
            if response.status_code == 200:
                updated_file = response.json()
                if "Updated content" in updated_file.get("content", ""):
                    self.log_test("FileSystem PUT Update", True, "Updated file successfully")
                else:
                    self.log_test("FileSystem PUT Update", False, f"File not updated correctly: {updated_file}")
            else:
                self.log_test("FileSystem PUT Update", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem PUT Update", False, f"Error: {str(e)}")
        
        # Test GET /api/filesystem/tree
        try:
            response = self.session.get(f"{self.base_url}/filesystem/tree")
            if response.status_code == 200:
                tree = response.json()
                if isinstance(tree, dict) and "/" in tree:
                    self.log_test("FileSystem GET Tree", True, "Retrieved filesystem tree successfully")
                else:
                    self.log_test("FileSystem GET Tree", False, f"Invalid tree structure: {tree}")
            else:
                self.log_test("FileSystem GET Tree", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem GET Tree", False, f"Error: {str(e)}")
        
        # Test DELETE /api/filesystem/home/user/test_file.txt
        try:
            response = self.session.delete(f"{self.base_url}/filesystem/home/user/test_file.txt")
            if response.status_code == 200:
                result = response.json()
                if "eliminato con successo" in result.get("message", ""):
                    self.log_test("FileSystem DELETE", True, "Deleted file successfully")
                else:
                    self.log_test("FileSystem DELETE", False, f"Unexpected delete response: {result}")
            else:
                self.log_test("FileSystem DELETE", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("FileSystem DELETE", False, f"Error: {str(e)}")
    
    def test_terminal_api(self):
        """Test Terminal API endpoints"""
        print("\n=== Testing Terminal API ===")
        
        # Test GET /api/terminal/history
        try:
            response = self.session.get(f"{self.base_url}/terminal/history")
            if response.status_code == 200:
                history = response.json()
                if isinstance(history, list):
                    self.log_test("Terminal GET History", True, f"Retrieved {len(history)} history entries")
                else:
                    self.log_test("Terminal GET History", False, f"Invalid history format: {history}")
            else:
                self.log_test("Terminal GET History", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Terminal GET History", False, f"Error: {str(e)}")
        
        # Test POST /api/terminal/history
        try:
            history_entry = {
                "command": "test_command",
                "output": "test output",
                "directory": "/home/user"
            }
            response = self.session.post(f"{self.base_url}/terminal/history", json=history_entry)
            if response.status_code == 200:
                created_entry = response.json()
                if created_entry.get("command") == "test_command":
                    self.log_test("Terminal POST History", True, "Added history entry successfully")
                else:
                    self.log_test("Terminal POST History", False, f"History entry not created correctly: {created_entry}")
            else:
                self.log_test("Terminal POST History", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Terminal POST History", False, f"Error: {str(e)}")
        
        # Test terminal commands
        commands_to_test = [
            ("ls", "/home/user"),
            ("pwd", "/home/user"),
            ("mkdir test_dir", "/home/user"),
            ("cd test_dir", "/home/user"),
            ("touch test.txt", "/home/user/test_dir"),
            ("cat ../Documents/welcome.txt", "/home/user"),
            ("help", "/home/user"),
            ("whoami", "/home/user"),
            ("date", "/home/user"),
            ("uname -a", "/home/user")
        ]
        
        for command, directory in commands_to_test:
            try:
                params = {"command": command, "current_directory": directory}
                response = self.session.post(f"{self.base_url}/terminal/execute", params=params)
                if response.status_code == 200:
                    result = response.json()
                    if "command" in result and "output" in result:
                        self.log_test(f"Terminal Execute '{command}'", True, f"Command executed successfully")
                    else:
                        self.log_test(f"Terminal Execute '{command}'", False, f"Invalid execute response: {result}")
                else:
                    self.log_test(f"Terminal Execute '{command}'", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test(f"Terminal Execute '{command}'", False, f"Error: {str(e)}")
        
        # Test DELETE /api/terminal/history
        try:
            response = self.session.delete(f"{self.base_url}/terminal/history")
            if response.status_code == 200:
                result = response.json()
                if "Cronologia pulita" in result.get("message", ""):
                    self.log_test("Terminal DELETE History", True, "Cleared history successfully")
                else:
                    self.log_test("Terminal DELETE History", False, f"Unexpected clear response: {result}")
            else:
                self.log_test("Terminal DELETE History", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Terminal DELETE History", False, f"Error: {str(e)}")
    
    def test_notepad_api(self):
        """Test Notepad API endpoints"""
        print("\n=== Testing Notepad API ===")
        
        # Test GET /api/notepad/files
        try:
            response = self.session.get(f"{self.base_url}/notepad/files")
            if response.status_code == 200:
                files = response.json()
                if isinstance(files, list):
                    self.log_test("Notepad GET Files", True, f"Retrieved {len(files)} notepad files")
                else:
                    self.log_test("Notepad GET Files", False, f"Invalid files format: {files}")
            else:
                self.log_test("Notepad GET Files", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad GET Files", False, f"Error: {str(e)}")
        
        # Test POST /api/notepad/files (create new file)
        try:
            new_notepad_file = {
                "name": "test_note.txt",
                "content": "This is a test note created by the API test suite.",
                "path": "/home/user/Documents/test_note.txt"
            }
            response = self.session.post(f"{self.base_url}/notepad/files", json=new_notepad_file)
            if response.status_code == 200:
                created_file = response.json()
                if created_file.get("name") == "test_note.txt":
                    self.log_test("Notepad POST Create", True, "Created notepad file successfully")
                else:
                    self.log_test("Notepad POST Create", False, f"File not created correctly: {created_file}")
            else:
                self.log_test("Notepad POST Create", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad POST Create", False, f"Error: {str(e)}")
        
        # Test GET /api/notepad/files/test_note.txt
        try:
            response = self.session.get(f"{self.base_url}/notepad/files/test_note.txt")
            if response.status_code == 200:
                file_data = response.json()
                if file_data.get("name") == "test_note.txt":
                    self.log_test("Notepad GET Specific File", True, "Retrieved specific notepad file successfully")
                else:
                    self.log_test("Notepad GET Specific File", False, f"Unexpected file data: {file_data}")
            else:
                self.log_test("Notepad GET Specific File", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad GET Specific File", False, f"Error: {str(e)}")
        
        # Test PUT /api/notepad/files/test_note.txt
        try:
            update_data = {
                "content": "Updated content for the test note."
            }
            response = self.session.put(f"{self.base_url}/notepad/files/test_note.txt", json=update_data)
            if response.status_code == 200:
                updated_file = response.json()
                if "Updated content" in updated_file.get("content", ""):
                    self.log_test("Notepad PUT Update", True, "Updated notepad file successfully")
                else:
                    self.log_test("Notepad PUT Update", False, f"File not updated correctly: {updated_file}")
            else:
                self.log_test("Notepad PUT Update", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad PUT Update", False, f"Error: {str(e)}")
        
        # Test POST /api/notepad/files/test_note.txt/save
        try:
            save_content = "Content saved via save endpoint."
            params = {"content": save_content}
            response = self.session.post(f"{self.base_url}/notepad/files/test_note.txt/save", params=params)
            if response.status_code == 200:
                saved_file = response.json()
                if save_content in saved_file.get("content", ""):
                    self.log_test("Notepad POST Save", True, "Saved notepad file successfully")
                else:
                    self.log_test("Notepad POST Save", False, f"File not saved correctly: {saved_file}")
            else:
                self.log_test("Notepad POST Save", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad POST Save", False, f"Error: {str(e)}")
        
        # Test DELETE /api/notepad/files/test_note.txt
        try:
            response = self.session.delete(f"{self.base_url}/notepad/files/test_note.txt")
            if response.status_code == 200:
                result = response.json()
                if "eliminato con successo" in result.get("message", ""):
                    self.log_test("Notepad DELETE", True, "Deleted notepad file successfully")
                else:
                    self.log_test("Notepad DELETE", False, f"Unexpected delete response: {result}")
            else:
                self.log_test("Notepad DELETE", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Notepad DELETE", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting FutureOS Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test API connectivity first
        if not self.test_api_root():
            print("❌ Cannot connect to API. Stopping tests.")
            return False
        
        # Run all test suites
        self.test_settings_api()
        self.test_filesystem_api()
        self.test_terminal_api()
        self.test_notepad_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = FutureOSAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)