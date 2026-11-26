import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, WalletController.getWallet);
router.post('/demo-topup', requireAuth, WalletController.claimDemoTopup);

export const walletRoutes = router;
