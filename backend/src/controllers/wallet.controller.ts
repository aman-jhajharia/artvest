import { Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/wallet.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class WalletController {
  /**
   * GET /api/wallet
   * Retrieves caller's demo ArtCredit balance, investment holdings, and transaction history.
   */
  public static async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const wallet = await WalletService.getWallet(req.user.id);
      res.status(200).json(sendSuccess(wallet, 'Wallet and portfolio retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wallet/demo-topup
   * Claims demo faucet ArtCredits (+5,000 AC).
   */
  public static async claimDemoTopup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(sendError('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const result = await WalletService.claimDemoTopup(req.user.id);
      res.status(200).json(
        sendSuccess(
          result,
          'Successfully claimed +5,000 demo ArtCredits for sandbox testing!'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
