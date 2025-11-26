# 🚀 Quick Deployment Guide

Your code is now at: **https://github.com/RakeshKakati/popup**

## ✅ What's Already Done

- ✅ Code pushed to GitHub
- ✅ Stripe keys added to extension
- ✅ Landing page ready
- ✅ Backend ready
- ✅ Payment flow complete

## 🎯 Deploy in 3 Steps (5 minutes total)

### Step 1: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select: `RakeshKakati/popup`
4. Click **"Deploy"**

5. **Add Environment Variables** (in Vercel dashboard → Settings → Environment Variables):
   ```
   STRIPE_SECRET_KEY = your_stripe_secret_key_here (from Stripe Dashboard → API Keys)
   STRIPE_PRICE_ID = price_1SXnst86tpt5LW4R5r4HJKQG
   STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxxxxxxxxxxxxxx (get this in Step 2)
   ```

### Step 2: Set Up Stripe Webhook (1 minute)

1. Go to **https://dashboard.stripe.com/webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://YOUR-VERCEL-URL.vercel.app/webhook`
   (You'll get this URL after Step 1 deployment)
4. **Events to send**: Select `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. **Redeploy** on Vercel

### Step 3: Update Extension (1 minute)

Update the backend URL in `payment/checkout.js`:

```javascript
const CHECKOUT_ENDPOINT = 'https://YOUR-VERCEL-URL.vercel.app/create-checkout-session';
```

Then:
```bash
cd /Users/rakesh/Newtest
git add payment/checkout.js
git commit -m "Update backend URL"
git push
```

---

## 🧪 Test It

1. **Load extension in Chrome**:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `/Users/rakesh/Newtest`

2. **Test the payment flow**:
   - Save 100 posts (or set manually in DevTools: `chrome.storage.local.set({savedPosts: new Array(100)})`)
   - Try to save another post
   - See upgrade prompt
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify Pro is activated

---

## 🌐 Your URLs

After deployment you'll have:

- **Landing Page**: `https://YOUR-VERCEL-URL.vercel.app`
- **Backend API**: `https://YOUR-VERCEL-URL.vercel.app/create-checkout-session`
- **GitHub Repo**: https://github.com/RakeshKakati/popup
- **Chrome Extension**: Upload to Chrome Web Store

---

## 📱 Publish to Chrome Web Store

1. Zip the extension folder (exclude `node_modules`, `backend-example`, `.git`)
2. Go to **https://chrome.google.com/webstore/devconsole**
3. Pay $5 developer fee (one-time)
4. Upload zip
5. Fill in store listing (use landing page content)
6. Submit for review (usually approved in 1-2 days)

---

## 🔑 Your Stripe Setup

**Test Mode** (current):
- Publishable: `pk_test_51S3pLq86tpt5LW4R...`
- Price ID: `price_1SXnst86tpt5LW4R5r4HJKQG`

**When ready for production**:
- Switch to live keys in Stripe dashboard
- Update keys in Vercel environment variables
- Update `payment/checkout.js` with live publishable key
- Set up live webhook

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs/payments/checkout
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/

Everything is ready to go! 🎉

