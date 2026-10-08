import React from 'react';
import Link from 'next/link';
import { Sparkles, Compass, Users } from 'lucide-react';

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
            <p className="text-xs text-gray-400">Discover creative talent, showcase your work, and connect.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <Link href="/app/explore" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Discover Talent
          </Link>
          <span className="hidden sm:inline text-white/20">•</span>
          <Link href="/app" className="hover:text-amber-400 transition-colors">
            Showcase Feed
          </Link>
          <span className="hidden sm:inline text-white/20">•</span>
          <Link href="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Join ArtVest
          </Link>
        </div>

        <p className="text-xs text-gray-500">
          © 2026 ArtVest. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
