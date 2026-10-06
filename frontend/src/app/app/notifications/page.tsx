'use client';

import React from 'react';
import { PhaseBanner } from '@/components/ui/PhaseBanner';
import { Bell, Heart, MessageSquare, UserPlus, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const sampleNotifications = [
    {
      id: 'n-1',
      type: 'COLLAB',
      title: 'Collaboration Inquiry',
      message: 'Kabir Verma (Cinematographer) showed interest in collaborating with your vocal portfolio.',
      time: '2 hours ago',
      icon: Sparkles,
      color: 'text-amber-400',
    },
    {
      id: 'n-2',
      type: 'FOLLOW',
      title: 'New Follower',
      message: 'Meera Deshmukh (Choreographer) started following your creative updates.',
      time: '5 hours ago',
      icon: UserPlus,
      color: 'text-indigo-400',
    },
    {
      id: 'n-3',
      type: 'LIKE',
      title: 'Appreciation',
      message: 'Rohan Sen appreciated your showcase "Raag Yaman Acoustic Vocal Exploration".',
      time: '1 day ago',
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      id: 'n-4',
      type: 'COMMENT',
      title: 'New Comment',
      message: 'Vikram Joshi commented: "Incredible vocal control on the komal rishabh transitions!"',
      time: '2 days ago',
      icon: MessageSquare,
      color: 'text-cyan-400',
    },
  ];

  return (
    <div>
      <PhaseBanner
        phase="Phase 1 Foundation"
        featureName="Notifications System"
        description="This shell demonstrates user notifications (Likes, Comments, Follows, Collaboration requests). Real-time database notification triggers and unread badge badges will be plugged in Phase 6."
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-xs text-gray-400 mt-1">
            Stay updated with collaborators, feedback, and community engagement
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 divide-y divide-white/5 max-w-2xl border border-white/10">
        {sampleNotifications.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="py-3.5 px-3 flex items-start gap-3 hover:bg-white/[0.02] rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white">{n.title}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
