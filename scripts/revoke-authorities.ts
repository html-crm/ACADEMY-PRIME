import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { setAuthority, AuthorityType, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function clusterUrl(cluster: string): string {
  return cluster === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : cluster === 'testnet'
      ? 'https://api.testnet.solana.com'
      : 'https://api.devnet.solana.com';
}

const cluster = process.env.CLUSTER || process.env.SOLANA_CLUSTER || 'devnet';
const connection = new Connection(clusterUrl(cluster), 'confirmed');

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
    // Revoke mint authority (set to null)
    console.log('Revoking mint authority...');
    const mintAuthorityTx = await setAuthority(
      connection,
      ownerKeypair,
      mintPublicKey,
      ownerKeypair.publicKey,
      AuthorityType.MintTokens,
      null, // new authority (null = disabled)
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('✅ Mint authority revoked!');
    console.log('Transaction:', mintAuthorityTx);

    // Revoke freeze authority (set to null)
    console.log('Revoking freeze authority...');
    const freezeAuthorityTx = await setAuthority(
      connection,
      ownerKeypair,
      mintPublicKey,
      ownerKeypair.publicKey,
      AuthorityType.FreezeAccount,
      null, // new authority (null = disabled)
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );

    console.log('✅ Freeze authority revoked!');
    console.log('Transaction:', freezeAuthorityTx);

    console.log('✅ All authorities successfully revoked!');
    console.log('Token is now immutable - no more minting or freezing possible.');

  } catch (error) {
    console.error('❌ Error revoking authorities:', error);
  }
}

revokeAuthorities();