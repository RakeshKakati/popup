// REPLACE WITH YOUR STRIPE PUBLISHABLE KEY
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S3pLq86tpt5LW4RTPgWBhrzrrHuUjQvYhP7hEqbZ30s3xGT8dyFv76euJzuwX5zwiXoYN3q0opEBdBQ8EkbTHbL00mnde10YZ';

// REPLACE WITH YOUR STRIPE CHECKOUT SESSION ENDPOINT
const CHECKOUT_ENDPOINT = 'https://your-backend.com/create-checkout-session';

// Load Stripe.js
const stripe = window.Stripe ? window.Stripe(STRIPE_PUBLISHABLE_KEY) : null;

// Display current post count
chrome.storage.local.get(['savedPosts'], (result) => {
  const count = result.savedPosts?.length || 0;
  document.getElementById('post-count').textContent = count;
});

document.getElementById('checkout-btn').addEventListener('click', async () => {
  const btn = document.getElementById('checkout-btn');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    // Get user's extension ID for tracking
    const extensionId = chrome.runtime.id;
    
    // Call your backend to create a Stripe Checkout Session
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extensionId,
        priceId: 'price_1SXnst86tpt5LW4R5r4HJKQG' // Replace with your Stripe Price ID
      })
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe error:', error);
        alert('Payment failed. Please try again.');
      }
    } else {
      alert('Stripe is not loaded. Please refresh and try again.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upgrade Now';
  }
});

