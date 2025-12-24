/**
 * PWA Icon Generator
 *
 * Generates PWA icons from the source logo.
 * Run with: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../public/images/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon sizes to generate
const ICON_SIZES = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png', maskable: true },
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from:', SOURCE_IMAGE);
  console.log('Output directory:', OUTPUT_DIR);
  console.log('');

  for (const { size, name, maskable } of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);

    try {
      let image = sharp(SOURCE_IMAGE);

      if (maskable) {
        // Maskable icons need padding (safe zone is 80% of icon)
        // Add 10% padding on each side with background color
        const padding = Math.round(size * 0.1);
        const innerSize = size - (padding * 2);

        image = await sharp(SOURCE_IMAGE)
          .resize(innerSize, innerSize, {
            fit: 'contain',
            background: { r: 30, g: 58, b: 95, alpha: 1 } // #1e3a5f
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 30, g: 58, b: 95, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
      } else {
        await image
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✓ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('');
  console.log('PWA icons generated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify the icons look correct in public/icons/');
  console.log('2. Test your PWA with Chrome DevTools > Application > Manifest');
  console.log('3. Run Lighthouse PWA audit to verify setup');
}

generateIcons().catch(console.error);
