# PostgreSQL Setup Guide

## Free PostgreSQL Hosting Options (Recommended)

### Option 1: Neon (Best for this project)
1. Visit https://neon.tech
2. Sign up with GitHub/Google
3. Create a new project
4. Copy the connection string
5. Paste into `api/.env` as `DATABASE_URL`

**Connection string format:**
```
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Option 2: Supabase
1. Visit https://supabase.com
2. Create account
3. Create new project
4. Go to Project Settings > Database
5. Copy "Connection string" (Direct connection / Transaction mode)
6. Replace [YOUR-PASSWORD] with your database password

### Option 3: Railway
1. Visit https://railway.app
2. Sign up with GitHub
3. New Project > Provision PostgreSQL
4. Copy connection URL from Variables tab

### Option 4: ElephantSQL (Free 20MB)
1. Visit https://www.elephantsql.com
2. Sign up
3. Create New Instance (Tiny Turtle - Free)
4. Copy URL from Details page

## Local PostgreSQL Setup

### Windows:
1. Download from https://www.postgresql.org/download/windows/
2. Install PostgreSQL
3. Set password during installation
4. Use connection string:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/employmentdb"
```

### Create Database:
```bash
# Using psql command line
psql -U postgres
CREATE DATABASE employmentdb;
\q
```

## After Getting Your Connection String

1. Update `api/.env`:
```env
DATABASE_URL="your-connection-string-here"
JWT_SECRET="change-this-to-a-random-secure-string"
JWT_EXPIRY="5m"
PORT=5000
NODE_ENV=development
```

2. Run migrations:
```bash
cd api
npx prisma migrate dev --name init
npx prisma generate
```

3. Create admin user (optional - for testing):
Create file `api/create-admin.js`:
```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  console.log('✅ Admin created:', admin.email);
  console.log('Password: admin123');
  await prisma.$disconnect();
}

createAdmin().catch(console.error);
```

Run it:
```bash
node create-admin.js
```

## Troubleshooting

**Connection failed?**
- Check if connection string is correct
- Ensure SSL mode is included for cloud databases
- Verify database exists

**Migrations failed?**
- Delete `api/prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

**Permission denied?**
- Check database user has proper permissions
- Try creating database manually first
