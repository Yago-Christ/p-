#!/usr/bin/env python3
"""
Manual dependency installation script for Bazzite Linux
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}")
        return False

def main():
    """Install all required packages"""
    packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "pydantic==2.5.0",
        "pydantic-settings==2.1.0",
        "sqlalchemy==2.0.23",
        "alembic==1.13.0",
        "python-multipart==0.0.6",
        "httpx==0.25.2",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-dotenv==1.0.0",
        "pytest==7.4.3",
        "pytest-asyncio==0.21.1",
        "pytest-cov==4.1.0"
    ]
    
    print("🚀 Installing dependencies for Primal Fear Dex Backend...")
    print("=" * 60)
    
    failed_packages = []
    
    for package in packages:
        if not install_package(package):
            failed_packages.append(package)
    
    print("=" * 60)
    
    if failed_packages:
        print(f"❌ {len(failed_packages)} packages failed to install:")
        for pkg in failed_packages:
            print(f"   - {pkg}")
        print("\n💡 Try installing them manually:")
        for pkg in failed_packages:
            print(f"   pip install {pkg}")
    else:
        print("✅ All packages installed successfully!")
        print("🎉 Backend is ready to run!")
        print("\nRun: python3 main.py")

if __name__ == "__main__":
    main()
