import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin1@postflow.com' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin already exists. Updating...');
      
      // Update admin to ensure it has the correct fields
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin1@postflow.com' },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isPasswordSet: true,
          name: 'Admin User'
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    admin1@postflow.com');
      console.log('Password: admin123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🚀 You can now login with these credentials!');
      
      await prisma.$disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin1@postflow.com',
        password: hashedPassword,
        role: 'ADMIN',
        isPasswordSet: true,
        name: 'Admin User'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin1@postflow.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 You can now login with these credentials!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
