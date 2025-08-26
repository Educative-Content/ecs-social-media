
# Social ECS App

A minimal social app with:
- **Users service** (signup/login with JWT)
- **Posts service** (create posts; media uploads via S3 presigned URLs)
- **Feed service** (global feed across all users)

Designed for containerization and deployment on **AWS ECS**. By design, **post creation and feed do not accept a `userId` in the API**; the authenticated user is derived from the JWT.

## Local Dev (with Docker Compose)

1. Set AWS credentials (so boto3 can talk to DynamoDB & S3). For local testing without AWS, you can point boto3 to `localstack` with extra config.
2. Provision the following DynamoDB table (on AWS or LocalStack):

**Table: `${POSTS_TABLE}` (default: `posts`)**
- PK: `PK` (string), e.g. `USER#<userId>`
- SK: `SK` (string), e.g. `POST#<createdAt>#<postId>`
- GSI1 (name: `GSI1PostId`): `GSI1PK` (partition, string), `GSI1SK` (sort, string) — lookup by postId
- GSI2 (name: `GSI2Feed`): `GSI2PK` (partition, string), `GSI2SK` (sort, number) — global feed (PK fixed to `FEED`, SK = createdAt)

**Table: `${USERS_TABLE}` (default: `users`)**
- PK: `userId` (string)
- GSI1 (name: `GSI1Email`): `email` (partition, string) — unique email lookup

3. Export env vars, then run:

```bash
cd deploy
docker compose up --build
```

Frontend dev server is on http://localhost:5173

## Environment Variables

Common:
- `JWT_SECRET` (required for prod)

Users service:
- `USERS_TABLE`
- `AWS_REGION`

Posts & Feed services:
- `POSTS_TABLE`
- `AWS_REGION`
- `MEDIA_BUCKET` (posts only; for presigned S3 uploads)

## ECS Notes (High-Level)

- Build & push three images (users, posts, feed) to ECR.
- Create three ECS services (Fargate) behind an ALB with three target groups and paths:
  - `/api/users/*` -> users
  - `/api/posts/*` -> posts
  - `/api/feed/*` -> feed
- Set service env vars and task execution role with S3+DynamoDB permissions.
- Configure the frontend to call the ALB hostname with the above paths (set `VITE_*_URL` envs accordingly at build time).

> For production, prefer storing JWT in an HttpOnly cookie set by a small API gateway/edge or each service. This demo stores it in `localStorage` for brevity.

## Why this design?

- **No more client-provided `userId`** — the services derive the user from the JWT.
- **Simple global feed** using a DynamoDB GSI keyed by a constant (`FEED`) with `createdAt` as the sort key.
- **S3 presigned uploads** keep file transfer efficient and secure.

