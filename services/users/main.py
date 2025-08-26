
import os, uuid, time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from common.dynamo import table
from common import create_access_token, hash_password, verify_password

USERS_TABLE = os.getenv("USERS_TABLE", "users")
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Users Service")  # or Posts/Feed

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],   # includes OPTIONS, GET, POST, etc.
    allow_headers=["*"],   # includes Content-Type, Authorization, etc.
)

class SignupBody(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginBody(BaseModel):
    email: EmailStr
    password: str

@app.post("/signup")
def signup(body: SignupBody):
    users = table(USERS_TABLE)
    # check if email already exists via GSI on email if present; fallback to scan (demo)
    # Prefer: create a record keyed by email as well to avoid scan in prod
    existing = users.query(
        IndexName="GSI1Email",
        KeyConditionExpression="#e = :email",
        ExpressionAttributeNames={"#e": "email"},
        ExpressionAttributeValues={":email": body.email}
    ).get("Items", [])
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now = int(time.time())
    item = {
        "userId": user_id,
        "email": body.email,
        "passwordHash": hash_password(body.password),
        "name": body.name,
        "createdAt": now,
        "GSI1Email": body.email
    }
    users.put_item(Item=item)
    token = create_access_token(user_id, body.email, body.name)
    return {"token": token, "user": {"userId": user_id, "email": body.email, "name": body.name}}

@app.post("/login")
def login(body: LoginBody):
    users = table(USERS_TABLE)
    resp = users.query(
        IndexName="GSI1Email",
        KeyConditionExpression="#e = :email",
        ExpressionAttributeNames={"#e": "email"},
        ExpressionAttributeValues={":email": body.email}
    )
    items = resp.get("Items", [])
    if not items:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    u = items[0]
    if not verify_password(body.password, u["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(u["userId"], u["email"], u.get("name",""))
    return {"token": token, "user": {"userId": u["userId"], "email": u["email"], "name": u.get("name","")}}
