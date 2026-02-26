import json
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
USERS_FILE = os.path.join(BASE_DIR, "users.json")


class LoginRequest(BaseModel):
    username: str
    password: str


def load_users():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/login")
def login(data: LoginRequest):
    users = load_users()

    if data.username not in users:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = users[data.username]

    if user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "username": data.username,
        "role": user["role"],
        "client_id": user.get("client_id"),
    }