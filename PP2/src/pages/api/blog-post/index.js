import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

// Handler for GET requests (public access) with pagination
async function getHandler(req, res) {
  const page = parseInt(req.query.page) || 1;   // Current page, defaults to 1
  const limit = parseInt(req.query.limit) || 10; // Items per page, defaults to 10
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        hidden: false, // Only include non-hidden blog posts
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }, // Only include firstName and lastName for user data
        tags: true,
        comments: {
          where: {
            hidden: false // Only include non-hidden comments
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        } // Only include non-hidden comments with limited user data
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });

    // Get total count of non-hidden posts for pagination metadata
    const totalPosts = await prisma.blogPost.count({
      where: { hidden: false },
    });
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      posts,
      pagination: {
        totalItems: totalPosts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
}

// Handler for POST requests (protected access)
async function postHandler(req, res) {
  const { title, description, content, tags } = req.body;
  const { user } = req;

  try {
    const newPost = await prisma.blogPost.create({
      data: {
        title,
        description,
        content,
        userId: user.userId, 
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag }, 
            create: { name: tag },
          }))
        },
      },
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create blog post' });
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
