# 🚀 Deploy Backend to Vercel (5 minutes)

Your Stripe webhook is ready, but the backend needs to be deployed. Here's how:

## Option 1: Deploy via Vercel CLI (Fastest)

### Step 1: Install Vercel CLI

Try with npx (no install needed):
```bash
cd /Users/rakesh/Newtest
npx vercel
```

If that doesn't work, you already have the repo on GitHub, so use Option 2.

---

## Option 2: Deploy via Vercel Dashboard (Easiest - 3 minutes)

### Step 1: Go to Vercel
1. Open: **https://vercel.com/new**
2. Sign in (with GitHub if you haven't)

### Step 2: Import Your Repo
1. Click **"Import Git Repository"**
2. Search for: **`RakeshKakati/popup`**
3. Click **"Import"**

### Step 3: Configure Root Directory
Since your backend is in `backend-example/`, you need to tell Vercel:

1. **Root Directory**: Leave as `./` (Vercel will use `vercel.json` which we already have)
2. Click **"Deploy"**

### Step 4: Add Environment Variables

After deployment, go to your project → **Settings** → **Environment Variables**

Add these 3 variables:

1. **STRIPE_SECRET_KEY**
   - Value: Your Stripe **secret key** from https://dashboard.stripe.com/apikeys
   - Should start with `sk_test_...`

2. **STRIPE_PRICE_ID**
   - Value: `price_1SXnst86tpt5LW4R5r4HJKQG`

3. **STRIPE_WEBHOOK_SECRET**
   - Value: Your webhook secret from Stripe
   - Go to https://dashboard.stripe.com/webhooks
   - Click on your webhook
   - Copy "Signing secret" (starts with `whsec_...`)

### Step 5: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **3 dots** on the latest deployment
3. Click **"Redeploy"**

---

## ✅ Verify It's Working

After deployment, test the endpoint:

```bash
curl -X POST https://popup-topaz.vercel.app/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"extensionId":"test","priceId":"price_1SXnst86tpt5LW4R5r4HJKQG"}'
```

You should see:
```json
{"sessionId":"cs_test_..."}
```

---

## 🔧 If Deployment Fails

### Problem: "No Build Output Found"

**Fix**: Update `vercel.json` to point to the backend correctly.

I've already created the right `vercel.json` for you, but if it's not working:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend-example/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend-example/server.js"
    }
  ]
}
```

### Problem: Backend returns 500 error

**Cause**: Missing environment variables

**Fix**: Make sure all 3 env vars are set in Vercel dashboard, then redeploy.

---

## 🎯 After Backend is Live

### Update Checkout (Turn off TEST_MODE)

In `payment/checkout.js`:

```javascript
const TEST_MODE = false;  // Now use real Stripe
```

### Commit and reload extension:

```bash
cd /Users/rakesh/Newtest
git add payment/checkout.js
git commit -m "Enable production mode"
git push
```

Then reload extension in Chrome.

---

## 🧪 Test End-to-End Payment

1. Load extension
2. Save 100 posts
3. Try to save another → see upgrade prompt
4. Click "Upgrade Now"
5. Should redirect to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
7. Complete payment
8. Redirected to success page
9. Pro activated! ✅

---

## 📋 Checklist

- [ ] Deploy to Vercel via dashboard
- [ ] Add 3 environment variables
- [ ] Redeploy after adding env vars
- [ ] Test endpoint with curl
- [ ] Update webhook URL in Stripe to match deployment URL
- [ ] Set TEST_MODE = false
- [ ] Test full payment flow

---

## Your Current Stripe Setup ✅

- **Publishable Key**: Already in `checkout.js`
- **Price ID**: Already in `checkout.js`
- **Webhook**: Already created in Stripe dashboard
- **Backend URL**: `https://popup-topaz.vercel.app`

Just need to:
1. Actually deploy the backend code
2. Add the 3 environment variables
3. You're done!

