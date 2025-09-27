import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../generated/prisma';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';

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
  try {
    if (req.method === 'GET') {
      // Get borrow requests (filter by user for non-admin)
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify Firebase token
      const decodedToken = await getAuth().verifyIdToken(token);

      // Get user
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Build query based on user role
      const whereClause = user.role === 'ADMIN' ? {} : { userId: user.id };

      const borrowRequests = await prisma.borrowRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            }
          },
          equipment: {
            select: {
              name: true,
              category: true,
              serialNumber: true,
              image: true,
            }
          },
          approver: {
            select: {
              displayName: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({ success: true, data: borrowRequests });
    } else if (req.method === 'POST') {
      // Create new borrow request
      const { token, borrowData } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify Firebase token
      const decodedToken = await getAuth().verifyIdToken(token);

      // Get user
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (!borrowData) {
        return res.status(400).json({
          success: false,
          error: 'Borrow request data is required'
        });
      }

      // Check equipment availability
      const equipment = await prisma.equipment.findUnique({
        where: { id: borrowData.equipmentId }
      });

      if (!equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }

      if (equipment.availableQuantity < borrowData.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient equipment quantity available'
        });
      }

      // Create borrow request
      const borrowRequest = await prisma.borrowRequest.create({
        data: {
          ...borrowData,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            }
          },
          equipment: {
            select: {
              name: true,
              category: true,
              serialNumber: true,
              image: true,
            }
          }
        }
      });

      res.status(201).json({ success: true, data: borrowRequest });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in borrow API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}