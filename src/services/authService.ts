import { User } from "@/types/user";
import { walletService } from "@/services/walletService";

/**
 * MOCK SERVICE — replace with real calls to
 *   POST /api/v1/auth/login
 *   GET  /api/v1/auth/me
 * once the FastAPI auth service is available. Token storage should move
 * to httpOnly cookies set by the backend at that point.
 */
export const authService = {
  async getCurrentUser(): Promise<User | null> {
    await simulateLatency();
    // MOCK: no session persistence yet — always signed out on load.
    return null;
  },

  async loginWithMock(username: string): Promise<User> {
    await simulateLatency();
    return {
      id: "u-mock-001",
      username,
      avatarUrl: "/images/avatars/default.jpg",
      email: `${username.toLowerCase()}@example.com`,
      joinedAt: new Date().toISOString(),
      coursesCompleted: 3,
      totalTokensEarned: 410,
      wallet: walletService.getDisconnectedState(),
    };
  },
};

function simulateLatency(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
