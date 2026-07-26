from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    ten: str
    email: str
    matkhau: str


class UserLogin(BaseModel):
    email: str
    matkhau: str


class UserUpdate(BaseModel):
    ten: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None


class ChangePassword(BaseModel):
    matkhau_cu: str
    matkhau_moi: str


class UserResponse(BaseModel):
    id: int
    ten: str
    email: str
    vaitro: str
    avatar: Optional[str] = None

    model_config = {
        "from_attributes": True,
    }


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
