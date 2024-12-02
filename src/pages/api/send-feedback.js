import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { feedback } = req.body;

  if (!feedback || typeof feedback !== "string") {
    return res.status(400).json({ error: "Feedback is required and must be a string" });
  }

  // Configure the email transporter for Yahoo
  const transporter = nodemailer.createTransport({
    service: "yahoo", // Use Yahoo Mail service
    auth: {
      user: process.env.YAHOO_USER, // Your Yahoo email address
      pass: process.env.YAHOO_PASS, // Your Yahoo app-specific password
    },
  });

  try {
    // Send the feedback email
    await transporter.sendMail({
      from: `"Scriptorium Feedback" <${process.env.YAHOO_USER}>`, // Sender email
      to: "kevinhu@gmail.com, isaacxia99@gmail.com", // Recipients
      subject: "New User Feedback",
      text: `You have received new feedback:\n\n${feedback}`,
    });

    return res.status(200).json({ message: "Feedback sent successfully" });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return res.status(500).json({ error: "Failed to send feedback email" });
  }
}
