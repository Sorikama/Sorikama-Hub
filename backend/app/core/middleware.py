from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
import time
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting requests
    """
    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, Tuple[int, float]] = {}  # IP -> (count, timestamp)
        self.rate_limit = settings.RATE_LIMIT_PER_SECOND
        self.window = 1.0  # 1 second window

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for certain paths
        if (request.url.path.startswith("/api/health") or 
            request.url.path.startswith("/uploads/") or
            request.url.path.startswith("/api/stores")):
            return await call_next(request)
        
        # Check rate limit
        current_time = time.time()
        
        if client_ip in self.requests:
            count, timestamp = self.requests[client_ip]
            
            # If within window, check count
            if current_time - timestamp < self.window:
                if count >= self.rate_limit:
                    logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Too many requests"
                    )
                else:
                    # Increment count
                    self.requests[client_ip] = (count + 1, timestamp)
            else:
                # Reset window
                self.requests[client_ip] = (1, current_time)
        else:
            # First request
            self.requests[client_ip] = (1, current_time)
        
        # Clean up old entries periodically
        if len(self.requests) > 10000:  # Arbitrary limit to prevent memory issues
            self._cleanup_old_entries(current_time)
        
        # Process request
        return await call_next(request)
    
    def _cleanup_old_entries(self, current_time: float):
        """
        Remove entries older than the window
        """
        to_remove = []
        for ip, (_, timestamp) in self.requests.items():
            if current_time - timestamp > self.window:
                to_remove.append(ip)
        
        for ip in to_remove:
            del self.requests[ip]
