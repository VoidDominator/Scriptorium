// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from "../../../utils/db";
import { hashPassword } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { firstName, lastName, email, password } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error creating user' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
