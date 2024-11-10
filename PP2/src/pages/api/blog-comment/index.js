// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

// Handler for GET requests (public access) with pagination
async function getHandler(req, res) {
  const { postId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!postId) {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    // Fetch paginated comments for a specific blog post
    const comments = await prisma.blogComment.findMany({
      where: {
        postId: Number(postId),
        hidden: false, // Only include non-hidden comments
        post: {
          hidden: false, // Ensure the associated blog post is not hidden
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Order comments by creation date, newest first
      },
    });

    // Get total count of non-hidden comments for pagination metadata
    const totalComments = await prisma.blogComment.count({
      where: {
        postId: Number(postId),
        hidden: false,
        post: { hidden: false },
      },
    });
    const totalPages = Math.ceil(totalComments / limit);

    return res.status(200).json({
      comments,
      pagination: {
        totalItems: totalComments,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// Handler for POST requests (protected access) to add a new comment
async function postHandler(req, res) {
  const { content, postId } = req.body;
  const { user } = req;

  try {
    const newComment = await prisma.blogComment.create({
      data: {
        content,
        postId: Number(postId),
        userId: user.userId,  
      },
    });
    return res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
}

// Main handler function
async function handler(req, res) {
  if (req.method === 'GET') {
    return getHandler(req, res);
  }

  if (req.method === 'POST') {
    return authMiddleware(postHandler)(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;
