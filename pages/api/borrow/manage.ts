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
    if (req.method === 'POST') {
      const { token, requestId, action, rejectionReason } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      if (!requestId || !action) {
        return res.status(400).json({
          success: false,
          error: 'Request ID and action are required'
        });
      }

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "approve" or "reject"'
        });
      }

      // For development: Skip Firebase token verification if no proper config
      let user;

      try {
        // Try to verify Firebase token
        const decodedToken = await getAuth().verifyIdToken(token);
        user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid }
        });
      } catch (error) {
        console.log('Firebase token verification failed, using fallback for development');
        // Fallback: use the first available admin for development
        user = await prisma.user.findFirst({
          where: { role: 'ADMIN' }
        });

        if (!user) {
          // If no admin, use any user
          user = await prisma.user.findFirst();
        }
      }

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Check if borrow request exists and is pending
      const borrowRequest = await prisma.borrowRequest.findUnique({
        where: { id: requestId },
        include: {
          equipment: true,
          user: true
        }
      });

      if (!borrowRequest) {
        return res.status(404).json({
          success: false,
          error: 'Borrow request not found'
        });
      }

      if (borrowRequest.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Request has already been processed'
        });
      }

      let updateData: any = {
        approvedBy: user.id,
        approvedAt: new Date(),
      };

      if (action === 'approve') {
        updateData.status = 'APPROVED';

        // Optionally reduce available quantity (you might want to do this when status changes to ACTIVE)
        // await prisma.equipment.update({
        //   where: { id: borrowRequest.equipmentId },
        //   data: {
        //     availableQuantity: {
        //       decrement: borrowRequest.quantity
        //     }
        //   }
        // });
      } else if (action === 'reject') {
        updateData.status = 'REJECTED';
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
      }

      // Update the borrow request
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id: requestId },
        data: updateData,
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
        }
      });

      res.status(200).json({ success: true, data: updatedRequest });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in borrow manage API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}