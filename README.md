

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_media_db
DB_USER=postgres
DB_PASSWORD=password123
JWT_SECRET=your-jwt-secret-key
LOG_LEVEL=verbose
LOG_COLORS=true
PORT=3000
NODE_ENV=development
```

3. Setup database:
```bash
# Create database in PostgreSQL
psql -U postgres
CREATE DATABASE social_media_db;
\q

# Run schema
npm run setup-db
```

4. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure
```
src/
├── controllers/    # Request handlers
├── models/        # Database queries
├── routes/        # API endpoints
├── middleware/    # Auth & validation
├── utils/         # Helper functions
└── app.js         # Express setup

scripts/           # Database setup
sql/              # Database schema
```

## 🔧 Technologies

- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Validation:** Joi
- **Security:** Helmet, bcryptjs

## 🌟 Features

- ✅ User authentication & authorization
- ✅ Follow/unfollow system
- ✅ Post creation & management
- ✅ Like system
- ✅ Comment system
- ✅ Personalized content feed
- ✅ Real-time like/comment counts

## 📚 API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

## 🐛 Bugs Fixed

1. Password hashing in user registration
2. Post creation default values
3. JWT token verification

## 👤 Author

[Mohammed Adnan Husain] - [PES University]