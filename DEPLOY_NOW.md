# 🚀 Deploy to Production - Step by Step

## Current Status
✅ Production mode enabled (`TEST_MODE = false`)
✅ Code ready to deploy

---

## Step 1: Deploy Backend to Vercel (5 minutes)

### Option A: Using Vercel Web Interface (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select: `RakeshKakati/popup`
   - Click "Import"

3. **Configure Project:**
   - Project Name: `linkedin-post-manager` (or anything you like)
   - Framework Preset: `Other`
   - Root Directory: `./` (leave as is)
   - Click "Deploy"

4. **Add Environment Variables:**
   - After deployment, go to: **Settings** → **Environment Variables**
   - Add these 3 variables:

   ```
   STRIPE_SECRET_KEY
   Value: [Get from https://dashboard.stripe.com/apikeys - starts with sk_test_ or sk_live_]
   
   LICENSE_SECRET
   Value: de3ea2d158966c30143f758f603ba42868f87a78c18c32e9dad62b7609a2358e
   
   STRIPE_PRICE_ID
   Value: price_1SXnst86tpt5LW4R5r4HJKQG
   ```

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click the ⋯ menu on latest deployment
   - Click "Redeploy"

6. **Get Your Backend URL:**
   - You'll see something like: `https://linkedin-post-manager.vercel.app`
   - Copy this URL!

---

### Option B: Using Vercel CLI (For Developers)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/rakesh/Newtest
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? linkedin-post-manager
# - Directory? ./ (just press Enter)
# - Override settings? No

# Add environment variables
vercel env add STRIPE_SECRET_KEY
# Paste your Stripe secret key from dashboard.stripe.com/apikeys

vercel env add LICENSE_SECRET
# Paste: de3ea2d158966c30143f758f603ba42868f87a78c18c32e9dad62b7609a2358e

vercel env add STRIPE_PRICE_ID
# Paste: price_1SXnst86tpt5LW4R5r4HJKQG

# Deploy to production
vercel --prod
```

---

## Step 2: Update Extension with Backend URL

**Your backend URL will look like:**
```
https://linkedin-post-manager.vercel.app
```
or
```
https://popup-topaz.vercel.app
```

### Update These 3 Files:

#### 1. `payment/checkout.js` (line 5)
```javascript
const CHECKOUT_ENDPOINT = 'https://YOUR-URL-HERE.vercel.app/create-checkout-session';
```

#### 2. `payment/success.js` (line 14)
```javascript
const BACKEND_URL = 'https://YOUR-URL-HERE.vercel.app';
```

#### 3. `popup/popup.js` (line 2)
```javascript
const BACKEND_URL = 'https://YOUR-URL-HERE.vercel.app';
```

**Replace `YOUR-URL-HERE` with your actual Vercel domain!**

---

## Step 3: Test Backend is Working

Open your browser and test these endpoints:

### Test 1: Health Check
```
https://YOUR-URL-HERE.vercel.app/
```
Should see: "LinkedIn Post Manager API is running"

### Test 2: Verify License (should fail with test key)
```bash
curl -X POST https://YOUR-URL-HERE.vercel.app/verify-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"LPPM-TEST-TEST-TEST-TEST"}'
```
Should return: `{"valid":false,"reason":"Invalid format"}`

### Test 3: Create Checkout Session
```bash
curl -X POST https://YOUR-URL-HERE.vercel.app/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"extensionId":"test123"}'
```
Should return: `{"sessionId":"cs_test_..."}`

---

## Step 4: Commit and Push Changes

```bash
cd /Users/rakesh/Newtest
git add -A
git commit -m "Enable production mode and add Vercel config"
git push
```

---

## Step 5: Test Payment Flow

1. **Reload extension** in Chrome
2. **Go to LinkedIn**
3. **Set post count to 100:**
   ```javascript
   chrome.storage.local.set({ savedPostsCount: 100 })
   ```
4. **Try to save a post** → Should see paywall
5. **Click "Upgrade Now"** → Should open Stripe checkout
6. **Use test card:**
   ```
   Card: 4242 4242 4242 4242
   Date: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
7. **Complete payment** → Should redirect to success page
8. **Should see license key:** `LPPM-XXXX-XXXX-XXXX-XXXX`
9. **Copy and test activation** in extension popup

---

## 🎯 Quick Checklist

- [ ] Backend deployed to Vercel
- [ ] Environment variables set (STRIPE_SECRET_KEY, LICENSE_SECRET, STRIPE_PRICE_ID)
- [ ] Backend URL updated in 3 files (checkout.js, success.js, popup.js)
- [ ] TEST_MODE = false in checkout.js
- [ ] Changes committed and pushed to GitHub
- [ ] Backend endpoints tested (curl commands above)
- [ ] Payment flow tested with Stripe test card
- [ ] License key appears after payment
- [ ] License activation works in popup

---

## 🐛 Troubleshooting

### Backend Not Working?

**Check Vercel logs:**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" → Click latest deployment
4. Check "Runtime Logs" tab

**Common issues:**
- Environment variables not set → Add them and redeploy
- Wrong Stripe keys → Check dashboard.stripe.com/apikeys
- CORS errors → Backend has `cors()` enabled, should work

### Payment Not Working?

**Check browser console (F12):**
- Any errors shown?
- Is backend URL correct?
- Is STRIPE_PUBLISHABLE_KEY correct in checkout.js?

**Check Stripe dashboard:**
- Go to: https://dashboard.stripe.com/test/payments
- See if payment attempt appears
- Check for any errors

### License Key Not Appearing?

**Check success.js console logs:**
- Open F12 console on success page
- Should see: "Session ID from URL: cs_test_..."
- Should see: "Received data: {...}"
- Check what error appears

**Manual test:**
```bash
# Get a real session ID from Stripe dashboard
curl "https://YOUR-URL-HERE.vercel.app/get-session?session_id=REAL_SESSION_ID_HERE"
```

---

## 📞 Need Help?

1. **Check browser console** (F12) for errors
2. **Check Vercel logs** for backend errors
3. **Check Stripe dashboard** for payment issues
4. **Review TESTING.md** for detailed testing guide

---

## 🎉 Once Everything Works

You're ready to launch! 🚀

**Next steps:**
1. Switch to live Stripe keys (sk_live_... and pk_live_...)
2. Submit extension to Chrome Web Store
3. Create a simple landing page
4. Start promoting!

**Monthly costs:** $0 (Vercel free tier + Stripe per-transaction fees)

**You're done!** 💪

