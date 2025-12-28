# 📚 Social Media Platform API Documentation

## 🌐 Base URLs
- **Production:** `https://social-media-app-5kir.onrender.com`
- **Local:** `http://localhost:3000`

## 🔐 Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```text
Authorization: Bearer <your_jwt_token>
📋 Table of Contents
Authentication

Users

Posts

Likes

Comments

Database Schema

🔐 Authentication Endpoints
Register User
Create a new user account.

Endpoint: POST /api/auth/register

Request Body:

JSON

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}
Response: 201 Created

Login
Authenticate and receive JWT token.

Endpoint: POST /api/auth/login

Request Body:

JSON

{
  "username": "johndoe",
  "password": "securepass123"
}
Response: 200 OK (Includes token)

Get Profile
Get current user's profile with stats.

Endpoint: GET /api/auth/profile

Headers: Authorization: Bearer <token>

👥 User Endpoints
Search Users
Endpoint: GET /api/users/search?q=john

Query Params: q (required), page, limit

Follow User
Endpoint: POST /api/users/:user_id/follow

Headers: Authorization: Bearer <token>

Response: 201 Created

Unfollow User
Endpoint: DELETE /api/users/:user_id/follow

📝 Post Endpoints
Create Post
Endpoint: POST /api/posts

Request Body:

JSON

{
  "content": "Check out my new deployment on Render!",
  "media_url": "[https://example.com/image.jpg](https://example.com/image.jpg)",
  "comments_enabled": true
}
Get Feed
Get personalized content feed (own posts + followed users' posts).

Endpoint: GET /api/posts/feed

Details: Ordered by created_at DESC.

Delete Post
Endpoint: DELETE /api/posts/:post_id

Note: Supports soft deletion.

❤️ Like Endpoints
Like/Unlike Post
Like: POST /api/likes/:post_id

Unlike: DELETE /api/likes/:post_id

Check Like Status
Endpoint: GET /api/likes/:post_id/status

💬 Comment Endpoints
Create Comment
Endpoint: POST /api/comments/:post_id

Request Body: {"content": "Amazing project!"}

Get Post Comments
Endpoint: GET /api/comments/post/:post_id

🧪 Quick Test Flow (cURL)
Bash

# 1. Health Check
curl [https://social-media-app-5kir.onrender.com/health](https://social-media-app-5kir.onrender.com/health)

# 2. Login
curl -X POST [https://social-media-app-5kir.onrender.com/api/auth/login](https://social-media-app-5kir.onrender.com/api/auth/login) \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
🔧 Error Responses
All endpoints return a consistent error format:

JSON

{
  "error": "Error message here",
  "details": []
}
Common Status Codes:

200/201: Success

401: Unauthorized (Invalid Token)

404: Resource Not Found

500: Internal Server Error

Version: 1.0.0

Last Updated: December 28, 2025

Developer: Adnan Hussain