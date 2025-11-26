# 🚀 Redeploy Backend to Vercel

## Your backend code was updated but Vercel is still running the old version!

### Quick Redeploy:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Find your project: `popup-topaz` (or whatever you named it)

2. **Trigger Redeploy:**
   - Click on the project
   - Go to **"Deployments"** tab
   - Find the latest deployment
   - Click the **⋯** (three dots) menu
   - Click **"Redeploy"**
   - Confirm

3. **Wait for deployment** (~30 seconds)

4. **Test again!**

---

## Or Use Git to Auto-Deploy:

Since you just pushed to GitHub, Vercel should auto-deploy if you have it connected.

Check the Deployments tab to see if a new deployment is in progress.

---

## Verify It Works:

Test the endpoint:
```bash
curl -X POST https://popup-topaz.vercel.app/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"extensionId":"test123"}'
```

Should return:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

If you see the `url` field, you're good! ✅

