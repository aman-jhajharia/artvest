import React from 'react';
import Link from 'next/link';
import { Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#07080d] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">ArtVest</p>
            <p className="text-xs text-gray-400">Discover Talent. Build Teams. Back Ideas.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-gray-300">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            B.Tech CSE Major Project (PR1107)
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Structured Creative Talent Ecosystem
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <Link href="/login" className="hover:text-amber-400 transition-colors">
            Authentication
          </Link>
          <Link href="/app/explore" className="hover:text-amber-400 transition-colors">
            Talent Discovery
          </Link>
        </div>

        <p className="text-xs text-gray-500">
          © 2026 ArtVest Project Team. Academic Prototype.
        </p>
      </div>
    </footer>
  );
};
