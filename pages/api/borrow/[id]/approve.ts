import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { token } = req.body;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid request ID' });
  }

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin or Moderator access required'
      });
    }

    // Get the borrow request
    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });

    if (!borrowRequest) {
      return res.status(404).json({ success: false, error: 'Borrow request not found' });
    }

    if (borrowRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be approved'
      });
    }

    // Check equipment availability
    if (borrowRequest.equipment.availableQuantity < borrowRequest.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient equipment quantity available'
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update borrow request
      const updatedRequest = await tx.borrowRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: user.id,
          approvedAt: new Date(),
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
          },
          approver: {
            select: {
              displayName: true,
              email: true,
            }
          }
        }
      });

      // Update equipment availability
      await tx.equipment.update({
        where: { id: borrowRequest.equipmentId },
        data: {
          availableQuantity: {
            decrement: borrowRequest.quantity
          },
          status: borrowRequest.equipment.availableQuantity - borrowRequest.quantity === 0
            ? 'BORROWED'
            : 'AVAILABLE'
        }
      });

      return updatedRequest;
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving borrow request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}