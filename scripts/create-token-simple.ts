import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
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

async function createToken() {
  console.log('Creating Academy Prime (ACAD) on devnet');
  console.log('Mint:', mintKeypair.publicKey.toString());
  console.log('Owner:', ownerKeypair.publicKey.toString());

  try {
    // Create mint
    console.log('Creating mint...');
    const mint = await createMint(
      connection,
      ownerKeypair,
      ownerKeypair.publicKey, // mint authority
      ownerKeypair.publicKey, // freeze authority
      6, // decimals
      mintKeypair,
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('Mint created:', mint.toString());

    // Create associated token account
    console.log('Creating associated token account...');
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      ownerKeypair,
      mint,
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
      mint,
      tokenAccount.address,
      ownerKeypair,
      1000000 * Math.pow(10, 6), // 1M tokens with 6 decimals
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('Mint transaction:', mintSignature);

    console.log('✅ Token created and minted successfully!');
    console.log('Mint Address:', mint.toString());
    console.log('Total Supply: 1,000,000 ACAD');
    console.log('Decimals: 6');

  } catch (error) {
    console.error('❌ Error creating token:', error);
  }
}

createToken();