'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Compass, User, LayoutDashboard, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-black font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
              ArtVest
            </span>
            <span className="text-[10px] tracking-wider text-gray-400 uppercase -mt-1 font-medium">
              Talent Ecosystem
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/app"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/app/explore"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            Discover Talent
          </Link>
          <Link
            href="/app/studio"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Creator Studio
          </Link>
          <Link
            href="/app/profile"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <User className="w-4 h-4 text-cyan-400" />
            Profile
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/app"
            className="px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all"
          >
            Enter Platform
          </Link>
        </div>
      </div>
    </header>
  );
};
