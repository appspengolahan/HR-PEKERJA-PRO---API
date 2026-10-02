import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines: width * 4 + 1 filter byte per line
  const rawScanlines = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (Math.min(width, height) / 2) * 0.95;
  const innerR = outerR * 0.65;

  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // filter type 0: None
    const dy = y - cy;
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep Industrial Navy Background
      let r = 15, g = 23, b = 42, a = 255; // #0f172a

      if (!isMaskable) {
        // Rounded squircle corner
        const cornerR = width * 0.22;
        const cornerDx = Math.max(0, Math.abs(dx) - (width / 2 - cornerR));
        const cornerDy = Math.max(0, Math.abs(dy) - (height / 2 - cornerR));
        if (Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy) > cornerR) {
          a = 0; // Transparent outside squircle
        }
      }

      if (a > 0) {
        // Diagonal gradient overlay
        const gradT = (x + y) / (width + height);
        r = Math.round(15 + gradT * (30 - 15));
        g = Math.round(23 + gradT * (58 - 23));
        b = Math.round(42 + gradT * (138 - 42));

        // Center emblem circle
        if (dist <= outerR * 0.72) {
          // Blue radial highlight
          r = Math.round(37 + (1 - dist / (outerR * 0.72)) * 30);
          g = Math.round(99 + (1 - dist / (outerR * 0.72)) * 60);
          b = Math.round(235 + (1 - dist / (outerR * 0.72)) * 20);
        }

        // Factory / Worker icon silhouette in center (white)
        const inCenterH = Math.abs(dx) < (width * 0.22) && Math.abs(dy) < (height * 0.22);
        const inGearRing = dist > (outerR * 0.45) && dist < (outerR * 0.52);
        if (inCenterH || inGearRing) {
          r = 255; g = 255; b = 255;
        }

        // Golden accent ring
        if (dist > (outerR * 0.70) && dist < (outerR * 0.74)) {
          r = 56; g = 189; b = 248; // Cyan accent #38bdf8
        }
      }

      rawScanlines[offset++] = r;
      rawScanlines[offset++] = g;
      rawScanlines[offset++] = b;
      rawScanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all standard PWA icon resolutions
console.log('Generating PWA icons...');
fs.writeFileSync('public/pwa-192x192.png', generatePng(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180, 180, false));
fs.writeFileSync('public/favicon.ico', generatePng(32, 32, false));
console.log('Successfully generated all PWA icons in /public:');
console.log('- public/pwa-192x192.png');
console.log('- public/pwa-512x512.png');
console.log('- public/pwa-maskable-512x512.png');
console.log('- public/apple-touch-icon.png');
console.log('- public/favicon.ico');
