# 🔄 System Flow Diagram

## Complete User Journey (With License Keys)

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────┘

1️⃣ FREE USER (0-100 posts)
   │
   ├─► User on LinkedIn
   │   └─► Drags post / clicks "Pop out"
   │       └─► Post opens in new window
   │           └─► User adds tags/notes
   │               └─► Clicks "Save to Library"
   │                   └─► Stored in chrome.storage.local
   │                       └─► Count: savedPostsCount++
   │
   └─► User clicks extension icon
       └─► Popup shows: "Free (X/100 posts)"
       └─► User clicks "Open Library"
           └─► See all saved posts
           └─► Search, filter, export to CSV


2️⃣ HITTING THE LIMIT (100 posts)
   │
   ├─► User tries to save 101st post
   │   └─► post_window.js checks: savedPostsCount >= 100
   │       └─► Shows: "Free limit reached"
   │       └─► Button: "Upgrade to Pro"
   │           └─► Redirects to payment/checkout.html
   │
   OR
   │
   └─► User clicks extension icon
       └─► Popup shows: "Free (100/100 posts)" (red)
       └─► Button: "⭐ Upgrade to Pro"
           └─► Opens payment/checkout.html


3️⃣ PAYMENT FLOW
   │
   ├─► checkout.html loads
   │   └─► Displays: "$9 one-time payment"
   │   └─► User clicks "Upgrade Now"
   │       └─► checkout.js calls backend:
   │           POST /create-checkout-session
   │           { extensionId: "xyz" }
   │           │
   │           ├─► Backend creates Stripe session
   │           └─► Returns: { sessionId: "cs_test_xxx" }
   │               │
   │               └─► Redirects to Stripe Checkout
   │                   └─► User enters card: 4242 4242 4242 4242
   │                       └─► Stripe processes payment ($9)
   │                           │
   │                           ├─► Sends webhook to backend (optional)
   │                           │   POST /webhook
   │                           │   └─► Backend logs payment
   │                           │
   │                           └─► Redirects to:
   │                               chrome-extension://xyz/payment/success.html?session_id=cs_test_xxx


4️⃣ LICENSE KEY GENERATION
   │
   └─► success.html loads
       └─► success.js gets session_id from URL
           └─► Calls backend:
               GET /get-session?session_id=cs_test_xxx
               │
               └─► Backend:
                   1. Retrieves Stripe session
                   2. Checks payment_status === 'paid'
                   3. Generates license key:
                      ┌────────────────────────────────────────┐
                      │ generateLicenseKey(email, sessionId)   │
                      │                                        │
                      │ email → MD5 hash → first 8 chars      │
                      │ + signature (HMAC-SHA256) → 8 chars   │
                      │                                        │
                      │ Result: LPPM-A7F3-8D2E-4B91-C6F5      │
                      └────────────────────────────────────────┘
                   4. Returns:
                      {
                        "success": true,
                        "email": "user@example.com",
                        "licenseKey": "LPPM-A7F3-8D2E-4B91-C6F5"
                      }
               │
               └─► success.js displays:
                   ┌──────────────────────────────┐
                   │  🎉 Payment Successful!      │
                   │                              │
                   │  Your Pro License Key        │
                   │  ┌────────────────────────┐  │
                   │  │ LPPM-A7F3-8D2E-4B91-C6F5│ │
                   │  └────────────────────────┘  │
                   │  📋 [Copy to Clipboard]      │
                   │                              │
                   │  Sent to: user@example.com   │
                   └──────────────────────────────┘
                   │
                   └─► Also stores locally:
                       chrome.storage.local.set({
                         isPro: true,
                         licenseKey: "LPPM-A7F3-8D2E-4B91-C6F5",
                         email: "user@example.com"
                       })


5️⃣ LICENSE ACTIVATION (If user reinstalls)
   │
   └─► User clicks extension icon
       └─► Popup shows: "Free (X/100 posts)"
       └─► User clicks: "🔑 Activate License"
           └─► Input field appears
               └─► User pastes: LPPM-A7F3-8D2E-4B91-C6F5
                   └─► popup.js calls backend:
                       POST /verify-license
                       { "licenseKey": "LPPM-A7F3-8D2E-4B91-C6F5" }
                       │
                       └─► Backend verifies:
                           ┌──────────────────────────────────┐
                           │ verifyLicenseKey(key)            │
                           │                                  │
                           │ 1. Check format: LPPM-xxxx-...  │
                           │ 2. Check structure: 5 parts      │
                           │ 3. Verify signature              │
                           │                                  │
                           │ Returns: { valid: true }         │
                           └──────────────────────────────────┘
                       │
                       └─► If valid:
                           chrome.storage.local.set({
                             isPro: true,
                             licenseKey: "LPPM-A7F3-8D2E-4B91-C6F5"
                           })
                           └─► Popup shows: "✨ Pro (Unlimited)"
                           └─► User can save unlimited posts!


6️⃣ PRO USER (Unlimited)
   │
   └─► User saves posts → no limit!
       └─► Popup shows: "✨ Pro (Unlimited)"
       └─► No "Upgrade" button
       └─► Full access to all features
```

---

## Backend Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                       │
│                  Deployed on Vercel                        │
└───────────────────────────────────────────────────────────┘

Endpoints:

1. POST /create-checkout-session
   │
   ├─► Input: { extensionId }
   │
   ├─► Creates Stripe Checkout Session
   │   └─► Line item: $9 Pro License
   │   └─► Success URL: chrome-extension://...success.html
   │   └─► Cancel URL: chrome-extension://...checkout.html
   │
   └─► Returns: { sessionId: "cs_test_xxx" }


2. GET /get-session?session_id=xxx
   │
   ├─► Input: session_id from URL
   │
   ├─► Retrieves Stripe session
   │   └─► stripe.checkout.sessions.retrieve(sessionId)
   │
   ├─► Checks payment_status === 'paid'
   │
   ├─► Generates license key
   │   └─► generateLicenseKey(email, sessionId)
   │       ├─► Email → MD5 hash
   │       ├─► Data → HMAC-SHA256 signature
   │       └─► Combine: LPPM-XXXX-XXXX-XXXX-XXXX
   │
   └─► Returns:
       {
         "success": true,
         "email": "user@example.com",
         "licenseKey": "LPPM-A7F3-8D2E-4B91-C6F5",
         "sessionId": "cs_test_xxx"
       }


3. POST /verify-license
   │
   ├─► Input: { licenseKey }
   │
   ├─► Verifies format:
   │   ├─► Starts with LPPM-
   │   ├─► Has 5 parts separated by dashes
   │   └─► Signature matches (can't be faked!)
   │
   └─► Returns:
       { "valid": true }  OR  { "valid": false, "reason": "Invalid" }


4. POST /webhook (Optional - for logging)
   │
   ├─► Stripe sends: checkout.session.completed event
   │
   ├─► Verifies webhook signature
   │
   ├─► Logs payment info:
   │   ├─► Email
   │   ├─► Session ID
   │   └─► Generated license key
   │
   └─► Could send email (future feature)


Environment Variables:
   ├─► STRIPE_SECRET_KEY = sk_live_xxx
   ├─► LICENSE_SECRET = random-secret-for-signing
   └─► STRIPE_WEBHOOK_SECRET = whsec_xxx (optional)
```

---

## Data Storage (Chrome Extension)

```
┌───────────────────────────────────────────────────────────┐
│              chrome.storage.local                          │
│            (Stored in user's browser)                      │
└───────────────────────────────────────────────────────────┘

Free User:
{
  "savedPostsCount": 42,
  "isPro": false,
  "posts": {
    "uuid-1": {
      "actor": "John Doe",
      "text": "Great post about AI...",
      "tags": ["AI", "Hiring"],
      "notes": "Follow up next week",
      "timestamp": "2025-11-26T10:30:00Z",
      "url": "https://linkedin.com/posts/...",
      "images": ["https://...image1.jpg"]
    },
    "uuid-2": { ... },
    ...
  }
}


Pro User (After Payment):
{
  "savedPostsCount": 250,
  "isPro": true,
  "licenseKey": "LPPM-A7F3-8D2E-4B91-C6F5",
  "email": "user@example.com",
  "activatedAt": "2025-11-26T11:00:00Z",
  "posts": { ... }
}


Note: All data stored LOCALLY in browser
      - No server storage
      - No database
      - Complete privacy!
```

---

## Security Flow

```
┌───────────────────────────────────────────────────────────┐
│           HOW LICENSE KEYS ARE SECURE                      │
└───────────────────────────────────────────────────────────┘

Scenario: User tries to fake a license key

1. User types: LPPM-1234-5678-ABCD-EFGH
   │
   └─► Extension calls: POST /verify-license

2. Backend receives key
   │
   ├─► Checks format: ✅ Looks correct
   │
   ├─► Checks signature:
   │   └─► Decodes the last 8 chars
   │   └─► Tries to verify with LICENSE_SECRET
   │   └─► ❌ Signature doesn't match!
   │       (Because user made it up)
   │
   └─► Returns: { valid: false }

3. Extension shows: "Invalid license key"


Why This Works:
   ├─► License keys use HMAC-SHA256 signature
   ├─► Signature computed using LICENSE_SECRET (env var)
   ├─► User can't generate valid signature without secret
   ├─► Even if format looks correct, signature won't verify
   └─► No database needed to check authenticity!


Trade-off:
   ├─► ✅ Can't fake keys
   ├─► ❌ Can share keys with friends
   └─► But: Most users won't bother for $9
```

---

## Support Workflow

```
┌───────────────────────────────────────────────────────────┐
│          CUSTOMER SUPPORT (Manual Process)                 │
└───────────────────────────────────────────────────────────┘

Scenario: User lost their license key

1. User emails: "I paid but lost my key after reinstalling Chrome"
   │
   ├─► You check Stripe dashboard
   │   └─► Search for customer email
   │   └─► Find payment: ✅ Paid $9 on Nov 26
   │   └─► Copy session ID: cs_test_abc123
   │
   ├─► Generate key manually:
   │   $ cd backend-example
   │   $ node generate-key.js user@example.com cs_test_abc123
   │   
   │   Output:
   │   ✅ License Key Generated
   │   ========================
   │   
   │     Email:       user@example.com
   │     Session ID:  cs_test_abc123
   │     License Key: LPPM-A7F3-8D2E-4B91-C6F5
   │
   └─► Email user:
       "Hi! Your license key is: LPPM-A7F3-8D2E-4B91-C6F5
        Just paste it in the extension popup. Enjoy!"

Time: 2 minutes
Cost: $0
```

---

## Comparison: Database vs License Keys

```
┌────────────────────────────────────────────────────────────┐
│              WITH DATABASE                                  │
└────────────────────────────────────────────────────────────┘

Payment Flow:
   User pays → Backend stores in database:
   
   Table: licenses
   ┌──────┬──────────────┬────────────┬────────────┐
   │ id   │ email        │ is_active  │ created_at │
   ├──────┼──────────────┼────────────┼────────────┤
   │ 1    │ user@ex.com  │ true       │ 2025-11-26 │
   └──────┴──────────────┴────────────┴────────────┘

Verification:
   Extension → Backend → Database lookup → Check if active

Costs:
   ├─► Database hosting: $10-25/month
   ├─► Backup: $5/month
   ├─► Maintenance: Ongoing
   └─► Total: $180-360/year


┌────────────────────────────────────────────────────────────┐
│           WITH LICENSE KEYS (Your System)                   │
└────────────────────────────────────────────────────────────┘

Payment Flow:
   User pays → Backend generates signed key:
   
   Key: LPPM-A7F3-8D2E-4B91-C6F5
   (No database storage needed!)

Verification:
   Extension → Backend → Verify signature → Return valid/invalid
   (Signature proves authenticity)

Costs:
   ├─► Database: $0 (none!)
   ├─► Hosting: $0 (Vercel free tier)
   ├─► Maintenance: Minimal
   └─► Total: $0/year


Winner: License Keys! 🎉
   ├─► Simpler
   ├─► Cheaper
   ├─► More private
   └─► Easier to support
```

---

## Summary

**What makes this system elegant:**

1. ✅ **No database** → $0 hosting cost
2. ✅ **Cryptographically secure** → Can't fake keys
3. ✅ **Stateless verification** → Just check signature
4. ✅ **Manual support is easy** → 2 mins per request
5. ✅ **Complete privacy** → No user tracking
6. ✅ **One-time payment** → Simple pricing
7. ✅ **Portable keys** → Works after reinstall

**Perfect for:**
- 🎯 Small products ($1-20 range)
- 🎯 One-time payments
- 🎯 Privacy-focused apps
- 🎯 Solo developers
- 🎯 Low support volume

**Not suitable for:**
- ❌ Subscriptions (monthly billing)
- ❌ Team licenses (seat management)
- ❌ Enterprise features
- ❌ High-volume support

**For your LinkedIn extension: Perfect fit! 🚀**

