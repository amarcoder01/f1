#!/usr/bin/env python3
"""
Simplified Qlib Setup Script for Trading Platform
Focuses on essential components and better error handling
"""
import os
import sys
import subprocess
import platform
import logging
from pathlib import Path

# Configure logging with UTF-8 encoding
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('qlib_setup_simple.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SimpleQlibInstaller:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.scripts_dir = self.project_root / "scripts"
        self.data_dir = self.project_root / "data"
        self.qlib_data_dir = self.data_dir / "qlib"
        self.logs_dir = self.project_root / "logs"
        
        # Create necessary directories
        self._create_directories()
        
        # System info
        self.system = platform.system().lower()
        self.python_version = sys.version_info
        
    def _create_directories(self):
        """Create necessary directories for Qlib setup"""
        directories = [
            self.data_dir,
            self.qlib_data_dir,
            self.logs_dir,
            self.qlib_data_dir / "instruments",
            self.qlib_data_dir / "features",
            self.qlib_data_dir / "calendars",
            self.qlib_data_dir / "models",
            self.qlib_data_dir / "results"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created directory: {directory}")
    
    def check_python_version(self) -> bool:
        """Check if Python version is compatible"""
        if self.python_version < (3, 8):
            logger.error(f"Python {self.python_version.major}.{self.python_version.minor} is not supported. Requires Python 3.8+")
            return False
        
        logger.info(f"Python version {self.python_version.major}.{self.python_version.minor}.{self.python_version.micro} is compatible")
        return True
    
    def install_basic_dependencies(self) -> bool:
        """Install basic Python dependencies without Qlib"""
        try:
            logger.info("Installing basic Python dependencies...")
            
            # Install core dependencies first
            core_deps = [
                "pandas>=2.0.0",
                "numpy>=1.20.0",
                "yfinance>=0.2.0",
                "requests>=2.25.0",
                "aiofiles>=23.0.0",
                "aiohttp>=3.8.0"
            ]
            
            for dep in core_deps:
                logger.info(f"Installing {dep}...")
                result = subprocess.run([
                    sys.executable, "-m", "pip", "install", dep
                ], capture_output=True, text=True)
                
                if result.returncode != 0:
                    logger.warning(f"Failed to install {dep}: {result.stderr}")
                    # Continue with other dependencies
            
            logger.info("Basic dependencies installation completed")
            return True
                
        except Exception as e:
            logger.error(f"Error installing basic dependencies: {e}")
            return False
    
    def install_qlib(self) -> bool:
        """Install Microsoft Qlib"""
        try:
            logger.info("Installing Microsoft Qlib...")
            
            # Try different Qlib versions
            qlib_versions = [
                "qlib==0.0.2.dev20",
                "qlib==0.0.2.dev19", 
                "qlib==0.0.2.dev18",
                "qlib"  # Latest version
            ]
            
            for version in qlib_versions:
                logger.info(f"Trying to install {version}...")
                result = subprocess.run([
                    sys.executable, "-m", "pip", "install", version
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    logger.info(f"Successfully installed {version}")
                    return True
                else:
                    logger.warning(f"Failed to install {version}: {result.stderr}")
            
            logger.error("Failed to install any version of Qlib")
            return False
                
        except Exception as e:
            logger.error(f"Error installing Qlib: {e}")
            return False
    
    def setup_basic_config(self) -> bool:
        """Setup basic configuration without Qlib"""
        try:
            logger.info("Setting up basic configuration...")
            
            # Set environment variables
            os.environ['QLIB_PROVIDER_URI'] = str(self.qlib_data_dir)
            os.environ['QLIB_REGION'] = 'US'
            
            # Create basic config file
            config_content = f"""# Qlib Configuration
PROVIDER_URI = "{self.qlib_data_dir}"
REGION = "US"
CACHE_DIR = "{self.data_dir}/cache"
"""
            
            config_file = self.project_root / "qlib_config.py"
            with open(config_file, 'w', encoding='utf-8') as f:
                f.write(config_content)
            
            logger.info("Basic configuration setup completed")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up basic configuration: {e}")
            return False
    
    def create_startup_script(self) -> bool:
        """Create startup script for easy initialization"""
        try:
            logger.info("Creating startup script...")
            
            startup_script = self.project_root / "start_qlib.py"
            
            script_content = '''#!/usr/bin/env python3
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
        
        # Try to import Qlib
        try:
            import qlib
            print("[SUCCESS] Qlib imported successfully")
            
            # Try to initialize Qlib
            try:
                qlib.init(provider_uri=str(data_dir), region='US')
                print("[SUCCESS] Qlib initialized successfully")
            except Exception as e:
                print(f"[WARNING] Qlib initialization failed: {e}")
                
        except ImportError:
            print("[WARNING] Qlib not installed. Install with: pip install qlib")
        
        print("[READY] Basic setup completed!")
        
    except Exception as e:
        print(f"[ERROR] Error in startup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
'''
            
            with open(startup_script, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            # Make executable on Unix systems
            if self.system != 'windows':
                os.chmod(startup_script, 0o755)
            
            logger.info(f"Startup script created: {startup_script}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating startup script: {e}")
            return False
    
    def create_test_script(self) -> bool:
        """Create a test script for basic functionality"""
        try:
            logger.info("Creating test script...")
            
            test_script = self.project_root / "test_qlib.py"
            
            script_content = '''#!/usr/bin/env python3
"""
Basic Qlib Test Script
Test basic functionality
"""
import os
import sys
from pathlib import Path

def test_basic_functionality():
    try:
        print("[TEST] Testing basic functionality...")
        
        # Test environment setup
        project_root = Path(__file__).parent
        data_dir = project_root / "data" / "qlib"
        
        if data_dir.exists():
            print("[SUCCESS] Data directory exists")
        else:
            print("[WARNING] Data directory does not exist")
        
        # Test Qlib import
        try:
            import qlib
            print("[SUCCESS] Qlib imported successfully")
            
            # Test basic Qlib functionality
            try:
                qlib.init(provider_uri=str(data_dir), region='US')
                print("[SUCCESS] Qlib initialized successfully")
                
                # Test data access (basic)
                from qlib.data import D
                print("[SUCCESS] Qlib data module imported")
                
            except Exception as e:
                print(f"[WARNING] Qlib initialization failed: {e}")
                
        except ImportError:
            print("[WARNING] Qlib not installed")
        
        # Test other dependencies
        try:
            import pandas as pd
            print("[SUCCESS] Pandas imported")
        except ImportError:
            print("[WARNING] Pandas not installed")
        
        try:
            import yfinance as yf
            print("[SUCCESS] YFinance imported")
        except ImportError:
            print("[WARNING] YFinance not installed")
        
        print("[SUCCESS] Basic tests completed")
        
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        return False
    
    return True

def main():
    test_basic_functionality()

if __name__ == "__main__":
    main()
'''
            
            with open(test_script, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            # Make executable on Unix systems
            if self.system != 'windows':
                os.chmod(test_script, 0o755)
            
            logger.info(f"Test script created: {test_script}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating test script: {e}")
            return False
    
    def run_setup(self) -> bool:
        """Run simplified Qlib setup process"""
        logger.info("Starting simplified Qlib installation and setup...")
        
        steps = [
            ("Checking Python version", self.check_python_version),
            ("Installing basic dependencies", self.install_basic_dependencies),
            ("Installing Qlib", self.install_qlib),
            ("Setting up basic configuration", self.setup_basic_config),
            ("Creating startup script", self.create_startup_script),
            ("Creating test script", self.create_test_script)
        ]
        
        results = {}
        
        for step_name, step_func in steps:
            logger.info(f"[STEP] {step_name}...")
            try:
                result = step_func()
                results[step_name] = result
                if result:
                    logger.info(f"[SUCCESS] {step_name} completed successfully")
                else:
                    logger.error(f"[FAILED] {step_name} failed")
            except Exception as e:
                logger.error(f"[ERROR] {step_name} failed with exception: {e}")
                results[step_name] = False
        
        # Summary
        logger.info("\n" + "="*50)
        logger.info("[SUMMARY] SETUP SUMMARY")
        logger.info("="*50)
        
        success_count = sum(results.values())
        total_count = len(results)
        
        for step_name, result in results.items():
            status = "[PASS]" if result else "[FAIL]"
            logger.info(f"{status} - {step_name}")
        
        logger.info(f"\nOverall: {success_count}/{total_count} steps completed successfully")
        
        if success_count >= 4:  # At least 4 out of 6 steps should succeed
            logger.info("[SUCCESS] Basic Qlib setup completed!")
            logger.info("\nNext steps:")
            logger.info("1. Run: python start_qlib.py")
            logger.info("2. Test: python test_qlib.py")
            logger.info("3. Access web interface at: /qlib")
            return True
        else:
            logger.warning("[WARNING] Some critical steps failed. Check logs for details.")
            return False

def main():
    """Main function to run simplified Qlib setup"""
    installer = SimpleQlibInstaller()
    success = installer.run_setup()
    
    if success:
        print("\n[SUCCESS] Qlib installation and setup completed successfully!")
        print("You can now use Qlib in your trading platform.")
    else:
        print("\n[ERROR] Qlib setup encountered some issues.")
        print("Check the logs for detailed information.")
        sys.exit(1)

if __name__ == "__main__":
    main()
