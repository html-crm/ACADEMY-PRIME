import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createSetAuthorityInstruction, AuthorityType, TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

async function revokeAuthorities() {
  const mintPublicKey = mintKeypair.publicKey;

  console.log('Revoking mint authorities for Academy Prime (ACAD)...');
  console.log('Mint:', mintPublicKey.toString());

  try {
    // Create transaction
    const transaction = new Transaction();

    // Revoke mint authority
    console.log('Revoking mint authority...');
    const revokeMintIx = createSetAuthorityInstruction(
      mintPublicKey,
      ownerKeypair.publicKey,
      AuthorityType.MintTokens,
      null, // Set to null to disable
      [],
      TOKEN_PROGRAM_ID
    );
    transaction.add(revokeMintIx);

    // Revoke freeze authority
    console.log('Revoking freeze authority...');
    const revokeFreezeIx = createSetAuthorityInstruction(
      mintPublicKey,
      ownerKeypair.publicKey,
      AuthorityType.FreezeAccount,
      null, // Set to null to disable
      [],
      TOKEN_PROGRAM_ID
    );
    transaction.add(revokeFreezeIx);

    // Send transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [ownerKeypair]);

    console.log('✅ All authorities successfully revoked!');
    console.log('Transaction:', signature);
    console.log('Token is now immutable - no more minting or freezing possible.');

  } catch (error) {
    console.error('❌ Error revoking authorities:', error);
  }
}

revokeAuthorities();