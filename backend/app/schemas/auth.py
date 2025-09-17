from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    password: str
    confirm_password: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class EmailCheckRequest(BaseModel):
    email: EmailStr
