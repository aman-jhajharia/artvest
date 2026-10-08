'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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
  const { isAuthenticated, isOnboarded, loginWithGoogle } = useAuth();
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

    if (!googleClientId || typeof window === 'undefined') {
      return;
    }

    const initGoogle = () => {
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

    if (window.google) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Sign In to ArtVest</h1>
              <p className="text-xs text-gray-400 mt-2">
                Discover creative talent, showcase your work, and connect.
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
            <div className="flex flex-col items-center justify-center my-6">
              <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px]" />

              {!googleClientId && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center w-full">
                  Google Client ID is not configured in environment.
                </div>
              )}

              {loading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Google identity...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-500 text-center mt-6">
              Secure single sign-on with your Google account.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
