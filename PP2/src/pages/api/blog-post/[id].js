// AI Disclosure: This file may partially contain code generated by models such as GitHub Copilot or ChatGPT
import { authMiddleware } from "../../../utils/middleware";
import prisma from "../../../utils/db";

// GET: Fetch a single blog post
// PUT: Update a blog post (protected, not allowed if post is hidden)
// DELETE: Delete a blog post (protected)
async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: Number(id) },
        include: {
          user: {
            select: { firstName: true, lastName: true }, // Select only necessary user data
          },
          tags: {
            select: { name: true }, // Include tags with just the name
          },
          comments: {
            where: { hidden: false }, // Only non-hidden comments
            include: {
              user: {
                select: { firstName: true, lastName: true }, // Select necessary comment user data
              },
            },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      console.error('Failed to fetch the blog post:', error);
      return res.status(500).json({ error: 'Failed to fetch the blog post' });
    }
  }

  if (req.method === 'PUT') {
    const { title, description, content, tags } = req.body;
    const { user } = req;

    try {
      // Fetch the post first
      const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });

      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // hidden posts are not allowed to be updated anymore. 
      if (post.hidden) {
        return res.status(403).json({ error: 'Cannot update a hidden post' });
      }

      // Ensure the post belongs to the logged-in user
      if (post.userId !== user.userId) {
        return res.status(403).json({ error: 'Unauthorized to update this post' });
      }

      // Update the blog post
      const updatedPost = await prisma.blogPost.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
          content,
          tags: {
            set: [], // Clears existing tags
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
        include: {
          tags: true, // Include tags in the response
        },
      });

      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Failed to update blog post:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }
  }

  if (req.method === 'DELETE') {
    const { user } = req;

    try {
      // Fetch the post first
      const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });

      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Ensure the post belongs to the logged-in user
      if (post.userId !== user.userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this post' });
      }

      // Delete the blog post
      await prisma.blogPost.delete({ where: { id: Number(id) } });

      return res.status(204).end(); // No content
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Wrapping only PUT and DELETE methods with authMiddleware
function authOnPutAndDelete(req, res) {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    return authMiddleware(handler)(req, res);
  } else {
    return handler(req, res);
  }
}

export default authOnPutAndDelete;
