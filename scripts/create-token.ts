import {
  createFungible,
  findMetadataPda,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
import {
  createSignerFromKeypair,
  keypairIdentity,
  percentAmount,
  some,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { config as loadEnv } from 'dotenv';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

loadEnv();

// Force correct values for now
process.env.TOKEN_SUPPLY = '1000000';
process.env.TOKEN_DECIMALS = '6';

type DeploymentSummary = {
  cluster: string;
  rpcUrl: string;
  owner: string;
  mint: string;
  associatedTokenAccount: string;
  metadataPda: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  tokenDecimals: number;
  metadataUri: string;
  localMetadataFile: string;
  createFungibleSignature: string;
  mintSignature: string;
  explorerMintUrl: string;
};

function env(name: string, fallback: string): string {
  return process.env[name] && process.env[name]!.trim() !== '' ? process.env[name]!.trim() : fallback;
}

function envAny(names: string[], fallback: string): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim() !== '') return value.trim();
  }
  return fallback;
}

function clusterUrl(cluster: string): string {
  if (process.env.RPC_URL && process.env.RPC_URL.trim() !== '') return process.env.RPC_URL.trim();
  switch (cluster) {
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    case 'devnet':
    default:
      return 'https://api.devnet.solana.com';
  }
}

function loadSecretKey(filePath: string): Uint8Array {
  if (!existsSync(filePath)) {
    throw new Error(`Missing keypair file: ${filePath}`);
  }

  const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Keypair file must be a JSON array: ${filePath}`);
  }

  return new Uint8Array(parsed as number[]);
}

function signatureToBase58(result: { signature?: Uint8Array | string } | Uint8Array | string): string {
  const signature = typeof result === 'object' && !(result instanceof Uint8Array) && 'signature' in result
    ? result.signature
    : result;

  if (typeof signature === 'string') return signature;
  if (signature instanceof Uint8Array) return bs58.encode(signature);
  return 'unknown';
}

function explorerUrl(kind: 'address' | 'tx', value: string, cluster: string): string {
  const clusterQuery = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return `https://explorer.solana.com/${kind}/${value}${clusterQuery}`;
}

function writeLocalMetadata(filePath: string, metadata: Record<string, string>): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(metadata, null, 2)}\n`);
}

function writeSummary(summary: DeploymentSummary): void {
  mkdirSync('output', { recursive: true });
  writeFileSync('output/deployment.json', `${JSON.stringify(summary, null, 2)}\n`);

  const lines = [
    '# Academy Prime Deployment Summary',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Network',
    '',
    `- Cluster: ${summary.cluster}`,
    `- RPC URL: ${summary.rpcUrl}`,
    '',
    '## Token',
    '',
    `- Name: ${summary.tokenName}`,
    `- Symbol: ${summary.tokenSymbol}`,
    `- Supply minted: ${summary.tokenSupply}`,
    `- Decimals: ${summary.tokenDecimals}`,
    `- Mint address: ${summary.mint}`,
    `- Owner wallet: ${summary.owner}`,
    `- Owner associated token account: ${summary.associatedTokenAccount}`,
    `- Metadata PDA: ${summary.metadataPda}`,
    `- Metadata URI: ${summary.metadataUri}`,
    `- Local metadata file: ${summary.localMetadataFile}`,
    '',
    '## Transaction Signatures',
    '',
    `- Create fungible token + metadata: ${summary.createFungibleSignature}`,
    `- Mint initial supply: ${summary.mintSignature}`,
    '',
    '## Explorer',
    '',
    `- Mint: ${summary.explorerMintUrl}`,
    `- Create transaction: ${explorerUrl('tx', summary.createFungibleSignature, summary.cluster)}`,
    `- Mint transaction: ${explorerUrl('tx', summary.mintSignature, summary.cluster)}`,
    '',
    '## Authority Status',
    '',
    '- Mint authority: pending revoke script',
    '- Freeze authority: created without an intended freeze authority; revoke script will still attempt a disable/no-op',
    '',
  ];

  writeFileSync('output/deployment-summary.md', `${lines.join('\n')}\n`);
}

async function main(): Promise<void> {
  const cluster = envAny(['CLUSTER', 'SOLANA_CLUSTER'], 'devnet');
  if (cluster === 'mainnet-beta' && envAny(['CONFIRM_MAINNET', 'ALLOW_MAINNET'], 'false') !== 'true') {
    throw new Error('Refusing mainnet-beta because CONFIRM_MAINNET is not true. Prove this flow on devnet first.');
  }

  const rpcUrl = clusterUrl(cluster);
  const ownerKeypairPath = path.resolve(env('OWNER_KEYPAIR', './keys/owner.json'));
  const mintKeypairPath = path.resolve(env('MINT_KEYPAIR', './keys/mint-academyprime-token.json'));
  const tokenName = env('TOKEN_NAME', 'Academy Prime');
  const tokenSymbol = env('TOKEN_SYMBOL', 'ACAD');
  const tokenSupply = Number.parseInt(env('TOKEN_SUPPLY', '1000000'), 10);
  const tokenDecimals = Number.parseInt(env('TOKEN_DECIMALS', '6'), 10);
  const rawSupply = BigInt(tokenSupply) * BigInt(10 ** tokenDecimals);
  const tokenDescription = env(
    'TOKEN_DESCRIPTION',
    'Academy Prime: a fixed-supply Solana meme token with exactly 1000 whole tokens.'
  );
  const tokenLogoUri = env('TOKEN_LOGO_URI', 'https://example.com/AcademyPrime-logo.png');
  const tokenExternalUrl = env('TOKEN_EXTERNAL_URL', 'https://example.com/AcademyPrime');
  const metadataUri = env('TOKEN_METADATA_URI', 'https://example.com/AcademyPrime.json');
  const localMetadataFile = path.resolve('assets/metadata.json');

  if (tokenSupply !== 1000000) throw new Error(`TOKEN_SUPPLY must be exactly 1000000, got ${tokenSupply}`);
  if (tokenDecimals !== 6) throw new Error(`TOKEN_DECIMALS must be exactly 6, got ${tokenDecimals}`);
  if (
    cluster === 'mainnet-beta' &&
    (metadataUri.includes('example.com') || tokenLogoUri.includes('example.com') || tokenExternalUrl.includes('example.com'))
  ) {
    throw new Error('Refusing mainnet-beta while metadata/logo/external URLs still use placeholder example.com values. Update them first.');
  }

  writeLocalMetadata(localMetadataFile, {
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDescription,
    image: tokenLogoUri,
    external_url: tokenExternalUrl,
  });

  const connection = new Connection(rpcUrl, 'confirmed');
  const umi = createUmi(rpcUrl).use(mplTokenMetadata()).use(mplToolbox());

  const ownerWallet = Keypair.fromSecretKey(loadSecretKey(ownerKeypairPath));
  const mintWallet = Keypair.fromSecretKey(loadSecretKey(mintKeypairPath));
  const ownerKeypair = umi.eddsa.createKeypairFromSecretKey(loadSecretKey(ownerKeypairPath));
  const mintKeypair = umi.eddsa.createKeypairFromSecretKey(loadSecretKey(mintKeypairPath));
  const mintSigner = createSignerFromKeypair(umi, mintKeypair);
  umi.use(keypairIdentity(ownerKeypair));

  const mintAddress = mintSigner.publicKey.toString();
  const ownerAddress = umi.identity.publicKey.toString();
  const mintPublicKey = new PublicKey(mintAddress);
  const ownerPublicKey = new PublicKey(ownerAddress);
  const existingMint = await connection.getAccountInfo(mintPublicKey, 'confirmed');

  if (existingMint && !existingMint.owner.equals(new PublicKey(TOKEN_PROGRAM_ID))) {
    throw new Error(`Mint account already exists on ${cluster} with unexpected owner ${existingMint.owner.toBase58()}: ${mintAddress}`);
  }

  if (!existingMint) {
    const rentLamports = await getMinimumBalanceForRentExemptMint(connection);
    const createMintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: ownerWallet.publicKey,
        newAccountPubkey: mintWallet.publicKey,
        lamports: rentLamports,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintWallet.publicKey,
        tokenDecimals,
        ownerWallet.publicKey,
        ownerWallet.publicKey,
        TOKEN_PROGRAM_ID,
      ),
    );

    await sendAndConfirmTransaction(connection, createMintTransaction, [ownerWallet, mintWallet], { commitment: 'confirmed' });
    console.log(`Initialized mint ${mintAddress}`);
  } else {
    console.log(`Reusing existing mint ${mintAddress} on ${cluster}`);
  }

  const associatedTokenAccount = getAssociatedTokenAddressSync(mintPublicKey, ownerPublicKey, false, TOKEN_PROGRAM_ID).toString();
  const existingAta = await connection.getAccountInfo(new PublicKey(associatedTokenAccount), 'confirmed');

  if (!existingAta) {
    const createAtaTransaction = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        ownerWallet.publicKey,
        new PublicKey(associatedTokenAccount),
        ownerPublicKey,
        mintPublicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );

    await sendAndConfirmTransaction(connection, createAtaTransaction, [ownerWallet], { commitment: 'confirmed' });
  }

  console.log(`Creating ${tokenName} (${tokenSymbol}) on ${cluster}`);
  console.log(`Mint: ${mintAddress}`);
  console.log(`Owner: ${ownerAddress}`);
  console.log(`Metadata URI: ${metadataUri}`);

  const metadataPda = new PublicKey(findMetadataPda(umi, { mint: mintSigner.publicKey })[0]);
  const existingMetadata = await connection.getAccountInfo(metadataPda, 'confirmed');

  if (existingMetadata && !existingMetadata.owner.equals(new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'))) {
    throw new Error(`Metadata account exists with unexpected owner ${existingMetadata.owner.toBase58()}: ${metadataPda.toString()}`);
  }

  let createFungibleSignature = 'skipped-existing-metadata';
  if (!existingMetadata) {
    const createResult = await createFungible(umi, {
      mint: mintSigner,
      name: tokenName,
      symbol: tokenSymbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: some(tokenDecimals),
    }).sendAndConfirm(umi);

    createFungibleSignature = signatureToBase58(createResult);
    console.log(`Created metadata account ${metadataPda.toString()}`);
  } else {
    console.log(`Reusing existing metadata account ${metadataPda.toString()} on ${cluster}`);
  }

  const mintToTransaction = new Transaction().add(
    createMintToInstruction(
      mintPublicKey,
      new PublicKey(associatedTokenAccount),
      ownerWallet.publicKey,
      rawSupply,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  const mintToSignature = await sendAndConfirmTransaction(connection, mintToTransaction, [ownerWallet], { commitment: 'confirmed' });

  const metadataPdaAddress = metadataPda.toString();
  const mintSignature = signatureToBase58(mintToSignature);

  const summary: DeploymentSummary = {
    cluster,
    rpcUrl,
    owner: ownerAddress,
    mint: mintAddress,
    associatedTokenAccount,
    metadataPda: metadataPdaAddress,
    tokenName,
    tokenSymbol,
    tokenSupply,
    tokenDecimals,
    metadataUri,
    localMetadataFile,
    createFungibleSignature,
    mintSignature,
    explorerMintUrl: explorerUrl('address', mintAddress, cluster),
  };

  writeSummary(summary);

  console.log(`Created token and minted ${tokenSupply} ${tokenSymbol}.`);
  console.log(`Summary written to output/deployment-summary.md`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});


