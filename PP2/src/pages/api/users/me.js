import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

async function handler(req, res) {
  const { user } = req;

  if (req.method === "GET") {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
