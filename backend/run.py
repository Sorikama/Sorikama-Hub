import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Create uploads directory if it doesn't exist
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create subdirectories for different upload types
    os.makedirs(os.path.join(upload_dir, "product_files"), exist_ok=True)
    os.makedirs(os.path.join(upload_dir, "product_images"), exist_ok=True)
    os.makedirs(os.path.join(upload_dir, "store_logos"), exist_ok=True)
    os.makedirs(os.path.join(upload_dir, "store_covers"), exist_ok=True)
    
    # Run the FastAPI server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
