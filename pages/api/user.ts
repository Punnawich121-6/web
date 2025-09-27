import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../generated/prisma';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

// Initialize Firebase Admin (simplified for development)
if (!admin.apps.length) {
  try {
    // For development, you can use a simpler approach without service account
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'login-b5d42',
    });
  } catch (error) {
    console.log('Firebase admin already initialized or error:', error);
  }
}

const prisma = new PrismaClient();

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { token, userData } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid }
    });

    // Check if email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdmin = adminEmails.includes(email || '');

    if (!user) {
      // Create new user with appropriate role
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email || '',
          displayName: name || userData?.displayName || '',
          role: isAdmin ? 'ADMIN' : 'USER',
        }
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          displayName: name || userData?.displayName || user.displayName,
          email: email || user.email,
        }
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}