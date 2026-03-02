#!/usr/bin/env python3
"""
Simple server starter for Bazzite Linux
"""

import sys
import os

def check_dependencies():
    """Check if required packages are available"""
    required = ['fastapi', 'uvicorn', 'pydantic', 'pydantic_settings', 'sqlalchemy']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"✅ {package} - OK")
        except ImportError:
            print(f"❌ {package} - MISSING")
            missing.append(package)
    
    return missing

def main():
    """Start the server"""
    print("🔍 Checking dependencies...")
    missing = check_dependencies()
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("💡 Run: python3 install_deps.py")
        return False
    
    print("\n🚀 Starting Primal Fear Dex API...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Import and run the app
        from main import app
        import uvicorn
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
