import Stripe from 'stripe';
import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user; // Extracted from authMiddleware

    // Find the user in the database to confirm existence
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // Amount in cents ($9.99)
      currency: 'usd',
      metadata: { userId: dbUser.id },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default authMiddleware(handler);
