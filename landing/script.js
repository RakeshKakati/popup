// Replace with your actual Chrome Web Store URL after publishing
const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID';

document.getElementById('install-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(EXTENSION_URL, '_blank');
});

document.getElementById('install-free')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open(EXTENSION_URL, '_blank');
});

document.getElementById('upgrade-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  // Redirect to Stripe checkout or open extension upgrade flow
  window.open(EXTENSION_URL, '_blank');
});

