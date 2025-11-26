# 🧪 How to Test the Payment Flow

## Step 1: Load the Extension (1 minute)

1. Open Chrome
2. Go to `chrome://extensions`
3. Toggle **"Developer mode"** ON (top right)
4. Click **"Load unpacked"**
5. Select the folder: `/Users/rakesh/Newtest`
6. You should see "LinkedIn Post Pop-out" extension loaded ✅

---

## Step 2: Set Up Test Data (30 seconds)

Instead of manually saving 100 posts, let's simulate it:

### Option A: Using Chrome DevTools (Quick)

1. Click the extension icon (or go to any extension page)
2. Right-click anywhere → **"Inspect"**
3. Go to the **"Console"** tab
4. Paste this code and press Enter:

```javascript
// Create 100 fake posts to hit the limit
const fakePosts = Array.from({ length: 100 }, (_, i) => ({
  id: `post-${i}`,
  actor: 'Test User',
  text: `This is test post ${i}`,
  savedAt: new Date().toISOString()
}));

chrome.storage.local.set({ savedPosts: fakePosts }, () => {
  console.log('✅ Set 100 test posts');
  chrome.storage.local.get(['savedPosts'], (result) => {
    console.log('Current count:', result.savedPosts?.length);
  });
});
```

### Option B: Manually Save Real Posts

1. Go to LinkedIn.com
2. Drag any post to the drop zone (or click "Pop out")
3. Add tags and click "Save to library"
4. Repeat 100 times 😅 (use Option A instead!)

---

## Step 3: Trigger the Payment Gate (30 seconds)

1. Go to LinkedIn.com
2. Drag any post to pop it out
3. Try to **"Save to library"**
4. You should see:
   - ❌ Error message: "Free limit reached (100 posts). Upgrade to Pro for unlimited saves."
   - ✅ A new tab opens: `chrome-extension://[id]/payment/checkout.html`

---

## Step 4: Test Stripe Payment (1 minute)

On the checkout page you'll see:

- **Price**: $9 one-time
- **Your current count**: 100 posts
- **Features**: Unlimited saves, etc.

### Click "Upgrade Now"

**What should happen:**
- Button says "Loading..."
- You get redirected to Stripe Checkout page

### Use Stripe Test Card

Fill in:
- **Card number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Name**: Your name
- **ZIP**: Any zip (e.g., `12345`)

Click **"Pay"**

---

## Step 5: Verify Pro is Activated (10 seconds)

After successful payment:

1. You should be redirected to: `chrome-extension://[id]/payment/success.html`
2. You'll see: **"Welcome to Pro! 🎉"**
3. The page auto-closes after 5 seconds

### Verify Pro Status

Open DevTools Console again and run:

```javascript
chrome.storage.local.get(['isPro', 'savedPosts'], (result) => {
  console.log('Pro status:', result.isPro); // Should be true
  console.log('Saved posts:', result.savedPosts?.length);
});
```

You should see:
```
Pro status: true
Saved posts: 100
```

---

## Step 6: Test Unlimited Saves (30 seconds)

Now try saving another post:

1. Go to LinkedIn
2. Pop out a post
3. Click **"Save to library"**
4. It should work! ✅
5. Status message: `"Saved to library. (∞ saves remaining)"`

---

## 🐛 Troubleshooting

### Problem: Checkout button does nothing

**Cause**: Backend not deployed or wrong URL

**Fix**: 
1. Check `payment/checkout.js` → `CHECKOUT_ENDPOINT`
2. Make sure it points to your deployed backend
3. Or skip to manual Pro activation (see below)

### Problem: Can't test without deploying backend

**Solution**: Manually activate Pro for testing

```javascript
// In DevTools Console
chrome.storage.local.set({ isPro: true }, () => {
  console.log('✅ Pro activated manually for testing');
});
```

Now you can save unlimited posts without payment!

---

## 🔄 Reset Everything

To start fresh:

```javascript
// Clear all data
chrome.storage.local.clear(() => {
  console.log('✅ All data cleared');
});

// Or just reset count
chrome.storage.local.set({ savedPosts: [], isPro: false }, () => {
  console.log('✅ Reset to free tier with 0 posts');
});
```

---

## 📋 Quick Test Checklist

- [ ] Load extension in Chrome
- [ ] Set 100 fake posts via DevTools
- [ ] Try to save another post
- [ ] See "limit reached" message
- [ ] Checkout page opens
- [ ] (Optional) Test Stripe with test card
- [ ] (Or) Manually set `isPro: true`
- [ ] Verify unlimited saves work
- [ ] Check status shows "∞ saves remaining"

---

## 🎯 Pro Tip: Test Locally Without Backend

You don't need to deploy anything to test the extension! Just:

1. Set `isPro: true` manually in DevTools
2. Test all features (save, search, export)
3. Deploy backend only when ready to collect real payments

The extension works 100% locally with Chrome storage!

