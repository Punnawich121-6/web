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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid equipment ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single equipment
      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              displayName: true,
              email: true,
            }
          },
          borrowings: {
            include: {
              user: {
                select: {
                  displayName: true,
                  email: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }

      res.status(200).json({ success: true, data: equipment });
    } else if (req.method === 'PUT') {
      // Update equipment (Admin only)
      const { token, equipmentData } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify Firebase token
      const decodedToken = await getAuth().verifyIdToken(token);

      // Check if user exists and is admin
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Update equipment
      const equipment = await prisma.equipment.update({
        where: { id },
        data: equipmentData,
        include: {
          creator: {
            select: {
              displayName: true,
              email: true,
            }
          }
        }
      });

      res.status(200).json({ success: true, data: equipment });
    } else if (req.method === 'DELETE') {
      // Delete equipment (Admin only)
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify Firebase token
      const decodedToken = await getAuth().verifyIdToken(token);

      // Check if user exists and is admin
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });

      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Check if equipment has active borrowings
      const activeBorrowings = await prisma.borrowRequest.findMany({
        where: {
          equipmentId: id,
          status: {
            in: ['PENDING', 'APPROVED', 'ACTIVE']
          }
        }
      });

      if (activeBorrowings.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete equipment with active borrowings'
        });
      }

      // Delete equipment
      await prisma.equipment.delete({
        where: { id }
      });

      res.status(200).json({ success: true, data: { message: 'Equipment deleted successfully' } });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in equipment API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}