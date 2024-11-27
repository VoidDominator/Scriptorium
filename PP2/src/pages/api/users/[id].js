import fs from "fs";
import path from "path";
import formidable from "formidable";
import prisma from "../../../utils/db";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  console.log(id);

  if (parseInt(id) === NaN) {
    return res.status(400).json({ "error": "User ID is required to be a number" });
  }

  if (req.method === "GET") {
    try {
      // Fetch the user's profile from the database
      const userProfile = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });

      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }
}