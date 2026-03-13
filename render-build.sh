#!/usr/bin/env bash
# exit on error
set -o errexit

# --- Build Frontend ---
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# --- Install Backend Dependencies ---
echo "Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd ..

echo "Build Complete!"
