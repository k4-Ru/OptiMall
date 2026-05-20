import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

import { getPool } from '../api/_lib/db.js';

async function updateImages() {
  const pool = getPool();
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const files = fs.readdirSync(imagesDir);
  
  let updatedCount = 0;
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    let productId = null;
    if (file === 'Mini Desk Fan USB.png') {
      productId = 222;
    } else if (file.match(/^\d+\.png$/)) {
      productId = parseInt(file.replace('.png', ''), 10);
    }
    
    if (productId) {
      const imagePath = `/images/${file}`;
      await pool.query('UPDATE products SET image_path = ? WHERE id = ?', [imagePath, productId]);
      console.log(`Updated product ${productId} with image ${imagePath}`);
      updatedCount++;
    }
  }
  
  console.log(`Done updating ${updatedCount} images.`);
  process.exit(0);
}

updateImages().catch(console.error);
