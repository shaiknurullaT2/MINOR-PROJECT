import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from models.database import engine, Base
from api.routes import router as api_router
from api.auth_routes import router as auth_router
from api.dashboard_routes import router as dashboard_router

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Text Summarization API",
    description="Modern REST API for advanced NLP Text Summarization, PDF Parsing, Auth and Smart Study logic.",
    version="2.0.0"
)

# Configure CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "message": "AI Summarization API V2 is running."
    }

# --- Frontend Serving Logic ---
# Mount the React build directory
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

# Only mount static files if the directory exists (it will after `npm run build`)
if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_BUILD_DIR, "assets")), name="assets")

# Catch-all route to serve the React index.html
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str, request: Request):
    # Only serve index.html if the requested path is not an API route
    if full_path.startswith("api/"):
        return {"error": "API route not found"}
        
    index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend build not found. Please run 'npm run build' inside the frontend directory."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
