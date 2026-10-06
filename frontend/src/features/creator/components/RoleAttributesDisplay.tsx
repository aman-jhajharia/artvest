'use client';

import React from 'react';
import { Tag, Globe, Sliders, Radio, Camera, Film, Palette, Sparkles } from 'lucide-react';

interface RoleAttributesDisplayProps {
  categorySlug?: string;
  roleAttributes?: Record<string, unknown> | null;
}

export function RoleAttributesDisplay({ categorySlug, roleAttributes }: RoleAttributesDisplayProps) {
  if (!roleAttributes || Object.keys(roleAttributes).length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-sm text-gray-500">
        No craft metadata specified yet. Complete your discipline details to enhance collaboration matching.
      </div>
    );
  }

  const renderBadgeGroup = (title: string, items: unknown, icon: React.ReactNode) => {
    if (!items) return null;
    const arrayItems = Array.isArray(items) ? items : [items];
    if (arrayItems.length === 0) return null;

    return (
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2.5">
          {icon}
          <span className="uppercase tracking-wider font-semibold">{title}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {arrayItems.map((item, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200 font-medium"
            >
              {String(item)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Music Attributes */}
      {Boolean(roleAttributes.genres) ? renderBadgeGroup('Musical Genres', roleAttributes.genres, <Tag className="w-3.5 h-3.5 text-amber-400" />) : null}
      {Boolean(roleAttributes.languages) ? renderBadgeGroup('Vocal Languages', roleAttributes.languages, <Globe className="w-3.5 h-3.5 text-blue-400" />) : null}
      {Boolean(roleAttributes.vocalType) ? renderBadgeGroup('Vocal Register', roleAttributes.vocalType, <Radio className="w-3.5 h-3.5 text-pink-400" />) : null}
      {Boolean(roleAttributes.instruments) ? renderBadgeGroup('Instruments', roleAttributes.instruments, <Sparkles className="w-3.5 h-3.5 text-yellow-400" />) : null}
      {Boolean(roleAttributes.daws) ? renderBadgeGroup('Production DAWs', roleAttributes.daws, <Sliders className="w-3.5 h-3.5 text-emerald-400" />) : null}
      {Boolean(roleAttributes.productionSpecialties) ? renderBadgeGroup('Production Specialties', roleAttributes.productionSpecialties, <Sliders className="w-3.5 h-3.5 text-cyan-400" />) : null}

      {/* Photography & Film Attributes */}
      {Boolean(roleAttributes.photographyTypes || roleAttributes.photographyStyles) ?
        renderBadgeGroup('Photography Styles', roleAttributes.photographyTypes || roleAttributes.photographyStyles, <Camera className="w-3.5 h-3.5 text-purple-400" />) : null}
      {Boolean(roleAttributes.videoStyles) ? renderBadgeGroup('Video Styles', roleAttributes.videoStyles, <Film className="w-3.5 h-3.5 text-red-400" />) : null}
      {Boolean(roleAttributes.equipment || roleAttributes.cameraEquipment) ?
        renderBadgeGroup('Camera & Gear', roleAttributes.equipment || roleAttributes.cameraEquipment, <Camera className="w-3.5 h-3.5 text-orange-400" />) : null}
      {Boolean(roleAttributes.editingTools) ? renderBadgeGroup('Editing Software', roleAttributes.editingTools, <Sliders className="w-3.5 h-3.5 text-indigo-400" />) : null}
      {Boolean(roleAttributes.actingStyles) ? renderBadgeGroup('Acting Methods', roleAttributes.actingStyles, <Film className="w-3.5 h-3.5 text-rose-400" />) : null}
      {Boolean(roleAttributes.projectTypes) ? renderBadgeGroup('Directing Projects', roleAttributes.projectTypes, <Film className="w-3.5 h-3.5 text-emerald-400" />) : null}

      {/* Design & Animation */}
      {Boolean(roleAttributes.designSpecialties) ? renderBadgeGroup('Design Specialties', roleAttributes.designSpecialties, <Palette className="w-3.5 h-3.5 text-fuchsia-400" />) : null}
      {Boolean(roleAttributes.tools) ? renderBadgeGroup('Design Tools', roleAttributes.tools, <Sliders className="w-3.5 h-3.5 text-violet-400" />) : null}
      {Boolean(roleAttributes.animationTypes) ? renderBadgeGroup('Animation Types', roleAttributes.animationTypes, <Sparkles className="w-3.5 h-3.5 text-teal-400" />) : null}
      {Boolean(roleAttributes.software) ? renderBadgeGroup('3D / VFX Software', roleAttributes.software, <Sliders className="w-3.5 h-3.5 text-sky-400" />) : null}
      {Boolean(roleAttributes.danceForms) ? renderBadgeGroup('Dance Forms', roleAttributes.danceForms, <Sparkles className="w-3.5 h-3.5 text-pink-400" />) : null}

      {/* Other generic metadata */}
      {Object.entries(roleAttributes)
        .filter(
          ([key]) =>
            ![
              'genres',
              'languages',
              'vocalType',
              'instruments',
              'daws',
              'productionSpecialties',
              'photographyTypes',
              'photographyStyles',
              'videoStyles',
              'equipment',
              'cameraEquipment',
              'editingTools',
              'actingStyles',
              'projectTypes',
              'designSpecialties',
              'tools',
              'animationTypes',
              'software',
              'danceForms',
            ].includes(key)
        )
        .map(([key, value]) =>
          renderBadgeGroup(
            key.replace(/([A-Z])/g, ' $1').trim(),
            value,
            <Tag className="w-3.5 h-3.5 text-gray-400" />
          )
        )}
    </div>
  );
}
