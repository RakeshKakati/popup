// Backend URL
const BACKEND_URL = 'https://popup-topaz.vercel.app';

// Elements
const statusEl = document.getElementById('status');
const licenseSectionEl = document.getElementById('license-section');
const licenseInputEl = document.getElementById('license-input');
const activateBtnEl = document.getElementById('activate-btn');
const cancelBtnEl = document.getElementById('cancel-btn');
const messageEl = document.getElementById('message');
const openLibraryBtnEl = document.getElementById('open-library-btn');
const activateLicenseBtnEl = document.getElementById('activate-license-btn');
const upgradeBtnEl = document.getElementById('upgrade-btn');
const freeActionsEl = document.getElementById('free-actions');

// Load status
function loadStatus() {
  chrome.storage.local.get(['isPro', 'savedPostsCount', 'licenseKey'], (data) => {
    const isPro = data.isPro || false;
    const savedCount = data.savedPostsCount || 0;
    const licenseKey = data.licenseKey || null;

    if (isPro) {
      statusEl.textContent = '✨ Pro (Unlimited)';
      statusEl.classList.add('pro');
      freeActionsEl.style.display = 'none';
      
      if (licenseKey) {
        statusEl.title = `License: ${licenseKey}`;
      }
    } else {
      const remaining = 100 - savedCount;
      statusEl.textContent = `Free (${savedCount}/100 posts saved)`;
      statusEl.classList.remove('pro');
      freeActionsEl.style.display = 'block';
      
      if (remaining <= 10) {
        statusEl.style.color = '#f56565';
      }
    }
  });
}

// Show message
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message show ${type}`;
  
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 5000);
}

// Show license section
activateLicenseBtnEl.addEventListener('click', () => {
  licenseSectionEl.classList.add('show');
  licenseInputEl.focus();
});

// Cancel license entry
cancelBtnEl.addEventListener('click', () => {
  licenseSectionEl.classList.remove('show');
  licenseInputEl.value = '';
  messageEl.classList.remove('show');
});

// Format license input (auto-add dashes)
licenseInputEl.addEventListener('input', (e) => {
  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Format: LPPM-XXXX-XXXX-XXXX-XXXX
  if (value.length > 4) {
    value = value.slice(0, 4) + '-' + value.slice(4);
  }
  if (value.length > 9) {
    value = value.slice(0, 9) + '-' + value.slice(9);
  }
  if (value.length > 14) {
    value = value.slice(0, 14) + '-' + value.slice(14);
  }
  if (value.length > 19) {
    value = value.slice(0, 19) + '-' + value.slice(19, 23);
  }
  
  e.target.value = value.slice(0, 24);
});

// Activate license
activateBtnEl.addEventListener('click', async () => {
  const licenseKey = licenseInputEl.value.trim();
  
  if (!licenseKey) {
    showMessage('Please enter a license key', 'error');
    return;
  }
  
  if (!licenseKey.startsWith('LPPM-')) {
    showMessage('Invalid license key format', 'error');
    return;
  }

  activateBtnEl.disabled = true;
  activateBtnEl.textContent = 'Verifying...';

  try {
    // Verify with backend
    const response = await fetch(`${BACKEND_URL}/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });

    const data = await response.json();

    if (data.valid) {
      // Activate Pro
      chrome.storage.local.set({
        isPro: true,
        licenseKey: licenseKey,
        activatedAt: new Date().toISOString()
      }, () => {
        showMessage('🎉 Pro activated successfully!', 'success');
        licenseSectionEl.classList.remove('show');
        licenseInputEl.value = '';
        loadStatus();
      });
    } else {
      showMessage(data.reason || 'Invalid license key', 'error');
    }
  } catch (error) {
    console.error('License verification error:', error);
    showMessage('Could not verify license. Check your connection.', 'error');
  } finally {
    activateBtnEl.disabled = false;
    activateBtnEl.textContent = 'Activate Pro';
  }
});

// Open library
openLibraryBtnEl.addEventListener('click', () => {
  const libraryUrl = chrome.runtime.getURL('sidepanel/sidepanel.html');
  chrome.tabs.create({ url: libraryUrl });
  window.close();
});

// Upgrade to Pro
upgradeBtnEl.addEventListener('click', () => {
  const checkoutUrl = chrome.runtime.getURL('payment/checkout.html');
  chrome.tabs.create({ url: checkoutUrl });
  window.close();
});

// Load status on popup open
loadStatus();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isPro || changes.savedPostsCount || changes.licenseKey) {
    loadStatus();
  }
});

