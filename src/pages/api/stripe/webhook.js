import Stripe from 'stripe';
import prisma from '../../../utils/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
};

async function handler(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify the Stripe webhook signature
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook Error: Invalid signature' });
  }

  // Handle specific Stripe event types
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;

    try {
      // Update user's Pro status
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: true,
          proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days for Pro status
        },
      });

      console.log(`User ${userId} upgraded to Pro.`);
    } catch (err) {
      console.error('Error updating user to Pro:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.status(200).json({ received: true });
}

export default handler;
