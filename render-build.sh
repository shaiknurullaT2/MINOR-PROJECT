#!/usr/bin/env bash
# exit on error
set -o errexit

# --- Build Frontend ---
echo "Building Frontend..."
npm install --prefix frontend
npm run build --prefix frontend

# --- Install Backend Dependencies ---
echo "Installing Backend Dependencies..."
pip install -r requirements.txt
python -m spacy download en_core_web_sm

echo "Build Complete!"
