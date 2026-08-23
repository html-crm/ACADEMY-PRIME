import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const walletAddress = 'FBQFDkXMJVZKYXLFGuSiYrKGkDQ8PDrYqz7exsFR7msN';
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const publicKey = new PublicKey(walletAddress);

try {
  console.log(`Requesting airdrop for ${walletAddress}...`);
  const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
  console.log(`Airdrop request submitted: ${signature}`);
  
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });
  
  console.log('✅ Airdrop confirmed! Wallet funded with 2 SOL');
} catch (error) {
  console.error('❌ Airdrop failed:', error);
}
