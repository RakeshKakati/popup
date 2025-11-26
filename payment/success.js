// Activate Pro license after successful payment
chrome.storage.local.set({ isPro: true }, () => {
  console.log('Pro license activated');
});

// Redirect back to library
document.getElementById('continue-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  const libraryUrl = chrome.runtime.getURL('sidepanel/sidepanel.html');
  chrome.tabs.create({ url: libraryUrl });
  window.close();
});

// Auto-close after 5 seconds
setTimeout(() => {
  window.close();
}, 5000);

