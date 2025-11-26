// Manual license key generator for customer support
// Usage: node generate-key.js user@email.com cs_test_sessionid

const crypto = require('crypto');

// IMPORTANT: This must match the LICENSE_SECRET in your server.js
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'your-secret-key-change-this-in-production';

function generateLicenseKey(email, sessionId) {
  const data = {
    email,
    sessionId,
    timestamp: Date.now()
  };
  
  // Create signature
  const signature = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(JSON.stringify(data))
    .digest('hex')
    .slice(0, 16);
  
  // Combine email hash + signature
  const emailHash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex')
    .slice(0, 8);
  
  // Format: LPPM-XXXX-XXXX-XXXX-XXXX
  return `LPPM-${emailHash.slice(0, 4)}-${emailHash.slice(4, 8)}-${signature.slice(0, 4)}-${signature.slice(4, 8)}`.toUpperCase();
}

// Get args
const email = process.argv[2];
const sessionId = process.argv[3] || 'manual_' + Date.now();

if (!email) {
  console.log('❌ Error: Email is required');
  console.log('');
  console.log('Usage:');
  console.log('  node generate-key.js user@email.com [session_id]');
  console.log('');
  console.log('Examples:');
  console.log('  node generate-key.js john@example.com cs_test_abc123');
  console.log('  node generate-key.js sarah@company.com');
  console.log('');
  process.exit(1);
}

// Validate email
if (!email.includes('@')) {
  console.log('❌ Error: Invalid email format');
  process.exit(1);
}

// Generate key
const licenseKey = generateLicenseKey(email, sessionId);

// Display
console.log('');
console.log('✅ License Key Generated');
console.log('========================');
console.log('');
console.log('  Email:       ', email);
console.log('  Session ID:  ', sessionId);
console.log('  License Key: ', licenseKey);
console.log('');
console.log('📋 Copy this key and send it to the customer.');
console.log('');

