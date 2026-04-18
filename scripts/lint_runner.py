#!/usr/bin/env python3
"""
Lint Runner - Unified linting and type checking for Tabatine
Runs ESLint and TSC --noEmit.

Usage:
    python scripts/lint_runner.py
"""

import subprocess
import sys
import json
import platform
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except:
    pass

def run_cmd(cmd, name, cwd):
    print(f"\nRunning: {name} ({' '.join(cmd)})...")
    try:
        # Windows compatibility
        if platform.system() == "Windows":
            if cmd[0] in ["npm", "npx"]:
                if not cmd[0].lower().endswith(".cmd"):
                    cmd[0] = f"{cmd[0]}.cmd"
        
        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            shell=platform.system() == "Windows"
        )
        
        passed = proc.returncode == 0
        if passed:
            print(f"  [PASS] {name}")
        else:
            print(f"  [FAIL] {name}")
            if proc.stdout:
                print(f"\nOutput:\n{proc.stdout[:2000]}")
            if proc.stderr:
                print(f"\nError:\n{proc.stderr[:1000]}")
        
        return passed
    except Exception as e:
        print(f"  [ERROR] {name}: {str(e)}")
        return False

def main():
    project_path = Path(".").resolve()
    
    print(f"\n{'='*60}")
    print(f"[TABATINE LINT RUNNER]")
    print(f"{'='*60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    checks = [
        {"name": "ESLint", "cmd": ["npm", "run", "lint"]},
        {"name": "TypeScript", "cmd": ["npx", "tsc", "--noEmit"]}
    ]
    
    results = []
    for check in checks:
        results.append(run_cmd(check["cmd"], check["name"], project_path))
    
    all_passed = all(results)
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"ESLint: {'PASS' if results[0] else 'FAIL'}")
    print(f"TypeScript: {'PASS' if results[1] else 'FAIL'}")
    print("-" * 60)
    print(f"OVERALL: {'PASS' if all_passed else 'FAIL'}")
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
