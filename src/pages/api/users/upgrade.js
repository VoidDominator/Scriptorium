import Stripe from 'stripe';
import prisma from '../../../utils/db';
import { verifyAccessToken } from '../../../utils/auth'; // Function to verify JWT

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }, // Ensure the user exists
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // Amount in cents, e.g., $9.99
      currency: 'usd',
      metadata: { userId: user.id }, // Attach user ID for reference
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
