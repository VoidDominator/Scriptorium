import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

// Handler for GET requests (public access) with pagination and filtering
async function getHandler(req, res) {
  const {
    page = 1,
    limit = 10,
    title,
    tag,
    author,
    sortBy = "id", // Default sorting by ID
    order = "desc",
  } = req.query;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  // Normalize undefined or "undefined" query values
  const normalizedTitle = title === "undefined" ? "" : title;
  const normalizedTag = tag === "undefined" ? "" : tag;
  const normalizedAuthor = author === "undefined" ? "" : author;

  try {
    // Build filters dynamically based on query parameters
    const filters = {
      AND: [
        normalizedTitle
          ? { title: { contains: normalizedTitle, mode: "insensitive" } }
          : undefined,
        normalizedTag
          ? {
              tags: {
                some: { name: { contains: normalizedTag, mode: "insensitive" } },
              },
            }
          : undefined,
        normalizedAuthor
          ? {
              user: {
                OR: [
                  { firstName: { contains: normalizedAuthor, mode: "insensitive" } },
                  { lastName: { contains: normalizedAuthor, mode: "insensitive" } },
                ],
              },
            }
          : undefined,
      ].filter(Boolean), // Remove undefined filters
    };

    // If no filters are provided, fetch all posts
    const isDefaultFilter =
      !normalizedTitle && !normalizedTag && !normalizedAuthor;

    // Fetch blog posts with filtering and pagination
    const posts = await prisma.blogPost.findMany({
      where: isDefaultFilter
        ? { hidden: false } // Default case: fetch all non-hidden posts
        : { ...filters, hidden: false }, // Apply filters and include non-hidden posts only
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        tags: { select: { name: true } },
        comments: {
          where: { hidden: false },
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
      where: isDefaultFilter ? { hidden: false } : { ...filters, hidden: false },
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
