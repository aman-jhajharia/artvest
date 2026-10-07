'use client';

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  CreatorDiscoveryItem,
  ShowcaseDiscoveryItem,
  CategoryOption,
  SkillOption,
  ExploreQueryParams,
  PaginationMetadata,
} from '../types/explore.types';
import { ExploreApiService } from '../services/explore.service';
import { ExploreHeader } from './ExploreHeader';
import { ExploreFilterSidebar } from './ExploreFilterSidebar';
import { CreatorDiscoveryCard } from './CreatorDiscoveryCard';
import { ShowcaseDiscoveryCard } from './ShowcaseDiscoveryCard';
import { ExploreEmptyState } from './ExploreEmptyState';
import { ExploreGridSkeleton } from './ExploreSkeletons';
import { CollaborateModal } from '@/features/interactions/components/CollaborateModal';
import { CommentDrawer } from '@/features/interactions/components/CommentDrawer';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export const ExploreView: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Categories & Skills state
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);

  // Results state
  const [creators, setCreators] = useState<CreatorDiscoveryItem[]>([]);
  const [posts, setPosts] = useState<ShowcaseDiscoveryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile filters drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Phase 4 interaction modals state
  const [selectedCreatorForCollab, setSelectedCreatorForCollab] =
    useState<CreatorDiscoveryItem | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] =
    useState<ShowcaseDiscoveryItem | null>(null);

  // Parse filters from URL search params
  const currentFilters: ExploreQueryParams = {
    tab: (searchParams.get('tab') as 'creators' | 'posts') || 'creators',
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    skill: searchParams.get('skill') || '',
    location: searchParams.get('location') || '',
    experience: searchParams.get('experience') || '',
    availability: searchParams.get('availability') || '',
    proficiency: searchParams.get('proficiency') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  };

  // Calculate count of active filters (excluding tab, sort, page)
  const activeFilterCount = [
    currentFilters.category,
    currentFilters.skill,
    currentFilters.location,
    currentFilters.experience,
    currentFilters.availability,
    currentFilters.proficiency,
  ].filter(Boolean).length;

  // Sync state to URL search parameters
  const updateUrlFilters = useCallback(
    (updates: Partial<ExploreQueryParams>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  const resetAllFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    if (currentFilters.tab) newParams.set('tab', currentFilters.tab);
    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  }, [currentFilters.tab, pathname, router]);

  // Initial fetch of taxonomy categories and skills
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [catRes, skillRes] = await Promise.all([
          ExploreApiService.getCategories(),
          ExploreApiService.getSkills(),
        ]);
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (skillRes.success && skillRes.data) {
          setSkills(skillRes.data);
        }
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    }
    loadTaxonomy();
  }, []);

  // Fetch results whenever URL search parameters change
  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      try {
        if (currentFilters.tab === 'posts') {
          const res = await ExploreApiService.explorePosts(currentFilters);
          if (res.success && res.data) {
            setPosts(res.data);
            if (res.pagination) {
              setPagination(res.pagination);
            }
          } else {
            setError(res.message || 'Failed to load showcase posts');
          }
        } else {
          const res = await ExploreApiService.exploreCreators(currentFilters);
          if (res.success && res.data) {
            setCreators(res.data);
            if (res.pagination) {
              setPagination(res.pagination);
            }
          } else {
            setError(res.message || 'Failed to load creators');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const isPostsTab = currentFilters.tab === 'posts';
  const totalItems = pagination.total;

  return (
    <div className="space-y-6">
      {/* Header with Search, Category Pills & View Controls */}
      <ExploreHeader
        categories={categories}
        filters={currentFilters}
        activeFilterCount={activeFilterCount}
        onFilterChange={updateUrlFilters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        totalResults={totalItems}
      />

      {/* Main Layout: Persistent Sidebar on Desktop + Content Grid */}
      <div className="flex gap-8 items-start">
        {/* Filter Sidebar */}
        <ExploreFilterSidebar
          categories={categories}
          skills={skills}
          filters={currentFilters}
          onFilterChange={updateUrlFilters}
          onResetFilters={resetAllFilters}
          isOpenMobile={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Error State */}
          {error && (
            <div className="glass-card rounded-2xl p-6 border border-red-500/20 text-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">Failed to Load Discovery Data</h3>
              <p className="text-xs text-red-300 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => updateUrlFilters({ page: currentFilters.page })}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && <ExploreGridSkeleton isPosts={isPostsTab} />}

          {/* Empty State */}
          {!isLoading && !error && (isPostsTab ? posts.length === 0 : creators.length === 0) && (
            <ExploreEmptyState
              filters={currentFilters}
              onResetFilters={resetAllFilters}
            />
          )}

          {/* Results Grid */}
          {!isLoading && !error && (
            <>
              {isPostsTab ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {posts.map((post) => (
                    <ShowcaseDiscoveryCard
                      key={post.id}
                      post={post}
                      onOpenComments={(p) => setSelectedPostForComments(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {creators.map((creator) => (
                    <CreatorDiscoveryCard
                      key={creator.id}
                      creator={creator}
                      onCollaborate={(c) => setSelectedCreatorForCollab(c)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8 text-xs text-gray-400">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => updateUrlFilters({ page: pagination.page - 1 })}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!pagination.hasMore}
                      onClick={() => updateUrlFilters({ page: pagination.page + 1 })}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 flex items-center gap-1 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Structured Collaboration Modal (Phase 4 integration) */}
      {selectedCreatorForCollab && (
        <CollaborateModal
          recipientName={selectedCreatorForCollab.stageName || selectedCreatorForCollab.name}
          recipientId={selectedCreatorForCollab.userId || selectedCreatorForCollab.id}
          isOpen={Boolean(selectedCreatorForCollab)}
          onClose={() => setSelectedCreatorForCollab(null)}
          onSuccess={() => setSelectedCreatorForCollab(null)}
        />
      )}

      {/* Comments Drawer (Phase 4 integration) */}
      {selectedPostForComments && (
        <CommentDrawer
          postId={selectedPostForComments.id}
          isOpen={Boolean(selectedPostForComments)}
          onClose={() => setSelectedPostForComments(null)}
        />
      )}
    </div>
  );
};
