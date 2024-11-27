import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

// Handler for GET requests (public access) with pagination
async function getHandler(req, res) {
  const { page = 1, limit = 10, sortBy = "id", order = "desc" } = req.query;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    // Fetch blog posts with pagination, excluding hidden posts
    const posts = await prisma.blogPost.findMany({
      where: { hidden: false }, // Exclude hidden posts
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        tags: { select: { name: true } },
        comments: {
          where: { hidden: false }, // Exclude hidden comments
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      skip,
      take: parseInt(limit, 10),
      orderBy: {
        [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc",
      },
    });

    // Get total count for pagination metadata
    const totalPosts = await prisma.blogPost.count({
      where: { hidden: false }, // Exclude hidden posts
    });

    const totalPages = Math.ceil(totalPosts / parseInt(limit, 10));

    // Return response with posts and pagination metadata
    return res.status(200).json({
      posts,
      pagination: {
        totalItems: totalPosts,
        totalPages,
        currentPage: parseInt(page, 10),
        pageSize: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return res.status(500).json({ error: "Failed to fetch blog posts" });
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
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Failed to create blog post" });
  }
}

// Main handler function
async function handler(req, res) {
  if (req.method === "GET") {
    return getHandler(req, res);
  }

  if (req.method === "POST") {
    return authMiddleware(postHandler)(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default handler;
