import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load keypairs
const ownerKeypairPath = path.join(__dirname, '../keys/owner.json');
const mintKeypairPath = path.join(__dirname, '../keys/mint-academyprime-token.json');

const ownerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(ownerKeypairPath, 'utf-8'))));
const mintKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync(mintKeypairPath, 'utf-8'))));

async function mintTokens() {
  const mintPublicKey = mintKeypair.publicKey;

  console.log('Minting Academy Prime (ACAD) tokens...');
  console.log('Mint:', mintPublicKey.toString());
  console.log('Owner:', ownerKeypair.publicKey.toString());

  try {
    // Create associated token account if it doesn't exist
    console.log('Creating/checking associated token account...');
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      ownerKeypair,
      mintPublicKey,
      ownerKeypair.publicKey,
      false,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('Token account:', tokenAccount.address.toString());

    // Mint tokens
    console.log('Minting 1,000,000 tokens...');
    const mintSignature = await mintTo(
      connection,
      ownerKeypair,
      mintPublicKey,
      tokenAccount.address,
      ownerKeypair,
      1000000 * Math.pow(10, 6), // 1M tokens with 6 decimals
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('✅ Tokens minted successfully!');
    console.log('Mint transaction:', mintSignature);
    console.log('Total Supply: 1,000,000 ACAD');
    console.log('Owner Balance: 1,000,000 ACAD');

  } catch (error) {
    console.error('❌ Error minting tokens:', error);
  }
}

mintTokens();