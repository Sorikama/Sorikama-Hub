from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from app.api.routes import auth, products, stores, orders, uploads
from app.api.routes import product_details, product_appearance, product_files, product_custom_fields, product_faq, product_course_structure
from app.api.routes import store_preview
from app.core.config import settings
from app.core.middleware import RateLimitMiddleware
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Configure CORS - Configuration pour débogage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Origines spécifiques pour le frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=600,
)

# Add security middlewares
if settings.ENVIRONMENT == "production":
    # Only use HTTPS in production
    app.add_middleware(HTTPSRedirectMiddleware)
    
    # Restrict hosts in production
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# Add session middleware for CSRF protection
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.JWT_SECRET_KEY
)

# Add gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add rate limiting
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(stores.router, prefix="/api/stores", tags=["Stores"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])

# Nouvelles routes pour les détails des produits
app.include_router(product_details.router, prefix="/api/product-details", tags=["Product Details"])
app.include_router(product_appearance.router, prefix="/api/product-appearance", tags=["Product Appearance"])
app.include_router(product_files.router, prefix="/api/product-files", tags=["Product Files"])
app.include_router(product_custom_fields.router, prefix="/api/product-custom-fields", tags=["Product Custom Fields"])
app.include_router(product_faq.router, prefix="/api/product-faq", tags=["Product FAQ"])
app.include_router(product_course_structure.router, prefix="/api/product-course-structure", tags=["Product Course Structure"])

# Routes pour la prévisualisation publique des boutiques et produits
app.include_router(store_preview.router, tags=["Store Preview"])

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    from app.db.mongodb import connect_to_mongo
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    from app.db.mongodb import close_mongo_connection
    await close_mongo_connection()
