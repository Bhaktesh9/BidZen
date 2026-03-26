# API Documentation

## Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
All endpoints (except `/api/auth/login`) require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication Endpoints

#### POST /auth/login
Login with credentials and get JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "super_admin",
    "team_id": null
  },
  "token": "jwt_token_here"
}
```

**Status Codes:**
- 200: Success
- 400: Missing fields
- 401: Invalid credentials

---

#### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "super_admin",
    "team_id": null
  }
}
```

**Status Codes:**
- 200: Success
- 401: No token / Invalid token

---

#### POST /auth/logout
Logout user (clears token on client).

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Team Endpoints

#### GET /teams
Get all teams.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Team Alpha",
    "points": 9500,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### GET /teams/:teamId
Get specific team.

**Response:**
```json
{
  "id": "uuid",
  "name": "Team Alpha",
  "points": 9500,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Player Endpoints

#### GET /players
Get all players (optionally filtered by batch).

**Query Parameters:**
- `batch` (optional): Filter by batch number

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Virat Kohli",
    "role": "Batsman",
    "image_url": "https://...",
    "base_price": 1500,
    "batch_number": 1,
    "sold_price": null,
    "team_id": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Auction Endpoints

#### GET /auction/state
Get current auction state.

**Response:**
```json
{
  "id": "fixed-uuid",
  "current_batch": 1,
  "current_player_index": 3,
  "auction_started": true,
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

#### POST /auction/start
Start auction. **Presenter only**.

**Response:**
```json
{
  "id": "fixed-uuid",
  "current_batch": 1,
  "current_player_index": 0,
  "auction_started": true,
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Status Codes:**
- 200: Success
- 401: Not presenter

---

#### POST /auction/bid
Submit bid and move to next player. **Controller only**.

**Request:**
```json
{
  "final_bid_price": 2000,
  "winning_team_id": "uuid"
}
```

**Response:**
```json
{
  "id": "fixed-uuid",
  "current_batch": 1,
  "current_player_index": 4,
  "auction_started": true,
  "updated_at": "2024-01-15T10:36:00Z"
}
```

**Status Codes:**
- 200: Success
- 400: Missing fields
- 401: Not controller

---

#### GET /auction/next-player
Get next player in auction.

**Response:**
```json
{
  "player": {
    "id": "uuid",
    "name": "Virat Kohli",
    "role": "Batsman",
    "image_url": "https://...",
    "base_price": 1500,
    "batch_number": 1,
    "sold_price": null,
    "team_id": null
  },
  "batchNumber": 1,
  "playerIndex": 3,
  "playersInBatch": 5
}
```

---

### Admin Endpoints (Super Admin Only)

#### GET /admin/users
List all users.

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "presenter1",
    "role": "presenter",
    "team_id": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### POST /admin/users
Create new user.

**Request:**
```json
{
  "username": "newuser",
  "password": "SecurePass123",
  "role": "team_owner",
  "team_id": "uuid" // optional, required for team_owner
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "newuser",
  "role": "team_owner",
  "team_id": "uuid"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid password / Missing fields
- 409: Username already exists
- 401: Not super_admin

---

#### PUT /admin/users/:userId/password
Reset user password.

**Request:**
```json
{
  "password": "NewSecurePass456"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid password
- 401: Not super_admin

---

#### GET /admin/teams
List all teams.

**Response:** Same as GET /teams

---

#### POST /admin/teams
Create team.

**Request:**
```json
{
  "name": "Team Delta"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Team Delta",
  "points": 10000,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- 201: Created
- 401: Not super_admin

---

#### PUT /admin/teams/:teamId
Update team.

**Request:**
```json
{
  "name": "Team Delta Updated",
  "points": 9500
}
```

**Status Codes:**
- 200: Success
- 401: Not super_admin

---

#### DELETE /admin/teams/:teamId
Delete team.

**Status Codes:**
- 200: Deleted
- 401: Not super_admin

---

#### GET /admin/players
List all players.

**Response:** Same as GET /players

---

#### POST /admin/players
Create player.

**Request:**
```json
{
  "name": "Virat Kohli",
  "role": "Batsman",
  "base_price": 1500,
  "batch_number": 1,
  "image_url": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Virat Kohli",
  "role": "Batsman",
  "base_price": 1500,
  "batch_number": 1,
  "image_url": "https://...",
  "sold_price": null,
  "team_id": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- 201: Created
- 400: Missing fields
- 401: Not super_admin

---

#### PUT /admin/players/:playerId
Update player.

**Request:**
```json
{
  "name": "Virat Kohli",
  "base_price": 2000
}
```

**Status Codes:**
- 200: Success
- 401: Not super_admin

---

#### DELETE /admin/players/:playerId
Delete player.

**Status Codes:**
- 200: Deleted
- 401: Not super_admin

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (invalid/missing token) |
| 409 | Conflict (duplicate entry) |
| 500 | Server Error |

---

## Rate Limiting

No rate limiting currently implemented. For production, consider adding:
- IP-based rate limiting
- User-based rate limiting
- Per-endpoint limits
