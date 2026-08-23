import { WalletState } from "@/types/user";

/**
 * MOCK SERVICE — no real blockchain connection is made here.
 *
 * When the Solana integration lands, this module will wrap
 * `@solana/wallet-adapter-react` instead of returning canned data.
 * The function signatures below are intentionally the ones a real
 * wallet-adapter integration would expose, so calling components do
 * not need to change.
 */
export const walletService = {
  async connect(): Promise<WalletState> {
    await simulateLatency();
    // MOCK: fabricated address/balance for local development only.
    return {
      connected: true,
      address: "8mQ...F3nT",
      balance: 240,
      network: "solana-devnet",
    };
  },

  async disconnect(): Promise<WalletState> {
    await simulateLatency();
    return {
      connected: false,
      address: null,
      balance: 0,
      network: null,
    };
  },

  getDisconnectedState(): WalletState {
    return { connected: false, address: null, balance: 0, network: null };
  },
};

function simulateLatency(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
