import prisma from "@/utils/db";
import { authMiddleware } from "@/utils/middleware";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user } = req;

  try {
    const stats = {
      blogPosts: await prisma.BlogPost.count({ where: { userId: user.userId } }),
      comments: await prisma.BlogComment.count({ where: { userId: user.userId } }),
      templates: await prisma.template.count({ where: { userId: user.userId } }),
      voteUpsPosts: await prisma.vote.count({
        where: { type: "upvote", blogPostId: { not: null }, userId: user.userId },
      }),
      voteUpsComments: await prisma.vote.count({
        where: { type: "upvote", commentId: { not: null }, userId: user.userId },
      }),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return res.status(500).json({ error: "Failed to fetch user stats" });
  }
}

export default authMiddleware(handler);
