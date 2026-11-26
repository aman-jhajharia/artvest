'use client';

import React, { useState, useEffect } from 'react';
import { CreativeProjectItem } from '@/types';
import { ProjectApiService } from '../services/project.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { InvestProjectModal } from './InvestProjectModal';
import {
  X,
  Sparkles,
  Coins,
  Users,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface ProjectDetailsModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onInvested?: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onInvested,
}) => {
  const { user } = useAuth();
  const [project, setProject] = useState<CreativeProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    let isMounted = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const res = await ProjectApiService.getProjectById(projectId);
        if (res.success && res.data && isMounted) {
          setProject(res.data);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId]);

  const handleCancelPitch = async () => {
    if (!project) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await ProjectApiService.cancelProject(project.id);
      if (res.success && res.data) {
        setCancelSuccess(
          `Pitch cancelled. ${res.data.refundedBackersCount} backer hold(s) released (${res.data.totalCreditsRefunded.toLocaleString()} AC refunded).`
        );
        setProject(res.data.project);
        if (onInvested) onInvested();
      } else {
        setCancelError(res.message || 'Failed to cancel pitch');
      }
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setIsCancelling(false);
      setCancelConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#12131C] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 bg-[#12131C]/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {project?.category?.name || 'Creative Pitch'}
              </span>
              {project?.status === 'FUNDED' ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Funded (100%)
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Open for Backing
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-gray-400">Loading pitch & shareholder cap table...</p>
            </div>
          ) : project ? (
            <div className="p-6 space-y-6">
              {/* Media & Title Hero */}
              <div className="space-y-4">
                {project.coverMediaUrl && (
                  <div className="w-full h-56 rounded-xl overflow-hidden border border-white/10 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.coverMediaUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
                  {/* Creator Info */}
                  <div className="flex items-center gap-3">
                    {project.creator?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.creator.avatarUrl}
                        alt={project.creator.name}
                        className="w-9 h-9 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center font-bold text-xs text-black">
                        {project.creator?.name?.slice(0, 2).toUpperCase() || 'CR'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {project.creator?.creatorProfile?.stageName || project.creator?.name}
                        </span>
                        {project.creator?.creatorProfile?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {project.creator?.creatorProfile?.headline || 'Creative Producer'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding Progress Card */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Funding Raised</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {project.amountRaised.toLocaleString()} AC
                    </span>
                    <span className="text-gray-400 text-xs"> / {project.fundingGoal.toLocaleString()} AC</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[11px]">Progress</span>
                    <span className="text-lg font-black text-white font-mono">
                      {project.fundingProgressPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, project.fundingProgressPercentage)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Remaining Gap</span>
                    <span className="font-semibold text-gray-200">
                      {project.remainingGap.toLocaleString()} AC
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Share Price</span>
                    <span className="font-semibold text-gray-200">
                      1 Share = {project.sharePrice} AC
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Total Shares Pool</span>
                    <span className="font-semibold text-gray-200">
                      {project.totalShares.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Project Pitch & Creative Vision
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              {/* Caller's Current Holding (if any) */}
              {project.currentUserInvestment && (
                <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300">
                          Your Current Holding
                        </span>
                        {project.currentUserInvestment.status === 'ALLOTTED' || project.status === 'FUNDED' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Allotted
                          </span>
                        ) : project.currentUserInvestment.status === 'RELEASED' || project.status === 'CANCELLED' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">
                            Released
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Held in Escrow
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {project.currentUserInvestment.creditsInvested.toLocaleString()} AC pledged
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      {project.currentUserInvestment.sharesAcquired.toLocaleString()} shares
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      {project.currentUserInvestment.sharePercentage}% pool
                    </span>
                  </div>
                </div>
              )}

              {/* Shareholder Cap Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {project.status === 'FUNDED'
                      ? `Finalized Allotment (${project.capTable?.length || 0} Backers)`
                      : project.status === 'CANCELLED'
                      ? `Released Pledges (${project.capTable?.length || 0} Backers)`
                      : `Tentative Share Allocations (${project.capTable?.length || 0} Backers)`}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {project.status === 'OPEN' ? 'Pledges Held in Escrow' : 'Proportional Equity Pool'}
                  </span>
                </div>

                {project.capTable && project.capTable.length > 0 ? (
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.04] border-b border-white/5 text-[11px] text-gray-400 uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Investor</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Credits</th>
                          <th className="py-2.5 px-3">Shares</th>
                          <th className="py-2.5 px-3 text-right">Pool %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {project.capTable.map((holder, idx) => (
                          <tr key={holder.investorId} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 flex items-center gap-2">
                              <span className="text-gray-400 font-mono text-[10px] w-4">
                                #{idx + 1}
                              </span>
                              {holder.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={holder.avatarUrl}
                                  alt={holder.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/10 text-[9px] flex items-center justify-center font-bold">
                                  {holder.name.slice(0, 1)}
                                </div>
                              )}
                              <span className="font-medium text-white truncate max-w-[120px]">
                                {holder.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {holder.status === 'ALLOTTED' || project.status === 'FUNDED' ? (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Allotted
                                </span>
                              ) : holder.status === 'RELEASED' || project.status === 'CANCELLED' ? (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">
                                  Released
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                                  <Lock className="w-2.5 h-2.5" /> Held
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-300">
                              {holder.creditsInvested.toLocaleString()} AC
                            </td>
                            <td className="py-2.5 px-3 font-mono text-white">
                              {holder.sharesAcquired.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-400 text-right">
                              {holder.sharePercentage.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs">
                    Be the first to back this creative pitch and take a founding equity share!
                  </div>
                )}
              </div>

              {/* Feedback banners */}
              {cancelError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{cancelError}</span>
                </div>
              )}
              {cancelSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{cancelSuccess}</span>
                </div>
              )}

              {/* Action Trigger & Creator Cancellation */}
              <div className="space-y-3 pt-2">
                {project.status === 'OPEN' ? (
                  <>
                    <button
                      onClick={() => setIsInvestModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
                    >
                      <Coins className="w-4 h-4 font-bold" />
                      <span>Back This Pitch (In Multiples of 500 AC)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Creator cancel pitch controls */}
                    {user?.id === project.creatorId && (
                      <div className="pt-2 border-t border-white/5">
                        {!cancelConfirm ? (
                          <button
                            type="button"
                            onClick={() => setCancelConfirm(true)}
                            disabled={isCancelling}
                            className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Cancel Pitch & Release All Held Pledges</span>
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs">
                            <p className="text-red-200 font-medium">
                              Are you sure you want to cancel this pitch? All backer pledges currently held in escrow will be immediately returned to their available balances with zero fee.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleCancelPitch}
                                disabled={isCancelling}
                                className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                              >
                                {isCancelling ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Releasing Holds...</span>
                                  </>
                                ) : (
                                  <span>Yes, Cancel & Refund Backers</span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancelConfirm(false)}
                                disabled={isCancelling}
                                className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 text-xs transition-colors"
                              >
                                Keep Pitch Active
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : project.status === 'FUNDED' ? (
                  <div className="p-3 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    This project has successfully closed funding at 100%! All shares allotted.
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl bg-gray-500/10 border border-gray-500/20 text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    This pitch was cancelled. All escrow funds have been released back to backers.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {project && (
        <InvestProjectModal
          project={project}
          isOpen={isInvestModalOpen}
          onClose={() => setIsInvestModalOpen(false)}
          onSuccess={(newRaised) => {
            setProject((prev) =>
              prev
                ? {
                    ...prev,
                    amountRaised: newRaised,
                    fundingProgressPercentage: Number(
                      ((newRaised / prev.fundingGoal) * 100).toFixed(2)
                    ),
                    remainingGap: Math.max(0, prev.fundingGoal - newRaised),
                    status: newRaised >= prev.fundingGoal ? 'FUNDED' : prev.status,
                  }
                : null
            );
            if (onInvested) onInvested();
          }}
        />
      )}
    </>
  );
};
