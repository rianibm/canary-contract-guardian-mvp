#!/bin/bash
set -e

echo "🚀 Setting up devcontainer..."

# Fix for git dubious ownership issue in Codespaces
git config --global --add safe.directory /workspaces/fetch-icp-motoko

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Update dfx to latest
echo "🔄 Updating dfx..."
dfxvm update

# Set up dfx identity for codespace
echo "🔑 Setting up dfx identity..."
dfx identity new codespace_dev --storage-mode=plaintext || echo "Identity may already exist"
dfx identity use codespace_dev      
dfx start --background             
dfx stop

# Install mops dependencies
echo "📦 Installing mops dependencies..."
npm install -g ic-mops
cd ic && mops install
cd ..

# Set up Fetch Uagents
echo "🐍 Setting up Python environment..."
apt update && apt install -y python3-pip python3-venv

# Remove existing virtual environment if it exists
cd fetch
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment and install uagents
echo "Installing uagents..."
source venv/bin/activate
pip install uagents>=0.22.7
cd ..

echo "✅ Devcontainer setup complete!"
