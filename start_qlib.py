#!/usr/bin/env python3
"""
Qlib Startup Script for Trading Platform
Quick initialization and status check
"""
import os
import sys
from pathlib import Path

def main():
    try:
        # Set environment variables
        project_root = Path(__file__).parent
        data_dir = project_root / "data" / "qlib"
        
        os.environ['QLIB_PROVIDER_URI'] = str(data_dir)
        os.environ['QLIB_REGION'] = 'US'
        
        print("[SUCCESS] Environment variables set")
        print(f"[INFO] Data directory: {data_dir}")
        print(f"[INFO] Region: US")
        
        # Try to import Custom Qlib
        try:
            import sys
            sys.path.append(str(project_root / "scripts"))
            from custom_qlib import init as custom_qlib_init
            print("[SUCCESS] Custom Qlib imported successfully")
            
            # Try to initialize Custom Qlib
            try:
                qlib_instance = custom_qlib_init(provider_uri=str(data_dir), region='US')
                print("[SUCCESS] Custom Qlib initialized successfully")
            except Exception as e:
                print(f"[WARNING] Custom Qlib initialization failed: {e}")
                
        except ImportError:
            print("[WARNING] Custom Qlib not found. Check scripts/custom_qlib.py")
        
        print("[READY] Basic setup completed!")
        
    except Exception as e:
        print(f"[ERROR] Error in startup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
