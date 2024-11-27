import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

async function handler(req, res) {
  const { user } = req;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { page = 1, limit = 9 } = req.query;
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  try {
    const votes = await prisma.vote.findMany({
      where: {
        userId: user.userId,
        type: "upvote",
        blogPostId: { not: null },
        blogPost: { hidden: false }, // Ensure hidden posts are excluded
      },
      select: {
        blogPost: {
          include: { tags: true },
        },
      },
      skip,
      take,
    });

    const posts = votes.map((vote) => vote.blogPost);

    const totalVotes = await prisma.vote.count({
      where: {
        userId: user.userId,
        type: "upvote",
        blogPostId: { not: null },
        blogPost: { hidden: false }, // Exclude hidden posts in the count
      },
    });

    const totalPages = Math.ceil(totalVotes / limit);

    res.status(200).json({
      posts,
      pagination: {
        totalItems: totalVotes,
        totalPages,
        currentPage: parseInt(page, 10),
      },
    });
  } catch (error) {
    console.error("Failed to fetch starred posts:", error);
    res.status(500).json({ error: "Failed to fetch starred posts" });
  }
}

export default authMiddleware(handler);
