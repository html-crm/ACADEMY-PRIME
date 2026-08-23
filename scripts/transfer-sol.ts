import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load old wallet keypair
const oldKeypairPath = path.join(__dirname, '../keys/owner-old.json');
const newWalletAddress = 'Ain6uh5jHuttEGMHjuXVyEG7ft3WgyUnJNtQxQxotcWE';

try {
  // Read the original keypair file (before we overwrote it)
  const keypairData = JSON.parse(readFileSync(oldKeypairPath, 'utf-8'));
  const oldKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const newPublicKey = new PublicKey(newWalletAddress);
  
  console.log(`Transferring SOL from ${oldKeypair.publicKey.toString()}`);
  console.log(`                    to ${newWalletAddress}`);
  
  // Get balance
  const balance = await connection.getBalance(oldKeypair.publicKey);
  const solToTransfer = (balance - 5000) / LAMPORTS_PER_SOL; // Keep some for fees
  
  console.log(`Available balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  console.log(`Transferring: ${solToTransfer} SOL\n`);
  
  // Create transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: oldKeypair.publicKey,
    toPubkey: newPublicKey,
    lamports: Math.floor(solToTransfer * LAMPORTS_PER_SOL),
  });
  
  // Create and send transaction
  const transaction = new Transaction().add(transferInstruction);
  const signature = await sendAndConfirmTransaction(connection, transaction, [oldKeypair]);
  
  console.log('✅ SOL transfer successful!');
  console.log(`   Transaction: ${signature}`);
  
} catch (error) {
  if (error instanceof Error && error.message.includes('ENOENT')) {
    console.log('ℹ️  Old keypair not found. Please provide the path to your original keypair file.');
    console.log('   Or manually transfer SOL from your old wallet to the new one.');
    console.log(`\n   New wallet address: ${newWalletAddress}`);
  } else {
    console.error('❌ Transfer failed:', error);
  }
}
