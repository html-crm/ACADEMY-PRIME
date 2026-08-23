import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate new deployment wallet
const deploymentKeypair = Keypair.generate();

// Prepare file path
const keysDir = path.join(__dirname, '../keys');
const deploymentPath = path.join(keysDir, 'deployment-wallet.json');

// Save keypair as JSON array (Solana format)
const deploymentJson = Array.from(deploymentKeypair.secretKey);

writeFileSync(deploymentPath, JSON.stringify(deploymentJson, null, 2));

console.log('✅ New deployment wallet created!\n');
console.log('📁 Deployment Wallet saved to: ./keys/deployment-wallet.json');
console.log(`   Public Key: ${deploymentKeypair.publicKey.toString()}\n`);

console.log('⚠️  IMPORTANT:');
console.log(`   1. Transfer your SOL to this address: ${deploymentKeypair.publicKey.toString()}`);
console.log('   2. Once funded, the token deployment will proceed\n');
