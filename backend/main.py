from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import agents, audits, analytics, ai, rag

app = FastAPI()

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local dev project
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
