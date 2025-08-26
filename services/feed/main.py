
import os
from fastapi import FastAPI, Depends
from common.dynamo import table
from common import get_current_user

POSTS_TABLE = os.getenv("POSTS_TABLE", "posts")
app = FastAPI(title="Feed Service")
from fastapi.middleware.cors import CORSMiddleware
import os


ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],   # includes OPTIONS, GET, POST, etc.
    allow_headers=["*"],   # includes Content-Type, Authorization, etc.
)

@app.get("/feed")
def get_feed(limit: int = 20, user=Depends(get_current_user)):
    # global feed across all users using GSI2 (PK='FEED', SK=createdAt)
    resp = table(POSTS_TABLE).query(
        IndexName="GSI2Feed",
        KeyConditionExpression="#pk = :pk",
        ExpressionAttributeNames={"#pk": "GSI2PK"},
        ExpressionAttributeValues={":pk": "FEED"},
        ScanIndexForward=False,
        Limit=limit
    )
    items = resp.get("Items", [])
    # return posts as-is; frontend can fan-out to show media via mediaKey if needed
    return [{
        "postId": it["postId"],
        "authorId": it["authorId"],
        "text": it.get("text",""),
        "mediaKey": it.get("mediaKey",""),
        "likes": it.get("likes",0),
        "createdAt": it.get("createdAt")
    } for it in items]
