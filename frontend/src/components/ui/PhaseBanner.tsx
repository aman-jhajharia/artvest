import React from 'react';

interface PhaseBannerProps {
  phase: string;
  featureName: string;
  description: string;
}

export const PhaseBanner: React.FC<PhaseBannerProps> = ({ phase, featureName, description }) => {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          {phase}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-200">{featureName} Roadmap Status</h4>
          <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
