import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

const ownerKeypair = JSON.parse(readFileSync(ownerKeypairPath, 'utf-8'));
const mintKeypair = JSON.parse(readFileSync(mintKeypairPath, 'utf-8'));

const ownerPublicKey = new PublicKey(ownerKeypair.slice(32, 64)); // Extract public key from secret key
const mintPublicKey = new PublicKey(mintKeypair.slice(32, 64));

async function checkToken() {
  console.log('Checking Academy Prime (ACAD) status...');
  console.log('Mint:', mintPublicKey.toString());
  console.log('Owner:', ownerPublicKey.toString());

  try {
    // Check mint info
    const mintInfo = await getMint(connection, mintPublicKey, undefined, TOKEN_PROGRAM_ID);
    console.log('✅ Mint exists!');
    console.log('Supply:', Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals));
    console.log('Decimals:', mintInfo.decimals);
    console.log('Mint Authority:', mintInfo.mintAuthority?.toString());
    console.log('Freeze Authority:', mintInfo.freezeAuthority?.toString());

    // Check owner's token account
    const associatedTokenAccount = await connection.getTokenAccountsByOwner(ownerPublicKey, {
      mint: mintPublicKey,
      programId: TOKEN_PROGRAM_ID
    });

    if (associatedTokenAccount.value.length > 0) {
      const tokenAccount = associatedTokenAccount.value[0];
      const accountInfo = await getAccount(connection, tokenAccount.pubkey, 'confirmed', TOKEN_PROGRAM_ID);
      console.log('✅ Owner token account exists!');
      console.log('Balance:', Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals));
    } else {
      console.log('❌ No token account found for owner');
    }

  } catch (error) {
    console.error('❌ Error checking token:', error);
  }
}

checkToken();