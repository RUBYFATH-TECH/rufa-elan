#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production Deployment
 * 
 * Run: node generate-secrets.js
 * 
 * This will generate random, cryptographically secure secrets
 * for your production environment variables.
 */

const crypto = require('crypto');

console.log('\n🔐 RUFA ELAN - Production Secrets Generator\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('Copy these values to your production environment variables:\n');
console.log('-----------------------------------------------------------\n');

// Generate secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Display with formatting
console.log('JWT_SECRET=');
console.log(jwtSecret);
console.log('');

console.log('REFRESH_TOKEN_SECRET=');
console.log(refreshTokenSecret);
console.log('');

console.log('SESSION_SECRET=');
console.log(sessionSecret);
console.log('');

console.log('-----------------------------------------------------------\n');
console.log('⚠️  IMPORTANT SECURITY NOTES:\n');
console.log('1. Never commit these secrets to Git');
console.log('2. Store them securely (password manager, secrets vault)');
console.log('3. Use different secrets for each environment');
console.log('4. Rotate secrets periodically for security');
console.log('5. Add these to Render environment variables\n');
console.log('═══════════════════════════════════════════════════════════\n');
