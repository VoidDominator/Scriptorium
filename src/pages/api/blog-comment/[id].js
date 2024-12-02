// AI Disclosure: This file may partially contain code generated by models such as GitHub Copilot or ChatGPT
import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const { user } = req; // The authenticated user

  switch (method) {
    case 'PUT':
      try {
        const { content } = req.body;

        // Fetch the comment to check the ownership and hidden status
        const comment = await prisma.blogComment.findUnique({
          where: { id: Number(id) },
        });

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // hidden comments are not allowed to be updated anymore. 
        if (comment.hidden) {
          return res.status(403).json({ error: 'Cannot update a hidden comment' });
        }

        // Ensure the comment belongs to the logged-in user
        if (comment.userId !== user.userId) {
          return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        // Update the comment content
        const updatedComment = await prisma.blogComment.update({
          where: { id: Number(id) },
          data: { content },
        });
        return res.status(200).json(updatedComment);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update comment' });
      }

    case 'DELETE':
      try {
        // Fetch the comment to check the ownership
        const comment = await prisma.blogComment.findUnique({
          where: { id: Number(id) },
        });

        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        // Ensure the comment belongs to the logged-in user
        if (comment.userId !== user.userId) {
          return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        // Delete the comment
        await prisma.blogComment.delete({ where: { id: Number(id) } });
        return res.status(204).end();
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete comment' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);