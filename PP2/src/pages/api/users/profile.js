import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

async function handler(req, res) {
  const { user } = req;

  if (req.method === 'GET') {
    try {
      // Fetch the user's profile from the database
      const userProfile = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phoneNumber: true,
          role: true,
          createTime: true,
          lastLogin: true,
        },
      });

      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    const { firstName, lastName, email, avatar, phoneNumber } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: {
          firstName,
          lastName,
          email,
          avatar,
          phoneNumber,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phoneNumber: true,
          role: true,
          createTime: true,
          lastLogin: true,
        },
      });

      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Failed to update profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);
