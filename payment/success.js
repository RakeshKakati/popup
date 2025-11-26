// Get session ID from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

const loadingEl = document.getElementById('loading');
const licenseBoxEl = document.getElementById('license-box');
const licenseKeyEl = document.getElementById('license-key');
const emailEl = document.getElementById('email');
const instructionsEl = document.getElementById('instructions');
const errorEl = document.getElementById('error');
const copyBtn = document.getElementById('copy-btn');

// Backend URL (change to your deployed backend)
const BACKEND_URL = 'https://popup-topaz.vercel.app';

async function fetchLicenseKey() {
  try {
    // Debug: Log the URL
    console.log('Current URL:', window.location.href);
    console.log('Session ID from URL:', sessionId);
    
    if (!sessionId) {
      console.error('No session_id parameter in URL!');
      console.log('URL params:', window.location.search);
      throw new Error('No session ID found in URL. Payment may not have completed.');
    }

    // Check if already activated in test mode (storage was set by checkout.js)
    const storageData = await chrome.storage.local.get(['isPro', 'licenseKey', 'email']);
    
    if (storageData.isPro && storageData.licenseKey && sessionId.startsWith('cs_test_')) {
      console.log('🧪 TEST MODE: Using existing license from storage');
      
      // Display test license key
      licenseKeyEl.textContent = storageData.licenseKey;
      emailEl.textContent = storageData.email;
      
      // Show UI
      loadingEl.style.display = 'none';
      licenseBoxEl.classList.add('show');
      instructionsEl.classList.add('show');
      
      console.log('✅ Test license displayed:', storageData.licenseKey);
      return;
    }

    // Production mode: Fetch license key from backend
    console.log('Fetching license from:', `${BACKEND_URL}/get-session?session_id=${sessionId}`);
    const response = await fetch(`${BACKEND_URL}/get-session?session_id=${sessionId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch license');
    }

    const data = await response.json();
    console.log('Received data:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }

    // Display license key
    licenseKeyEl.textContent = data.licenseKey;
    emailEl.textContent = data.email;
    
    // Store license locally (for convenience)
    chrome.storage.local.set({
      isPro: true,
      licenseKey: data.licenseKey,
      email: data.email,
      activatedAt: new Date().toISOString()
    });

    // Show UI
    loadingEl.style.display = 'none';
    licenseBoxEl.classList.add('show');
    instructionsEl.classList.add('show');

    console.log('✅ License activated:', data.licenseKey);
    
  } catch (error) {
    console.error('Error fetching license:', error);
    
    // Show detailed error
    loadingEl.style.display = 'none';
    errorEl.innerHTML = `
      <strong>⚠️ Could not generate license key</strong>
      <p style="margin-top: 8px;">${error.message}</p>
      <p style="margin-top: 8px; font-size: 12px;">
        Your payment was successful! Contact support with your payment confirmation.
      </p>
    `;
    errorEl.classList.add('show');
    
    // Fallback: activate Pro anyway (user paid!)
    chrome.storage.local.set({ isPro: true });
    console.log('Pro activated as fallback');
  }
}

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const licenseKey = licenseKeyEl.textContent;
  
  try {
    await navigator.clipboard.writeText(licenseKey);
    
    // Visual feedback
    copyBtn.textContent = '✅ Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy to Clipboard';
      copyBtn.classList.remove('copied');
    }, 2000);
    
  } catch (err) {
    // Fallback for older browsers
    licenseKeyEl.select();
    document.execCommand('copy');
    
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy to Clipboard';
    }, 2000);
  }
});

// Auto-select on click
licenseKeyEl.addEventListener('click', () => {
  const range = document.createRange();
  range.selectNode(licenseKeyEl);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
});

// Fetch license on load
fetchLicenseKey();
