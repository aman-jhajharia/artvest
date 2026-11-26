import { ApiResponse, WalletData } from '@/types';
import { API_BASE_URL } from '@/config/api';

export class WalletApiService {
  /**
   * Fetch live ArtCredit balance, investment portfolio, and transaction ledger.
   */
  public static async getWallet(): Promise<ApiResponse<WalletData>> {
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch wallet information',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Claim free demo ArtCredits faucet (+5,000 AC).
   */
  public static async claimDemoTopup(): Promise<
    ApiResponse<{ newBalance: number; amountAdded: number }>
  > {
    try {
      const res = await fetch(`${API_BASE_URL}/wallet/demo-topup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to claim demo faucet top-up',
        error: { code: 'NETWORK_ERROR', details: String(error) },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
