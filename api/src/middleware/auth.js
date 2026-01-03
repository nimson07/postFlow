import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Store last activity time for each user
const userActivity = new Map();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check inactivity (5 minutes = 300000 ms)
    const lastActivity = userActivity.get(decoded.userId);
    const now = Date.now();
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    if (lastActivity && (now - lastActivity) > INACTIVITY_TIMEOUT) {
      userActivity.delete(decoded.userId);
      return res.status(401).json({ error: 'Token expired due to inactivity' });
    }

    // Update last activity time
    userActivity.set(decoded.userId, now);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isPasswordSet: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    
    // Generate new token (refresh on every request)
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '5m' }
    );
    
    // Send new token in response header
    res.setHeader('X-New-Token', newToken);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export { verifyToken, requireRole };
