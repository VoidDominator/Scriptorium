// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from '../../utils/db';
import { authMiddleware } from '../../utils/middleware';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { postId, commentId, reason } = req.body;
    const { user } = req;

    if (!reason) {
      return res.status(400).json({ error: 'Reason for report is required' });
    }

    try {
      // Create a report for a post or a comment
      const report = await prisma.report.create({
        data: {
          reason,
          postId: postId ? Number(postId) : null,
          commentId: commentId ? Number(commentId) : null,
          userId: user.userId,
        },
      });

      return res.status(201).json(report);
    } catch (error) {
      console.error('Failed to report content:', error);
      return res.status(500).json({ error: 'Failed to report content' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);  
