// Simple script to create PNG icons from Canvas
// Run with: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#0A66C2');
  
  // Draw rounded rectangle
  const radius = size * 0.1875; // 24/128 ratio
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw checkmark
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.09375; // 12/128 ratio
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(size * 0.3125, size * 0.5); // 40/128, 64/128
  ctx.lineTo(size * 0.4375, size * 0.625); // 56/128, 80/128
  ctx.lineTo(size * 0.6875, size * 0.375); // 88/128, 48/128
  ctx.stroke();

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Generated ${filename}`);
}

// Generate all icon sizes
try {
  generateIcon(16, 'icon16.png');
  generateIcon(48, 'icon48.png');
  generateIcon(128, 'icon128.png');
  console.log('🎉 All icons generated successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nTo install canvas:');
  console.log('npm install canvas');
}

