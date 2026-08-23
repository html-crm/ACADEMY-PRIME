export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // ACADEMY PRIME token balance, mock until Solana integration
  network: "solana-devnet" | "solana-mainnet-beta" | null;
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  email: string;
  joinedAt: string;
  coursesCompleted: number;
  totalTokensEarned: number;
  wallet: WalletState;
}

export type Locale = "en" | "ar";

export interface LocaleConfig {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}
