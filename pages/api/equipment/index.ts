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
      // Get all equipment
      const equipment = await prisma.equipment.findMany({
        include: {
          creator: {
            select: {
              displayName: true,
              email: true,
            }
          },
          borrowings: {
            where: {
              status: {
                in: ['ACTIVE', 'APPROVED']
              }
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({ success: true, data: equipment });
    } else if (req.method === 'POST') {
      // Create new equipment (Admin only)
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

      if (!equipmentData) {
        return res.status(400).json({
          success: false,
          error: 'Equipment data is required'
        });
      }

      // Create equipment
      const equipment = await prisma.equipment.create({
        data: {
          ...equipmentData,
          createdBy: user.id,
        },
        include: {
          creator: {
            select: {
              displayName: true,
              email: true,
            }
          }
        }
      });

      res.status(201).json({ success: true, data: equipment });
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