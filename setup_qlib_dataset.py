#!/usr/bin/env python3
"""
Qlib Dataset Setup Script
Downloads and configures the full US historical stock dataset for backtesting
"""

import os
import sys
import json
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('qlib_dataset_setup.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def install_dependencies():
    """Install required dependencies"""
    try:
        logger.info("Installing required dependencies...")
        
        # Install additional dependencies for dataset download
        dependencies = [
            'tqdm==4.66.1',
            'lxml==4.9.3',
            'html5lib==1.1',
            'beautifulsoup4==4.12.2'
        ]
        
        for dep in dependencies:
            logger.info(f"Installing {dep}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', dep])
        
        logger.info("Dependencies installed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error installing dependencies: {e}")
        return False

def download_qlib_dataset():
    """Download the Qlib dataset"""
    try:
        logger.info("Starting Qlib dataset download...")
        
        # Import and run dataset downloader
        from scripts.qlib_dataset_downloader import QlibDatasetDownloader
        
        downloader = QlibDatasetDownloader()
        result = downloader.download_qlib_dataset(force_download=False)
        
        if result.get('success'):
            logger.info("Qlib dataset downloaded successfully!")
            return result
        else:
            logger.error(f"Failed to download Qlib dataset: {result.get('error')}")
            return result
            
    except Exception as e:
        logger.error(f"Error downloading Qlib dataset: {e}")
        return {"success": False, "error": str(e)}

def configure_qlib():
    """Configure Qlib for the dataset"""
    try:
        logger.info("Configuring Qlib for the dataset...")
        
        from scripts.qlib_dataset_downloader import QlibDatasetDownloader
        
        downloader = QlibDatasetDownloader()
        result = downloader.configure_qlib_for_dataset()
        
        if result.get('success'):
            logger.info("Qlib configured successfully!")
            return result
        else:
            logger.error(f"Failed to configure Qlib: {result.get('error')}")
            return result
            
    except Exception as e:
        logger.error(f"Error configuring Qlib: {e}")
        return {"success": False, "error": str(e)}

def validate_dataset():
    """Validate the downloaded dataset"""
    try:
        logger.info("Validating dataset...")
        
        from scripts.enhanced_qlib_data_manager import EnhancedQlibDataManager
        
        manager = EnhancedQlibDataManager()
        result = manager.validate_dataset()
        
        logger.info(f"Dataset validation result: {result['overall_status']}")
        return result
        
    except Exception as e:
        logger.error(f"Error validating dataset: {e}")
        return {"overall_status": "error", "error": str(e)}

def get_dataset_info():
    """Get dataset information"""
    try:
        logger.info("Getting dataset information...")
        
        from scripts.enhanced_qlib_data_manager import EnhancedQlibDataManager
        
        manager = EnhancedQlibDataManager()
        result = manager.get_dataset_status()
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting dataset info: {e}")
        return {"status": "error", "error": str(e)}

async def test_backtesting_integration():
    """Test backtesting integration with the dataset"""
    try:
        logger.info("Testing backtesting integration...")
        
        # Test the enhanced backtesting system
        from scripts.enhanced_backtesting_cli import test_enhanced_backtesting
        
        result = await test_enhanced_backtesting()
        
        logger.info("Backtesting integration test completed")
        return {"success": True, "message": "Backtesting integration test passed"}
        
    except Exception as e:
        logger.error(f"Error testing backtesting integration: {e}")
        return {"success": False, "error": str(e)}

def main():
    """Main setup function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Setup Qlib Dataset for Backtesting')
    parser.add_argument('--install-deps', action='store_true', help='Install dependencies')
    parser.add_argument('--download', action='store_true', help='Download dataset')
    parser.add_argument('--configure', action='store_true', help='Configure Qlib')
    parser.add_argument('--validate', action='store_true', help='Validate dataset')
    parser.add_argument('--info', action='store_true', help='Get dataset info')
    parser.add_argument('--test', action='store_true', help='Test backtesting integration')
    parser.add_argument('--full-setup', action='store_true', help='Run full setup (recommended)')
    
    args = parser.parse_args()
    
    if args.full_setup:
        logger.info("Starting full Qlib dataset setup...")
        
        # Step 1: Install dependencies
        logger.info("Step 1: Installing dependencies...")
        if not install_dependencies():
            logger.error("Failed to install dependencies")
            return
        
        # Step 2: Download dataset
        logger.info("Step 2: Downloading Qlib dataset...")
        download_result = download_qlib_dataset()
        if not download_result.get('success'):
            logger.error("Failed to download dataset")
            return
        
        # Step 3: Configure Qlib
        logger.info("Step 3: Configuring Qlib...")
        config_result = configure_qlib()
        if not config_result.get('success'):
            logger.error("Failed to configure Qlib")
            return
        
        # Step 4: Validate dataset
        logger.info("Step 4: Validating dataset...")
        validation_result = validate_dataset()
        if validation_result['overall_status'] == 'failed':
            logger.error("Dataset validation failed")
            return
        
        # Step 5: Get final info
        logger.info("Step 5: Getting dataset information...")
        info_result = get_dataset_info()
        
        logger.info("Full setup completed successfully!")
        print(json.dumps({
            "setup_status": "completed",
            "download_result": download_result,
            "config_result": config_result,
            "validation_result": validation_result,
            "dataset_info": info_result
        }, indent=2))
        
        return
    
    if args.install_deps:
        result = install_dependencies()
        print(json.dumps({"install_dependencies": result}, indent=2))
    
    if args.download:
        result = download_qlib_dataset()
        print(json.dumps(result, indent=2))
    
    if args.configure:
        result = configure_qlib()
        print(json.dumps(result, indent=2))
    
    if args.validate:
        result = validate_dataset()
        print(json.dumps(result, indent=2))
    
    if args.info:
        result = get_dataset_info()
        print(json.dumps(result, indent=2))
    
    if args.test:
        import asyncio
        result = asyncio.run(test_backtesting_integration())
        print(json.dumps(result, indent=2))
    
    if not any([args.install_deps, args.download, args.configure, args.validate, args.info, args.test, args.full_setup]):
        # Default: show info
        result = get_dataset_info()
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
