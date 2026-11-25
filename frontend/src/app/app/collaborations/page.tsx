'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CollaborationInquiriesList } from '@/features/interactions/components/CollaborationInquiriesList';
import { Handshake, Loader2 } from 'lucide-react';

function CollaborationsPageContent() {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('inquiryId');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Collaborations</h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-amber-400" />
            Active Pipelines & Chat
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Review collaboration requests, manage project inquiries, and chat in real time with accepted partners
        </p>
      </div>

      {/* Main Inquiries List with Chat Drawer */}
      <CollaborationInquiriesList initialInquiryId={inquiryId} />
    </div>
  );
}

export default function CollaborationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs font-mono text-gray-400">Loading collaborations...</p>
        </div>
      }
    >
      <CollaborationsPageContent />
    </Suspense>
  );
}
