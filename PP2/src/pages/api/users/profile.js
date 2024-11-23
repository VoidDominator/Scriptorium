import fs from "fs";
import path from "path";
import formidable from "formidable";
import prisma from "../../../utils/db";
import { authMiddleware } from "../../../utils/middleware";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

async function handler(req, res) {
  const { user } = req;

  if (req.method === "GET") {
    try {
      // Fetch the user's profile from the database
      const userProfile = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phoneNumber: true,
          role: true,
          createTime: true,
          lastLogin: true,
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
  } else if (req.method === "PUT" || req.method === "PATCH") {
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      multiples: false, // Single file upload
      uploadDir, // Upload directory
      keepExtensions: true, // Keep file extensions
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        return res.status(500).json({ error: "Failed to process the request" });
      }

      // console.log("Parsed fields:", fields);
      // console.log("Parsed files:", files);

      try {
        // Extract and validate fields
        const firstName = fields.firstName ? fields.firstName.toString() : null;
        const lastName = fields.lastName ? fields.lastName.toString() : null;
        const email = fields.email ? fields.email.toString() : null;
        const phoneNumber = fields.phoneNumber
          ? fields.phoneNumber.toString()
          : null;

        // Extract and validate avatar
        let avatar = null;
        if (files.avatar && Array.isArray(files.avatar) && files.avatar[0]) {
          avatar = `/uploads/${path.basename(files.avatar[0].filepath)}`;
        }

        // Construct update payload
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (avatar) updateData.avatar = avatar;

        // Ensure there is data to update
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: "No valid data provided for update." });
        }

        // Perform the update
        const updatedUser = await prisma.user.update({
          where: { id: user.userId },
          data: updateData,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phoneNumber: true,
            role: true,
          },
        });

        return res.status(200).json({
          message: "Profile updated successfully",
          user: updatedUser,
        });
      } catch (error) {
        console.error("Failed to update profile:", error);
        return res.status(500).json({ error: "Failed to update profile" });
      }
    });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
