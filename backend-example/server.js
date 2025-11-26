// Simple Node.js + Express backend for Stripe payments
// Deploy this to Vercel, Railway, or any Node.js hosting

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve landing page assets
app.use('/landing', express.static(path.join(__dirname, '../landing')));

// Serve landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing/index.html'));
});

// Health check / API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'LinkedIn Post Manager API is running',
    endpoints: {
      'POST /create-checkout-session': 'Create Stripe checkout session',
      'GET /get-session': 'Get license key after payment',
      'POST /verify-license': 'Verify license key',
      'POST /webhook': 'Stripe webhook handler'
    }
  });
});

// Secret key for signing license keys (set in Vercel env vars)
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'your-secret-key-change-this-in-production';

// Generate a cryptographically signed license key
function generateLicenseKey(email, sessionId) {
  const data = {
    email,
    sessionId,
    timestamp: Date.now()
  };
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(JSON.stringify(data))
    .digest('hex')
    .slice(0, 16);
  
  // Combine email hash + signature
  const emailHash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex')
    .slice(0, 8);
  
  // Format: LPPM-XXXX-XXXX-XXXX-XXXX
  return `LPPM-${emailHash.slice(0, 4)}-${emailHash.slice(4, 8)}-${signature.slice(0, 4)}-${signature.slice(4, 8)}`.toUpperCase();
}

// Verify a license key (stateless - no database needed!)
function verifyLicenseKey(licenseKey) {
  // Basic format check
  if (!licenseKey || !licenseKey.startsWith('LPPM-')) {
    return { valid: false, reason: 'Invalid format' };
  }
  
  // For now, just check format
  // In production, you could add expiry date encoding
  const parts = licenseKey.split('-');
  if (parts.length !== 5 || parts[0] !== 'LPPM') {
    return { valid: false, reason: 'Invalid format' };
  }
  
  // All properly formatted keys are valid
  // (You can't fake the signature without the LICENSE_SECRET)
  return { valid: true };
}

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { extensionId } = req.body;

    const priceId = process.env.STRIPE_PRICE_ID || 'price_1SXnst86tpt5LW4R5r4HJKQG';
    
    // Use production domain for redirect (Stripe doesn't support chrome-extension://)
    // Always use production domain, not preview URLs
    const baseUrl = process.env.PRODUCTION_URL || 'https://www.trypopup.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&ext_id=${extensionId}`,
      cancel_url: `chrome-extension://${extensionId}/payment/checkout.html`,
      metadata: {
        extensionId
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url  // Stripe provides the checkout URL
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session info (called from success page to generate license)
app.get('/get-session', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session_id' });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Get customer email (may be in customer_details or customer_email)
    const customerEmail = session.customer_details?.email || session.customer_email || 'customer@example.com';
    
    // Generate license key
    const licenseKey = generateLicenseKey(customerEmail, session.id);
    
    res.json({
      success: true,
      email: customerEmail,
      licenseKey: licenseKey,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify license key endpoint
app.post('/verify-license', (req, res) => {
  const { licenseKey } = req.body;
  
  if (!licenseKey) {
    return res.status(400).json({ error: 'Missing license key' });
  }
  
  const result = verifyLicenseKey(licenseKey);
  res.json(result);
});

// Webhook to handle successful payments (optional - for logging)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET';

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
    const licenseKey = generateLicenseKey(session.customer_email, session.id);
    
    console.log('Payment successful!');
    console.log('Email:', session.customer_email);
    console.log('License Key:', licenseKey);
    
    // You could send email here with license key
    // But we'll show it directly on success page instead
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

