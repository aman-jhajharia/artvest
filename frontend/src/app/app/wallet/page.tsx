'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WalletData } from '@/types';
import { WalletApiService } from '@/features/wallet/services/wallet.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Wallet,
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  FolderGit2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Lock,
} from 'lucide-react';

export default function WalletPage() {
  const { refreshUser } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);
  const [faucetError, setFaucetError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await WalletApiService.getWallet();
      if (res.success && res.data) {
        setWallet(res.data);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleClaimFaucet = async () => {
    setIsClaiming(true);
    setFaucetMessage(null);
    setFaucetError(null);
    try {
      const res = await WalletApiService.claimDemoTopup();
      if (res.success && res.data) {
        setFaucetMessage('Claimed +5,000 demo ArtCredits! Sandbox balance updated.');
        await refreshUser();
        await fetchWallet();
        setTimeout(() => setFaucetMessage(null), 4000);
      } else {
        setFaucetError(res.message || 'Could not claim demo faucet');
      }
    } catch (err) {
      setFaucetError(err instanceof Error ? err.message : 'Failed to claim faucet');
    } finally {
      setIsClaiming(false);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'SIGNUP_BONUS':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Welcome Bonus
          </span>
        );
      case 'DEMO_TOPUP':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Demo Faucet
          </span>
        );
      case 'PROJECT_INVESTMENT':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Fractional Backing
          </span>
        );
      case 'PROJECT_FUNDING_RECEIVED':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Funding Payout
          </span>
        );
      case 'INVESTMENT_HOLD':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Lock className="w-2.5 h-2.5" /> Escrow Hold
          </span>
        );
      case 'INVESTMENT_SETTLED':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-2.5 h-2.5" /> IPO Allotted
          </span>
        );
      case 'INVESTMENT_RELEASED':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
            <RefreshCw className="w-2.5 h-2.5" /> Hold Released
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {type}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs text-gray-400">Loading ArtCredit ledger & portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Wallet Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">ArtCredits Demo Wallet</h2>
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                    Virtual Sandbox Currency
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-medium text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                1 AC = 1 Demo Credit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Available Spendable</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    {wallet?.creditBalance.toLocaleString() || 0}
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">AC</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
                <span className="text-xs text-amber-300/80 block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> In IPO Escrow (Held)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {wallet?.heldBalance.toLocaleString() || 0}
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">AC</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Total Account Balance</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono tracking-tight">
                    {((wallet?.totalBalance ?? ((wallet?.creditBalance || 0) + (wallet?.heldBalance || 0)))).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">AC</span>
                </div>
              </div>
            </div>

            {/* Faucet notifications */}
            {faucetMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{faucetMessage}</span>
              </div>
            )}
            {faucetError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{faucetError}</span>
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Simulated virtual currency for backer demos & creative team pitches.</span>
            </div>

            <button
              onClick={handleClaimFaucet}
              disabled={isClaiming}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Claiming Faucet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim Demo Faucet (+5,000 AC)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Portfolio Stats Card */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Portfolio Summary
          </h3>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-0.5">Total Contributed to Pitches</span>
              <span className="text-xl font-bold font-mono text-white">
                {wallet?.totalInvestedCredits.toLocaleString() || 0}{' '}
                <span className="text-xs text-amber-400 font-sans">AC</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-0.5">Backed Creative Projects</span>
              <span className="text-xl font-bold font-mono text-white">
                {wallet?.activeHoldingsCount || 0}
              </span>
            </div>
          </div>

          <Link
            href="/app/projects"
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore Creative Pitches</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Owned Project Shares Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>My Creative Project Shares</span>
          </h3>
          <span className="text-xs text-gray-400">
            {wallet?.portfolio.length || 0} Holdings
          </span>
        </div>

        {!wallet?.portfolio || wallet.portfolio.length === 0 ? (
          <div className="glass-panel border border-white/10 rounded-2xl p-10 text-center space-y-3">
            <Coins className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-400">
              You have not backed any creative pitches yet.
            </p>
            <Link
              href="/app/projects"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
            >
              <span>Browse Active Pitches</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/5 text-[11px] text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Credits Invested</th>
                  <th className="py-3 px-4">Shares Held</th>
                  <th className="py-3 px-4">Equity Pool %</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {wallet.portfolio.map((item) => (
                  <tr key={item.investmentId} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 flex items-center gap-3">
                      {item.coverMediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverMediaUrl}
                          alt={item.projectTitle}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-white block truncate max-w-xs">
                          {item.projectTitle}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {item.category?.name || 'Creative Pitch'} • by {item.creator?.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {item.status === 'ALLOTTED' || item.projectStatus === 'FUNDED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Allotted (100%)
                        </span>
                      ) : item.status === 'RELEASED' || item.projectStatus === 'CANCELLED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30 flex items-center gap-1 w-fit">
                          Released (Refunded)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> On Hold ({item.fundingProgressPercentage.toFixed(0)}% Open)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-200">
                      {item.creditsInvested.toLocaleString()} AC
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {item.sharesAcquired.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {item.sharePercentage.toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/app/projects?projectId=${item.projectId}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Immutable Transaction Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Audit Ledger & Credit History</span>
          </h3>
          <span className="text-xs text-gray-400">
            {wallet?.transactions.length || 0} Events
          </span>
        </div>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="glass-panel border border-white/10 rounded-2xl p-8 text-center text-xs text-gray-400">
            No transaction records recorded yet.
          </div>
        ) : (
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/5 text-[11px] text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {wallet.transactions.map((tx) => {
                  const isHold = tx.type === 'INVESTMENT_HOLD';
                  const isSettled = tx.type === 'INVESTMENT_SETTLED';
                  const isReleased = tx.type === 'INVESTMENT_RELEASED';
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4">{getTransactionTypeBadge(tx.type)}</td>
                      <td className="py-3 px-4 text-gray-300 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td
                        className={`py-3 px-4 font-mono font-bold text-right ${
                          isSettled
                            ? 'text-indigo-400'
                            : isReleased
                            ? 'text-cyan-400'
                            : isHold
                            ? 'text-amber-400'
                            : isPositive
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isSettled
                          ? 'Settled (Allotted)'
                          : isHold
                          ? `${tx.amount.toLocaleString()} AC (Held)`
                          : isPositive
                          ? `+${tx.amount.toLocaleString()} AC`
                          : `${tx.amount.toLocaleString()} AC`}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-300 text-right">
                        {tx.balanceAfter.toLocaleString()} AC
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
