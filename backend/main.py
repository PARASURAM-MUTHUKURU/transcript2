import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import agents, audits, analytics, ai, rag, config, alerts, reports
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("main")

load_dotenv(".env.local")

from database import close_db_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up Quality Auditor API...")
    yield
    # Shutdown logic
    logger.info("Shutting down Quality Auditor API...")
    close_db_pool()

app = FastAPI(lifespan=lifespan)

# Restrict CORS for Production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
logger.info(f"CORS Allowed Origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(agents.router)
app.include_router(audits.router)
app.include_router(analytics.router)
app.include_router(ai.router)
app.include_router(rag.router)
app.include_router(config.router)
app.include_router(alerts.router)
app.include_router(reports.router)

if __name__ == "__main__":
    import uvicorn
    # Use environment variables for port/host in production
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

