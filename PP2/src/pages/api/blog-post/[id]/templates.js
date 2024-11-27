import prisma from '../../../../utils/db';
import { authMiddleware } from '../../../../utils/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Blog post ID from the URL
  const { templateIds } = req.body; // Array of template IDs to link
  const { user } = req; // Authenticated user from authMiddleware

  // Validate request data
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return res.status(400).json({ error: 'templateIds array is required and should not be empty' });
  }

  try {
    // Check if the blog post exists and belongs to the current user
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Verify if the authenticated user is the owner of the blog post
    if (blogPost.userId !== user.userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this blog post' });
    }

    // Overwrite existing dependencies by:
    // 1. Disconnecting all currently linked templates
    // 2. Connecting the new template IDs
    const updateBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        templates: {
          set: [], // Clear all existing connections
          connect: templateIds.map(templateId => ({ id: parseInt(templateId) })), // Add new connections
        },
      },
      include: {
        templates: true, // Return templates linked to the blog post
      },
    });

    return res.status(200).json({ message: 'Templates updated successfully', blogPost: updateBlogPost });
  } catch (error) {
    console.error('Failed to update templates for blog post:', error);
    return res.status(500).json({ error: 'Failed to update templates for blog post' });
  }
}

export default authMiddleware(handler);
