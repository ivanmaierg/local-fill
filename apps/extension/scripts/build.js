#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build script for Local-Fill extension
// Copies static files and ensures proper structure

const distDir = path.join(__dirname, '../dist');
const srcDir = path.join(__dirname, '../src');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files
const staticFiles = [
  'manifest.json',
  'options.html'
];

staticFiles.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

// Copy icons directory
const iconsSrcDir = path.join(__dirname, '../icons');
const iconsDestDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsSrcDir)) {
  if (!fs.existsSync(iconsDestDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true });
  }
  
  const iconFiles = fs.readdirSync(iconsSrcDir);
  iconFiles.forEach(file => {
    const srcPath = path.join(iconsSrcDir, file);
    const destPath = path.join(iconsDestDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied icon: ${file}`);
  });
}

// Create placeholder icon files if they don't exist
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDestDir, `icon-${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a simple placeholder PNG (1x1 transparent)
    const placeholder = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(iconPath, placeholder);
    console.log(`Created placeholder icon: icon-${size}.png`);
  }
});

console.log('Build script completed successfully!');
