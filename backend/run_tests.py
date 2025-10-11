#!/usr/bin/env python3
"""
Test Runner Script for Rest Empire Backend
Usage: python run_tests.py [options]

Options:
  --unit          Run only unit tests
  --integration   Run only integration tests
  --api           Run only API tests
  --performance   Run only performance tests
  --coverage      Generate coverage report
  --fast          Skip slow tests
  --verbose       Verbose output
"""

import sys
import subprocess
import argparse
import os

def run_tests(test_type=None, coverage=False, fast=False, verbose=False):
    """Run tests with specified options."""
    
    # Base pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add test type filter
    if test_type:
        cmd.extend(["-m", test_type])
    
    # Add fast filter (skip slow tests)
    if fast:
        cmd.extend(["-m", "not slow"])
    
    # Add coverage
    if coverage:
        cmd.extend([
            "--cov=app",
            "--cov-report=html:htmlcov",
            "--cov-report=term-missing",
            "--cov-fail-under=80"
        ])
    
    # Add verbosity
    if verbose:
        cmd.append("-v")
    else:
        cmd.append("-q")
    
    # Add test discovery paths
    cmd.extend([
        "app/tests/",
        "--tb=short"
    ])
    
    print(f"Running command: {' '.join(cmd)}")
    
    # Set environment variables
    env = os.environ.copy()
    env["PYTHONPATH"] = "."
    
    # Run tests
    try:
        result = subprocess.run(cmd, env=env, check=False)
        return result.returncode
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        return 1
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1

def main():
    parser = argparse.ArgumentParser(description="Run Rest Empire Backend Tests")
    
    # Test type options
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument("--unit", action="store_true", help="Run unit tests only")
    test_group.add_argument("--integration", action="store_true", help="Run integration tests only")
    test_group.add_argument("--api", action="store_true", help="Run API tests only")
    test_group.add_argument("--performance", action="store_true", help="Run performance tests only")
    test_group.add_argument("--auth", action="store_true", help="Run authentication tests only")
    test_group.add_argument("--bonus", action="store_true", help="Run bonus calculation tests only")
    test_group.add_argument("--team", action="store_true", help="Run team structure tests only")
    test_group.add_argument("--rank", action="store_true", help="Run rank calculation tests only")
    
    # Other options
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--fast", action="store_true", help="Skip slow tests")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--install-deps", action="store_true", help="Install test dependencies")
    
    args = parser.parse_args()
    
    # Install dependencies if requested
    if args.install_deps:
        print("Installing test dependencies...")
        subprocess.run([
            "pip", "install", 
            "pytest", "pytest-asyncio", "pytest-cov", 
            "httpx", "psutil", "coverage"
        ])
        return 0
    
    # Determine test type
    test_type = None
    if args.unit:
        test_type = "unit"
    elif args.integration:
        test_type = "integration"
    elif args.api:
        test_type = "api"
    elif args.performance:
        test_type = "performance"
    elif args.auth:
        test_type = "auth"
    elif args.bonus:
        test_type = "bonus"
    elif args.team:
        test_type = "team"
    elif args.rank:
        test_type = "rank"
    
    # Run tests
    return_code = run_tests(
        test_type=test_type,
        coverage=args.coverage,
        fast=args.fast,
        verbose=args.verbose
    )
    
    # Print summary
    if return_code == 0:
        print("\n✅ All tests passed!")
        if args.coverage:
            print("📊 Coverage report generated in htmlcov/index.html")
    else:
        print(f"\n❌ Tests failed with return code {return_code}")
    
    return return_code

if __name__ == "__main__":
    sys.exit(main())
