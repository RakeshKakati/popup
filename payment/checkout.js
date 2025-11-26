// REPLACE WITH YOUR STRIPE CHECKOUT SESSION ENDPOINT
const CHECKOUT_ENDPOINT = 'https://www.trypopup.com/create-checkout-session';

// TEST MODE: Set to false when backend is deployed and working
const TEST_MODE = false;

console.log('💳 Checkout page loaded');

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
    
    console.log('📡 Creating checkout session...');
    
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

    const data = await response.json();
    console.log('✅ Session created:', data);

    if (!data.url) {
      throw new Error('No checkout URL received from backend');
    }
    
    console.log('🔗 Redirecting to Stripe checkout...');
    
    // Redirect directly to Stripe's hosted checkout page
    // No need for Stripe.js SDK!
    window.location.href = data.url;
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

