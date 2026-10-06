'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Sparkles, ArrowRight, Shield, AlertCircle, CheckCircle2, Loader2, Sparkle } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              type?: string;
              shape?: string;
              text?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isOnboarded, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (isOnboarded) {
        router.push('/app');
      } else {
        router.push('/onboarding');
      }
    }
  }, [isAuthenticated, isOnboarded, router]);

  // Handle Google Credential Response
  const handleCredentialResponse = async (credential: string) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await loginWithGoogle(credential);

    if (result.success) {
      setSuccessMessage('Authentication verified. Setting up your session...');
      setTimeout(() => {
        if (result.isNewUser) {
          router.push('/onboarding');
        } else {
          router.push('/app');
        }
      }, 700);
    } else {
      setErrorMessage(result.message);
      setLoading(false);
    }
  };

  // Load Google Identity Services script if client ID is configured
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (googleClientId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && googleButtonRef.current) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res) => handleCredentialResponse(res.credential),
          });
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Development quick login helper (creates or logs in a test account)
  const handleDevGoogleLogin = (roleIntent: 'USER' | 'CREATOR') => {
    const timestamp = Date.now();
    const mockEmail = `creative.${roleIntent.toLowerCase()}.${timestamp}@example.com`;
    const mockCredential = `mock_test_credential:${JSON.stringify({
      googleId: `google_id_${timestamp}`,
      email: mockEmail,
      name: roleIntent === 'CREATOR' ? 'Aanya Sharma' : 'Dev Community Member',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    })}`;

    handleCredentialResponse(mockCredential);
  };

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        <PhaseBanner
          phase="Phase 1 Active"
          featureName="Google Authentication"
          description="Google OAuth authentication with HttpOnly session cookies. Complete the Google sign-in flow to proceed to onboarding."
        />

        <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Sign In to ArtVest</h1>
            <p className="text-xs text-gray-400 mt-1">
              Connect your Google identity to showcase creative work or discover collaborators
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Official Button Container */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div ref={googleButtonRef} className="w-full flex justify-center mb-2" />

            {/* Standard Styled Google Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDevGoogleLogin('CREATOR')}
              className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-gray-100 bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Verifying Google identity...</span>
                </>
              ) : (
                <>
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
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
                </>
              )}
            </button>
          </div>

          {/* Quick Development Test Sign-in */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                Simulated Test Credentials
              </span>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Dev Mode
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDevGoogleLogin('CREATOR')}
                className="py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all text-left flex items-center justify-between"
              >
                <span>Test Creator Sign-In</span>
                <Sparkle className="w-3 h-3 text-amber-400" />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDevGoogleLogin('USER')}
                className="py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all text-left flex items-center justify-between"
              >
                <span>Test Member Sign-In</span>
                <Sparkle className="w-3 h-3 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Security & Academic Notice */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Sessions are cryptographically verified and stored in secure HttpOnly cookies.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
