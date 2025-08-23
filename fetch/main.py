#!/usr/bin/env python3
"""
Canary Contract Guardian - Main Entry Point

This is the main entry point for the Canary Contract Guardian monitoring agent.
It loads environment variables and starts the monitoring agent.
"""

import sys
import os

# Add the fetch directory to the Python path so we can import from agent/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now import and run the simple agent
from agent.agent import main

if __name__ == "__main__":
    main()
