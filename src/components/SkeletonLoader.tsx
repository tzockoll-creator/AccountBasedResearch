import React from 'react';

/**
 * Skeleton loading screen that matches the results layout.
 * Shows placeholder cards during API calls.
 */
export function LeadsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-3"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {/* Name + score */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-3 w-48" />
            </div>
            <div className="flex items-center gap-2 ml-3">
              <div className="skeleton h-6 w-10" />
              <div className="skeleton h-2 w-12 rounded-full" />
            </div>
          </div>

          {/* Source badges */}
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>

          {/* Pain point tags */}
          <div className="flex gap-1.5">
            <div className="skeleton h-5 w-28 rounded" />
            <div className="skeleton h-5 w-24 rounded" />
          </div>

          {/* Content quote */}
          <div className="bg-slate-900/40 rounded-lg p-3 border-l-2 border-slate-700 space-y-1.5">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-3/4" />
          </div>

          {/* Outreach angle */}
          <div className="bg-slate-800/40 rounded-lg p-3 space-y-1.5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function IntelSkeleton() {
  return (
    <div className="space-y-5">
      {/* Company header */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-6 w-48" />
            <div className="flex gap-3">
              <div className="skeleton h-5 w-14 rounded" />
              <div className="skeleton h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      </div>

      {/* Key insights */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="skeleton h-4 w-28 mb-3" />
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex gap-2">
              <div className="skeleton h-3 w-3 mt-1 shrink-0" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="skeleton h-4 w-36 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="skeleton h-7 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Capability bars */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="skeleton h-4 w-40 mb-3" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
              <div className="skeleton h-4 w-48 flex-1" />
              <div className="skeleton h-4 w-10" />
              <div className="skeleton h-1.5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
