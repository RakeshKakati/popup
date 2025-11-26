const POST_TTL_MS = 5 * 60 * 1000;
const postCache = new Map();

function pruneExpiredPosts() {
  const now = Date.now();
  for (const [postId, payload] of postCache.entries()) {
    if (now - payload.createdAt > POST_TTL_MS) {
      postCache.delete(postId);
    }
  }
}

function storePost(payload) {
  const postId = crypto.randomUUID();
  postCache.set(postId, { ...payload, createdAt: Date.now() });
  pruneExpiredPosts();
  return postId;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === "OPEN_POST_WINDOW") {
    const postId = storePost(message.payload);
    const url = chrome.runtime.getURL(`post_window/post_window.html#${postId}`);

    chrome.windows.create(
      {
        url,
        type: "popup",
        width: 520,
        height: 720,
        focused: true
      },
      () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        sendResponse({ success: true, postId });
      }
    );

    return true; // keep message channel open
  }

  if (message.type === "GET_POST_DATA") {
    pruneExpiredPosts();
    const data = postCache.get(message.postId);
    sendResponse({ success: Boolean(data), data });
    return false;
  }

  if (message.type === "STORE_SESSION_ID") {
    // Store session ID for payment redirect
    chrome.storage.local.set({ pendingSessionId: message.sessionId }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Listen for tab updates to catch Stripe redirect
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('stripe.com') && changeInfo.url.includes('session_id=')) {
    // Extract session ID from Stripe URL
    const url = new URL(changeInfo.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (sessionId) {
      // Redirect to our success page
      const successUrl = chrome.runtime.getURL(`payment/success.html?session_id=${sessionId}`);
      chrome.tabs.update(tabId, { url: successUrl });
    }
  }
});

