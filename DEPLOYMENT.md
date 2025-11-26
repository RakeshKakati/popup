# Deployment Guide

You've already added your Stripe keys to `payment/checkout.js` ✅

## Option 1: Deploy Landing Page (Easiest - No CLI needed)

### Using Netlify Drop (2 minutes):
1. Go to https://app.netlify.com/drop
2. Drag the `landing/` folder onto the page
3. Done! You get a URL like `https://random-name.netlify.app`
4. Update the URL in your extension listing

### Using Vercel Web UI (2 minutes):
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Upload the `landing/` folder
5. Click "Deploy"

### Using GitHub Pages (5 minutes):
```bash
cd /Users/rakesh/Newtest
git init
git add landing/*
git commit -m "Add landing page"
git branch -M gh-pages
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin gh-pages
```
Your site will be at: `https://YOUR_USERNAME.github.io/repo-name/`

---

## Option 2: Deploy Backend (Required for payments)

### Quick Option: Vercel Web UI
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Upload the `backend-example/` folder
4. Add environment variables:
   - `STRIPE_SECRET_KEY`: Your `sk_test_...` key
   - `STRIPE_PRICE_ID`: `price_1SXnst86tpt5LW4R5r4HJKQG`
   - `STRIPE_WEBHOOK_SECRET`: (get from Stripe after setting webhook)
5. Deploy

### Alternative: Railway (Very Easy)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your repo or upload `backend-example/`
5. Add environment variables (same as above)
6. Deploy

### Alternative: Render (Free tier)
1. Go to https://render.com
2. Sign up
3. Click "New" → "Web Service"
4. Connect GitHub or upload `backend-example/`
5. Add environment variables
6. Deploy (free tier available)

---

## Option 3: Local Testing (No deployment needed)

You can test the extension locally without deploying:

### Test the extension:
```bash
# Open Chrome
# Go to chrome://extensions
# Enable Developer mode
# Click "Load unpacked"
# Select /Users/rakesh/Newtest
```

### Mock payment (for testing):
Just manually set Pro status:
```javascript
// In Chrome DevTools console on any extension page:
chrome.storage.local.set({ isPro: true }, () => {
  console.log('Pro activated for testing');
});
```

---

## Next Steps (After Backend is Deployed)

1. **Update checkout.js** with your backend URL:
```javascript
const CHECKOUT_ENDPOINT = 'https://your-backend-url.vercel.app/create-checkout-session';
```

2. **Set up Stripe Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-backend-url.vercel.app/webhook`
   - Events: Select `checkout.session.completed`
   - Copy the webhook secret
   - Add it to your backend environment variables

3. **Test end-to-end**:
   - Load extension in Chrome
   - Save 100 posts (or manually set count)
   - Click upgrade
   - Use test card: `4242 4242 4242 4242`
   - Verify Pro is activated

---

## Your Current Stripe Setup ✅

- **Publishable Key**: Added to `payment/checkout.js`
- **Price ID**: Added to `payment/checkout.js`
- **Secret Key**: Add to backend when deploying

## No CLI? No Problem!

All of the above can be done through web interfaces. No terminal commands required.

Choose the easiest path for you and let me know if you need help with any specific option!

