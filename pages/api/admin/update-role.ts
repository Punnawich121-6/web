import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../generated/prisma';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

// Initialize Firebase Admin (simplified for development)
if (!admin.apps.length) {
  try {
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
    const { token, userId, newRole } = req.body;

    if (!token || !userId || !newRole) {
      return res.status(400).json({
        success: false,
        error: 'Token, userId, and newRole are required'
      });
    }

    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin access required'
      });
    }

    // Validate new role
    const validRoles = ['USER', 'ADMIN', 'MODERATOR'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be USER, ADMIN, or MODERATOR'
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}