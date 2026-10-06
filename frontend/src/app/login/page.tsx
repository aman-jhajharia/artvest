'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import { Sparkles, ArrowRight, User, Palette, Shield } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'USER' | 'CREATOR'>('CREATOR');

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        <PhaseBanner
          phase="Phase 1 Foundation"
          featureName="Authentication & Onboarding"
          description="Google OAuth authentication integration and role-specific creator onboarding will be fully integrated in the next implementation phase."
        />

        <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Join ArtVest</h1>
            <p className="text-xs text-gray-400 mt-1">
              Sign in with your Google account to discover talent or showcase your craft
            </p>
          </div>

          {/* Role Selection Preview */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Your Intended Profile Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('CREATOR')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'CREATOR'
                    ? 'border-amber-400/80 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Palette className={`w-4 h-4 ${selectedRole === 'CREATOR' ? 'text-amber-400' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${selectedRole === 'CREATOR' ? 'text-amber-300' : 'text-gray-200'}`}>
                    Creator
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Portfolio, skill categories, and collaborator discovery.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('USER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'USER'
                    ? 'border-indigo-400/80 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className={`w-4 h-4 ${selectedRole === 'USER' ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${selectedRole === 'USER' ? 'text-indigo-300' : 'text-gray-200'}`}>
                    Community
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Browse talent, follow creators, and save work.
                </p>
              </button>
            </div>
          </div>

          {/* Google OAuth Button Shell */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-gray-100 bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Direct Development App Link */}
            <Link
              href="/app"
              className="block w-full py-3 px-4 rounded-xl font-semibold text-xs text-center text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            >
              Skip to Platform Prototype Shell →
            </Link>
          </div>

          {/* Academic Architecture Notice */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Server-side role verification enforced via Prisma User/CreatorProfile schema.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
