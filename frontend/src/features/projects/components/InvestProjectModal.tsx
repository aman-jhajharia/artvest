'use client';

import React, { useState, useId } from 'react';
import { CreativeProjectItem } from '@/types';
import { ProjectApiService } from '../services/project.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { X, Sparkles, AlertCircle, CheckCircle2, Coins, ArrowRight, Loader2, ShieldCheck, Lock } from 'lucide-react';

interface InvestProjectModalProps {
  project: CreativeProjectItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRaised: number) => void;
}

export const InvestProjectModal: React.FC<InvestProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const inputId = useId();
  const [amount, setAmount] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const userBalance = user?.creditBalance ?? 0;
  const remainingGap = project.remainingGap;

  // Validation rules
  const isMultipleOf500 = amount > 0 && amount % 500 === 0;
  const isAtLeast500 = amount >= 500;
  const hasSufficientBalance = amount <= userBalance;
  const isWithinGap = amount <= remainingGap;
  const isCreatorSelfInvest = user?.id === project.creatorId;

  const isValid =
    isAtLeast500 &&
    isMultipleOf500 &&
    hasSufficientBalance &&
    isWithinGap &&
    !isCreatorSelfInvest;

  // Share calculation preview
  const estimatedShares =
    project.fundingGoal > 0
      ? Math.round((amount / project.fundingGoal) * project.totalShares)
      : 0;

  const estimatedSharePercentage =
    project.totalShares > 0
      ? Number(((estimatedShares / project.totalShares) * 100).toFixed(2))
      : 0;

  const projectedBalanceAfter = Math.max(0, userBalance - amount);

  const handleQuickAdd = (increment: number) => {
    setErrorMessage(null);
    const newAmount = Math.max(500, amount + increment);
    // Floor to remaining gap or user balance, preserving multiple of 500
    const maxAllowed = Math.min(remainingGap, userBalance);
    const boundedAmount = Math.min(newAmount, Math.floor(maxAllowed / 500) * 500 || 500);
    setAmount(boundedAmount);
  };

  const handleSetMax = () => {
    setErrorMessage(null);
    const maxPossible = Math.min(remainingGap, userBalance);
    const flooredTo500 = Math.floor(maxPossible / 500) * 500;
    setAmount(Math.max(500, flooredTo500));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isValid) {
      if (!isMultipleOf500) {
        setErrorMessage('Investments must be in strict multiples of 500 ArtCredits.');
      } else if (!isAtLeast500) {
        setErrorMessage('Minimum investment is 500 ArtCredits.');
      } else if (!hasSufficientBalance) {
        setErrorMessage('Insufficient demo ArtCredits in your wallet.');
      } else if (!isWithinGap) {
        setErrorMessage(`Investment cannot exceed remaining funding gap (${remainingGap.toLocaleString()} AC).`);
      } else if (isCreatorSelfInvest) {
        setErrorMessage('Creators cannot invest in their own creative pitches.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ProjectApiService.investInProject(project.id, amount);
      if (res.success && res.data) {
        setSuccessMessage(
          `Successfully backed with ${amount.toLocaleString()} AC! You acquired ${res.data.investment.sharesAcquired.toLocaleString()} shares (${res.data.investment.sharePercentage}% pool).`
        );
        await refreshUser();
        setTimeout(() => {
          onSuccess(res.data!.project.amountRaised);
          onClose();
        }, 1800);
      } else {
        setErrorMessage(
          res.error?.details
            ? String(res.error.details)
            : res.message || 'Investment failed'
        );
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12131C] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
              <Coins className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Back Project
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  Demo ArtCredits
                </span>
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-xs">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* IPO Escrow Hold Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>IPO-Style Escrow Hold</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Your pledged credits are placed on hold in escrow and will only be debited if this pitch reaches 100% of its funding goal. If cancelled or unfulfilled, held credits are immediately released back to your spendable balance with zero loss.
            </p>
          </div>

          {/* Funding Status Pill */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Remaining Gap</span>
              <span className="font-bold text-amber-400 text-sm">
                {remainingGap.toLocaleString()} AC
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Your Available Spendable Balance</span>
              <span className="font-bold text-white text-sm">
                {userBalance.toLocaleString()} AC
              </span>
              {user?.heldBalance && user.heldBalance > 0 ? (
                <span className="text-[10px] text-amber-400/80 font-mono block">
                  ({user.heldBalance.toLocaleString()} AC currently on hold)
                </span>
              ) : null}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={inputId} className="text-xs font-semibold text-gray-200">
                Investment Amount
              </label>
              <span className="text-[11px] font-medium text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Invest in multiples of 500 AC
              </span>
            </div>

            <div className="relative">
              <input
                id={inputId}
                type="number"
                step={500}
                min={500}
                max={Math.min(remainingGap, userBalance)}
                value={amount}
                onChange={(e) => {
                  setErrorMessage(null);
                  setAmount(Number(e.target.value) || 0);
                }}
                className={`w-full bg-black/40 border rounded-xl py-3 px-4 text-white text-lg font-bold font-mono focus:outline-none transition-all ${
                  !isMultipleOf500 && amount > 0
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-white/15 focus:border-amber-400'
                }`}
                placeholder="500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">
                AC
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="flex-1 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/5 transition-colors"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(1000)}
                className="flex-1 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/5 transition-colors"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(2500)}
                className="flex-1 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/5 transition-colors"
              >
                +2,500
              </button>
              <button
                type="button"
                onClick={handleSetMax}
                className="flex-1 py-1.5 text-xs font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30 transition-colors"
              >
                Max
              </button>
            </div>

            {/* Inline validation feedback */}
            {!isMultipleOf500 && amount > 0 && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Must be an exact multiple of 500 ArtCredits (e.g. 500, 1,000, 1,500).
              </p>
            )}
            {amount > userBalance && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Exceeds your demo ArtCredit balance ({userBalance.toLocaleString()} AC).
              </p>
            )}
            {amount > remainingGap && (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Exceeds remaining project funding gap ({remainingGap.toLocaleString()} AC).
              </p>
            )}
          </div>

          {/* Real-time Proportional Shares Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-black/60 border border-indigo-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Estimated Shares to Acquire
              </span>
              <span className="font-bold text-white font-mono text-sm">
                {estimatedShares.toLocaleString()} shares
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Equity / Royalty Share Pool</span>
              <span className="font-bold text-indigo-300 font-mono">
                {estimatedSharePercentage.toFixed(2)}%
              </span>
            </div>

            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">Amount Placed on Hold in Escrow</span>
              <span className="font-mono text-amber-300 font-bold">
                {amount > 0 ? amount.toLocaleString() : 0} AC
              </span>
            </div>

            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">Available Spendable Balance After Pledge</span>
              <span className="font-mono text-gray-300">
                {projectedBalanceAfter.toLocaleString()} AC
              </span>
            </div>
          </div>

          {/* Feedback banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                isValid && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20 hover:scale-[1.01]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Ledger...</span>
                </>
              ) : (
                <>
                  <span>Confirm Investment ({amount.toLocaleString()} AC)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
