# 🌐 What Happens When You Change Your Domain

## Current Setup

Right now you're using:
```
https://popup-topaz.vercel.app
```

If you want to use a custom domain like:
```
https://popup.app
or
https://getpopup.com
```

---

## 🔍 What Needs to Change

### 1. ✅ Extension Code (2 Files)

You need to update the backend URL in these files:

#### File 1: `payment/checkout.js` (line 2)
```javascript
// OLD
const CHECKOUT_ENDPOINT = 'https://popup-topaz.vercel.app/create-checkout-session';

// NEW
const CHECKOUT_ENDPOINT = 'https://your-new-domain.com/create-checkout-session';
```

#### File 2: `payment/success.js` (line 14)
```javascript
// OLD
const BACKEND_URL = 'https://popup-topaz.vercel.app';

// NEW
const BACKEND_URL = 'https://your-new-domain.com';
```

#### File 3: `popup/popup.js` (line 2)
```javascript
// OLD
const BACKEND_URL = 'https://popup-topaz.vercel.app';

// NEW
const BACKEND_URL = 'https://your-new-domain.com';
```

---

### 2. ✅ Vercel Configuration

#### Option A: Use Vercel with Custom Domain

1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **Add to Vercel:**
   - Go to Vercel project → **Settings** → **Domains**
   - Click "Add Domain"
   - Enter your domain: `popup.app`
   - Follow DNS configuration steps
3. **Vercel handles the rest!**
   - Auto HTTPS
   - Auto SSL certificates
   - No code changes needed on backend

#### Option B: Use Different Hosting

If you move to a different host:
- Deploy your backend to new host
- Update the 3 frontend URLs (above)
- Stripe redirect URLs are dynamic, so they'll work automatically!

---

### 3. ✅ Stripe Webhook (If Using)

If you set up the Stripe webhook:

1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Edit your webhook endpoint**
3. **Update URL from:**
   ```
   https://popup-topaz.vercel.app/webhook
   ```
   To:
   ```
   https://your-new-domain.com/webhook
   ```

---

## 🔄 Step-by-Step Process

### If Using Vercel + Custom Domain (Easiest)

**Step 1: Add Domain to Vercel**
```
Vercel Dashboard → Your Project → Settings → Domains → Add
```

**Step 2: Configure DNS**
Follow Vercel's instructions to point your domain to Vercel

**Step 3: Wait for DNS Propagation** (5-60 minutes)

**Step 4: Update Extension Code**
Update the 3 files mentioned above with your new domain

**Step 5: Package Extension**
```bash
cd /Users/rakesh/Newtest
rm -rf build popup-extension.zip
mkdir -p build
cp manifest.json background.js icon*.png build/
cp -r content popup post_window sidepanel payment build/
find build -name ".DS_Store" -delete
cd build && zip -r ../popup-extension.zip . && cd ..
```

**Step 6: Update Chrome Web Store**
- Upload new version of extension
- Users get auto-update within a few hours

**Step 7: Update Stripe Webhook** (if configured)

**Done!** ✅

---

## 🎯 What Automatically Works

### ✅ No Changes Needed:

1. **Stripe Redirects** → Dynamically generated!
   - The backend creates redirect URLs based on the extension ID
   - Uses the current domain automatically

2. **Backend API** → Just works!
   - License generation
   - Payment processing
   - All endpoints work the same

3. **SSL/HTTPS** → Vercel handles it
   - Automatic certificates
   - No configuration needed

4. **Environment Variables** → Stay the same!
   - `STRIPE_SECRET_KEY`
   - `LICENSE_SECRET`
   - `STRIPE_PRICE_ID`

---

## 💰 Cost Comparison

### Vercel Default Domain (FREE)
```
https://popup-topaz.vercel.app
✅ Free
✅ SSL included
✅ Fast CDN
❌ Not brandable
```

### Vercel + Custom Domain ($15-30/year)
```
https://popup.app
✅ Professional
✅ SSL included  
✅ Fast CDN
✅ Brandable
💰 Domain cost only (~$15/year)
```

### Other Hosting (Variable)
```
https://popup.app
✅ Full control
💰 $5-20/month
⚙️ More setup
```

---

## 🚨 Important: Breaking Changes

### What WILL Break:

1. **Existing Checkout Sessions**
   - Old sessions with old domain in redirect URLs
   - Solution: They expire in 24h anyway ✅

2. **Cached Extension Versions**
   - Users with old extension = old domain
   - Solution: Push update, auto-updates in ~6 hours ✅

3. **Bookmarks/Links**
   - Old landing page URLs
   - Solution: Set up redirect from old → new ✅

### What WON'T Break:

1. ✅ **License Keys** → Domain-independent!
2. ✅ **User Data** → Stored locally in extension
3. ✅ **Payments** → Stripe tracks by session ID
4. ✅ **Pro Status** → Stored locally

---

## 📝 Quick Change Script

Save this as `update-domain.sh`:

```bash
#!/bin/bash

# Update domain in extension files
# Usage: ./update-domain.sh https://your-new-domain.com

NEW_DOMAIN=$1

if [ -z "$NEW_DOMAIN" ]; then
  echo "Usage: ./update-domain.sh https://your-new-domain.com"
  exit 1
fi

echo "Updating domain to: $NEW_DOMAIN"

# Update checkout.js
sed -i '' "s|https://popup-topaz.vercel.app|$NEW_DOMAIN|g" payment/checkout.js

# Update success.js
sed -i '' "s|https://popup-topaz.vercel.app|$NEW_DOMAIN|g" payment/success.js

# Update popup.js
sed -i '' "s|https://popup-topaz.vercel.app|$NEW_DOMAIN|g" popup/popup.js

echo "✅ Domain updated in all files!"
echo "Now run: git commit -am 'Update domain' && git push"
```

**Usage:**
```bash
chmod +x update-domain.sh
./update-domain.sh https://popup.app
```

---

## 🎨 Recommended Setup

### For Professional Launch:

1. **Buy a domain:** `popup.app` or `getpopup.com`
2. **Add to Vercel** (keeps hosting free!)
3. **Update 3 extension files**
4. **Update Chrome Web Store**
5. **Done!**

**Total Cost:** ~$15/year (domain only)
**Monthly Cost:** $0 (Vercel free tier)

---

## 🔗 Setting Up Custom Domain on Vercel

### Step-by-Step:

1. **Go to Vercel:**
   ```
   https://vercel.com/dashboard
   → Your Project
   → Settings
   → Domains
   ```

2. **Add Domain:**
   ```
   Click "Add"
   Enter: popup.app
   ```

3. **Configure DNS:**
   
   **If domain is at Namecheap/GoDaddy:**
   - Add A record: `@` → Vercel IP
   - Add CNAME: `www` → `cname.vercel-dns.com`
   
   **If domain is at Vercel:**
   - Automatic! ✅

4. **Wait for Verification:**
   - Usually 5-60 minutes
   - Vercel will email you when ready

5. **SSL Auto-Enabled:**
   - Vercel provisions SSL certificate
   - Your site is HTTPS automatically!

---

## 🎯 TL;DR

**If you change your domain:**

1. Update 3 files in extension code
2. Add custom domain to Vercel (if using custom domain)
3. Repackage and upload new extension version to Chrome Web Store
4. Update Stripe webhook URL (if configured)

**That's it!** Everything else works automatically. 🚀

**Cost:** $0 if using Vercel subdomain, ~$15/year if using custom domain.

**Recommended:** Use custom domain for professional branding when you launch!

