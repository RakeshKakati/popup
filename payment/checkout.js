// REPLACE WITH YOUR STRIPE PUBLISHABLE KEY
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S3pLq86tpt5LW4RTPgWBhrzrrHuUjQvYhP7hEqbZ30s3xGT8dyFv76euJzuwX5zwiXoYN3q0opEBdBQ8EkbTHbL00mnde10YZ';

// REPLACE WITH YOUR STRIPE CHECKOUT SESSION ENDPOINT
const CHECKOUT_ENDPOINT = 'https://popup-topaz.vercel.app/create-checkout-session';

// TEST MODE: Set to false when backend is deployed and working
const TEST_MODE = false;

// Initialize Stripe (will be set when loaded)
let stripe = null;

// Load Stripe.js dynamically to avoid CSP issues
async function loadStripe() {
  try {
    // Fetch Stripe.js as text
    const response = await fetch('https://js.stripe.com/v3/');
    const stripeCode = await response.text();
    
    // Create a script element and inject the code
    const script = document.createElement('script');
    script.textContent = stripeCode;
    document.head.appendChild(script);
    
    // Wait a bit for Stripe to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.Stripe) {
      stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      console.log('✅ Stripe loaded successfully');
    } else {
      console.error('❌ Stripe.js failed to initialize');
    }
  } catch (error) {
    console.error('❌ Failed to load Stripe.js:', error);
  }
}

// Load Stripe when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStripe);
} else {
  loadStripe();
}

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
    // TEST MODE: Skip backend and activate Pro directly
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Activating Pro without payment...');
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a fake license key for testing
      const testLicenseKey = 'LPPM-TEST-TEST-TEST-TEST';
      
      // Activate Pro with test data
      chrome.storage.local.set({ 
        isPro: true,
        licenseKey: testLicenseKey,
        email: 'test@example.com',
        activatedAt: new Date().toISOString()
      }, () => {
        console.log('✅ Pro activated (test mode)');
        console.log('Test License Key:', testLicenseKey);
        
        // Redirect to success page with fake session ID
        const fakeSessionId = 'cs_test_' + Date.now();
        window.location.href = chrome.runtime.getURL(`payment/success.html?session_id=${fakeSessionId}`);
      });
      
      return;
    }
    
    // PRODUCTION MODE: Real Stripe payment
    const extensionId = chrome.runtime.id;
    
    // Call your backend to create a Stripe Checkout Session
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extensionId,
        priceId: 'price_1SXnst86tpt5LW4R5r4HJKQG'
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

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
    
    // Show helpful error message
    const errorMsg = TEST_MODE 
      ? 'Test mode activation failed. Check console for details.'
      : 'Backend not reachable. Please check that your backend is deployed and CHECKOUT_ENDPOINT is correct. Or enable TEST_MODE for local testing.';
    
    alert(errorMsg);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upgrade Now';
  }
});

