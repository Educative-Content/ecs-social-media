import os, uuid, time
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config as BotoConfig
from common.dynamo import table
from common import get_current_user

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
POSTS_TABLE = os.getenv("POSTS_TABLE", "posts")
MEDIA_BUCKET = os.getenv("MEDIA_BUCKET", "")
S3_ENDPOINT = os.getenv("S3_ENDPOINT")  # e.g. http://localstack:4566 (optional)
S3_FORCE_PATH = os.getenv("S3_FORCE_PATH_STYLE", "1") == "1"
S3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    endpoint_url=S3_ENDPOINT,
    config=BotoConfig(s3={'addressing_style': 'path' if S3_FORCE_PATH else 'auto'})
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title="Posts Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- CREATE POST: form-data upload (no presigned URLs) --------
@app.post("/posts")
def create_post(
    text: str = Form(""),
    file: UploadFile | None = File(None),
    user=Depends(get_current_user)
):
    if not text and file is None:
        raise HTTPException(status_code=400, detail="Post must have text or media")

    if file and not MEDIA_BUCKET:
        raise HTTPException(status_code=500, detail="MEDIA_BUCKET not configured")

    post_id = str(uuid.uuid4())
    created = int(time.time())

    media_key = ""
    media_type = ""
    if file:
        media_type = file.content_type or "application/octet-stream"
        media_key = f"{user['userId']}/{post_id}/{file.filename or 'file.bin'}"
        try:
            # Upload file stream from the request directly to S3
            S3.upload_fileobj(
                Fileobj=file.file,
                Bucket=MEDIA_BUCKET,
                Key=media_key,
                ExtraArgs={"ContentType": media_type}
            )
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"S3 upload error: {e}")

    item = {
        "PK": f"USER#{user['userId']}",
        "SK": f"POST#{created}#{post_id}",
        "postId": post_id,
        "authorId": user["userId"],
        "text": text or "",
        "mediaKey": media_key,          # store only the key (not a presigned url)
        "mediaType": media_type,
        "likes": 0,
        "createdAt": created,
        # indexes
        "GSI1PK": f"POST#{post_id}",    # lookup by postId
        "GSI1SK": f"USER#{user['userId']}",
        "GSI2PK": "FEED",               # global feed
        "GSI2SK": created,
    }
    table(POSTS_TABLE).put_item(Item=item)

    return {
        "postId": post_id,
        "createdAt": created,
        "mediaKey": media_key
    }

# -------- STREAM MEDIA: proxy from S3 so <img src> works --------
@app.get("/media/{post_id}")
def get_media(post_id: str):
    # Look up the post to get mediaKey
    resp = table(POSTS_TABLE).query(
        IndexName="GSI1PostId",
        KeyConditionExpression="#pk = :pk",
        ExpressionAttributeNames={"#pk": "GSI1PK"},
        ExpressionAttributeValues={":pk": f"POST#{post_id}"}
    )
    items = resp.get("Items", [])
    if not items:
        raise HTTPException(status_code=404, detail="Post not found")

    item = items[0]
    key = item.get("mediaKey")
    if not key:
        raise HTTPException(status_code=404, detail="No media for this post")

    try:
        obj = S3.get_object(Bucket=MEDIA_BUCKET, Key=key)
    except ClientError as e:
        raise HTTPException(status_code=404, detail=f"Media not found: {e}")

    content_type = obj.get("ContentType", "application/octet-stream")
    return StreamingResponse(obj["Body"], media_type=content_type)

# -------- LIST POSTS (unchanged) --------
@app.get("/posts")
def list_posts(author: str | None = None, limit: int = 20, user=Depends(get_current_user)):
    pk = f"USER#{user['userId']}" if author in (None, "", "me") else f"USER#{author}"
    resp = table(POSTS_TABLE).query(
        KeyConditionExpression="#pk = :pk AND begins_with(#sk, :sk)",
        ExpressionAttributeNames={"#pk": "PK", "#sk": "SK"},
        ExpressionAttributeValues={":pk": pk, ":sk": "POST#"},
        ScanIndexForward=False,
        Limit=limit
    )
    items = resp.get("Items", [])
    return [{
        "postId": it["postId"],
        "authorId": it["authorId"],
        "text": it.get("text",""),
        "mediaKey": it.get("mediaKey",""),
        "likes": it.get("likes",0),
        "createdAt": it.get("createdAt")
    } for it in items]
