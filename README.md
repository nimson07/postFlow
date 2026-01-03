# Employment Task - Full Stack Application

A full-stack application with Node.js backend, React frontend, PostgreSQL database, and JWT authentication.

## Features

### Authentication
- JWT token-based authentication
- Token expires after 5 minutes of inactivity
- Token automatically refreshes on every API request
- Secure password hashing with bcrypt

### Admin Features
- Create users without assigning passwords
- Users prompted to set password on first login
- Approve/Reject posts with rejection reasons
- View all users and posts
- Filter and search functionality

### User Features
- Create posts
- View post approval/rejection status
- See rejection reasons
- View personal post history

### Technical Features
- Pagination on all list views
- Filtering and search
- Input validation and error handling
- RESTful API design
- Responsive UI design
- Database indexes for performance

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# In the api/ directory, create a .env file based on .env.example
cd api
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/employmentdb?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRY="5m"
PORT=5000
NODE_ENV=development
```

5. Set up the database:
```bash
# From the api/ directory
npx prisma migrate dev --name init
npx prisma generate
```

6. (Optional) Create an admin user manually using Prisma Studio:
```bash
# From the api/ directory
npx prisma studio
```

Create a user with:
- email: admin@example.com
- password: (hash of your password - use an online bcrypt generator or create through the API)
- role: ADMIN
- isPasswordSet: true

Or use this Node.js script to create an admin:
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isPasswordSet: true,
      firstName: 'Admin',
      lastName: 'User'
    }
  });
  console.log('Admin created:', admin);
}

createAdmin();
```

## Running the Application

### Single Command (Both API and App)
```bash
npm run start
```

This will start:
- Backend API on http://localhost:5000
- Frontend App on http://localhost:3000

### Running Separately

Backend only:
```bash
npm run start:api
```

Frontend only:
```bash
npm run start:app
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/set-password` - Set password for new users
- `GET /api/auth/me` - Get current user info

### Users (Admin only)
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users with pagination and filters

### Posts
- `POST /api/posts` - Create a post (USER only)
- `GET /api/posts` - Get posts (filtered by user role)
- `GET /api/posts/:id` - Get single post
- `PATCH /api/posts/:id/approve` - Approve post (ADMIN only)
- `PATCH /api/posts/:id/reject` - Reject post with reason (ADMIN only)

## Database Schema

### User
- id (UUID)
- email (String, unique)
- password (String, nullable)
- role (ADMIN | USER)
- firstName (String, optional)
- lastName (String, optional)
- isPasswordSet (Boolean)
- createdAt, updatedAt (DateTime)

### Post
- id (UUID)
- title (String)
- content (String)
- status (PENDING | APPROVED | REJECTED)
- rejectionReason (String, optional)
- userId (UUID, foreign key)
- createdAt, updatedAt (DateTime)

## Project Structure

```
.
├── api/                    # Backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js     # Authentication routes
│   │   │   ├── users.js    # User management routes
│   │   │   └── posts.js    # Post management routes
│   │   └── server.js       # Express server
│   ├── .env.example
│   └── package.json
├── app/                    # Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── SetPassword.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── utils/
│   │   │   └── api.js      # Axios instance with interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json            # Root package.json
```

## Usage Guide

### Admin Workflow
1. Login with admin credentials
2. Create new users (without passwords)
3. Share email with new users
4. Review and approve/reject posts from users
5. Filter posts by status, search posts

### User Workflow
1. Receive email from admin
2. Login with email (will be prompted to set password)
3. Set password and login
4. Create posts
5. View post approval status
6. See rejection reasons if rejected

## Security Features

- Passwords hashed using bcryptjs
- JWT tokens with expiration
- Inactivity timeout (5 minutes)
- Token refresh on every API request
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)

## Deployment

### Backend (Vercel/Netlify/Railway)
1. Set environment variables
2. Ensure DATABASE_URL points to hosted PostgreSQL
3. Run `npx prisma generate` before build
4. Deploy from `api/` directory

### Frontend (Vercel/Netlify)
1. Update API base URL in production
2. Deploy from `app/` directory

### Database
- **Free Options**: 
  - [Neon](https://neon.tech)
  - [Supabase](https://supabase.com)
  - [ElephantSQL](https://www.elephantsql.com)
  - [Railway](https://railway.app)

## License

MIT
