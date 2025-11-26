# LinkedIn Post Manager - Chrome Extension

Save, organize, and search LinkedIn posts with your personal knowledge base.

## Features

- 🎯 **Drag & Drop**: Drag any LinkedIn post to pop it out in a clean window
- 🏷️ **Tags & Notes**: Organize posts with custom tags and highlights
- 🔍 **Search & Filter**: Find posts by author, tag, date, or keyword
- 💾 **Download Images**: Save post images with one click
- 📊 **Export to Excel**: Export your library to CSV
- ☁️ **Sync Across Devices**: Uses Chrome storage sync

## Installation

### For Development

1. Clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

### From Chrome Web Store

*Coming soon*

## Monetization Setup

### Free vs Pro

- **Free**: Save up to 100 posts
- **Pro ($9 one-time)**: Unlimited saves + all future features

### Setting Up Stripe Payments

1. **Create a Stripe Account**: https://stripe.com
2. **Create a Product**:
   - Go to Products → Add Product
   - Name: "LinkedIn Post Manager Pro"
   - Price: $9 one-time
   - Copy the Price ID (starts with `price_`)

3. **Get Your API Keys**:
   - Go to Developers → API Keys
   - Copy your Publishable key (`pk_test_...`)
   - Copy your Secret key (`sk_test_...`)

4. **Update Extension Files**:
   ```javascript
   // In payment/checkout.js
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY';
   const CHECKOUT_ENDPOINT = 'https://your-backend.com/create-checkout-session';
   ```

5. **Deploy Backend**:
   ```bash
   cd backend-example
   npm install
   
   # Update server.js with your keys:
   # - Stripe secret key
   # - Price ID
   # - Webhook secret (from Stripe Dashboard → Webhooks)
   
   # Deploy to Vercel/Railway/Heroku
   npm start
   ```

6. **Set Up Webhook**:
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://your-backend.com/webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret to `server.js`

7. **Update Checkout Endpoint**:
   ```javascript
   // In payment/checkout.js
   const CHECKOUT_ENDPOINT = 'https://your-actual-backend.com/create-checkout-session';
   ```

### Landing Page

Deploy the `landing/` folder to:
- Vercel: `vercel deploy landing/`
- Netlify: Drag & drop the folder
- GitHub Pages: Push to `gh-pages` branch

Update `landing/script.js` with your Chrome Web Store URL after publishing.

## Project Structure

```
├── manifest.json           # Extension config
├── background.js          # Background service worker
├── content/               # Content script (LinkedIn page)
│   ├── drag.js
│   └── drag.css
├── post_window/           # Pop-out window
│   ├── post_window.html
│   ├── post_window.js
│   └── post_window.css
├── sidepanel/             # Library sidebar
│   ├── sidepanel.html
│   ├── sidepanel.js
│   └── sidepanel.css
├── payment/               # Payment flow
│   ├── checkout.html
│   ├── checkout.js
│   ├── success.html
│   └── success.js
├── landing/               # Marketing landing page
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── backend-example/       # Stripe backend
    ├── server.js
    └── package.json
```

## Testing Payments

1. Use Stripe test mode keys
2. Test card: `4242 4242 4242 4242`, any future date, any CVC
3. After "payment", user sees success page and Pro is activated

## Publishing to Chrome Web Store

1. Create a developer account: https://chrome.google.com/webstore/devconsole
2. Zip the extension folder (exclude `backend-example/`, `landing/`, `README.md`)
3. Upload to Chrome Web Store
4. Fill in store listing (use landing page copy)
5. Submit for review

## License

MIT

## Support

Email: support@yoursite.com
