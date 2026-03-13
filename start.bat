@echo off
echo ===================================================
echo   SummarizeAI - Unified Launcher
echo ===================================================
echo.

echo [1/3] Checking Frontend Dependencies...
pushd frontend
if not exist node_modules (
    echo Installing React dependencies...
    call npm install
)

echo.
echo [2/3] Building Production Frontend...
call npm run build
popd

echo.
echo [3/3] Starting Unified Backend Server...
pushd backend
echo Server starting at http://localhost:8000
.\venv\Scripts\python.exe main.py
popd
