// Simple Node.js + Express backend for Stripe payments
// Deploy this to Vercel, Railway, or any Node.js hosting

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your Stripe secret key

const app = express();
app.use(cors());
app.use(express.json());

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { extensionId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_YOUR_STRIPE_PRICE_ID', // Replace with your Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `chrome-extension://${extensionId}/payment/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `chrome-extension://${extensionId}/payment/checkout.html`,
      metadata: {
        extensionId
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle successful payments
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // Replace with your webhook secret

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const extensionId = session.metadata.extensionId;
    
    console.log(`Payment successful for extension: ${extensionId}`);
    
    // Here you can:
    // 1. Store the payment in your database
    // 2. Send a confirmation email
    // 3. Activate the license (extension handles this via success.html)
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

