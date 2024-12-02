// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

async function handler(req, res) {
  const { user } = req;
  
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  if (req.method === 'GET') {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { reports: { some: {} } },
        include: {
          reports: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { reports: { _count: 'desc' } },
      });

      const comments = await prisma.blogComment.findMany({
        where: { reports: { some: {} } },
        include: {
          reports: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { reports: { _count: 'desc' } },
      });

      return res.status(200).json({ posts, comments });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  if (req.method === 'PATCH') {
    const { postId, commentId, hidden } = req.body;

    try {
      if (postId) {
        const updatedPost = await prisma.blogPost.update({
          where: { id: Number(postId) },
          data: { hidden },
        });
        return res.status(200).json(updatedPost);
      }

      if (commentId) {
        const updatedComment = await prisma.blogComment.update({
          where: { id: Number(commentId) },
          data: { hidden },
        });
        return res.status(200).json(updatedComment);
      }

      return res.status(400).json({ error: 'Specify either postId or commentId to update' });
    } catch (error) {
      console.error('Failed to update content visibility:', error);
      return res.status(500).json({ error: 'Failed to update content visibility' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);