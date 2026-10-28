import uvicorn
from server import app

if __name__ == "__main__":
    print("Starting Multi-Agent Research System Backend Server on http://localhost:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
