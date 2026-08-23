import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate new keypairs
const ownerKeypair = Keypair.generate();
const mintKeypair = Keypair.generate();

// Prepare file paths
const keysDir = path.join(__dirname, '../keys');
const ownerPath = path.join(keysDir, 'owner.json');
const mintPath = path.join(keysDir, 'mint-academyprime-token.json');

// Save keypairs as JSON arrays (Solana format)
const ownerJson = Array.from(ownerKeypair.secretKey);
const mintJson = Array.from(mintKeypair.secretKey);

writeFileSync(ownerPath, JSON.stringify(ownerJson, null, 2));
writeFileSync(mintPath, JSON.stringify(mintJson, null, 2));

console.log('✅ New keypairs generated successfully!\n');
console.log('📁 Owner Keypair saved to: ./keys/owner.json');
console.log(`   Public Key: ${ownerKeypair.publicKey.toString()}\n`);

console.log('📁 Mint Keypair saved to: ./keys/mint-academyprime-token.json');
console.log(`   Public Key: ${mintKeypair.publicKey.toString()}\n`);

console.log('⚠️  IMPORTANT: Keep these keypair files secure!');
console.log('   - Never share your private keys');
console.log('   - Add keys/ directory to .gitignore (already should be)');
console.log('   - Backup keys in a secure location\n');
