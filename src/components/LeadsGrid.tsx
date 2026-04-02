import React, { useState } from 'react';
import { ExternalLink, MessageSquare, Filter } from 'lucide-react';
import type { WarmLead } from '../types';

const SOURCE_STYLES: Record<string, string> = {
  LinkedIn: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Reddit: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Blog: 'bg-green-500/20 text-green-300 border-green-500/30',
  Conference: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Job Posting': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
};

function getSourceStyle(source: string | undefined): string {
  const key = Object.keys(SOURCE_STYLES).find(k =>
    source?.toLowerCase().includes(k.toLowerCase())
  );
  return SOURCE_STYLES[key || ''] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
}

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreTextColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function LeadCard({ lead, index }: { lead: WarmLead; index: number }) {
  return (
    <div
      className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header: Name + Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">{lead.name}</h3>
          <p className="text-sm text-slate-400 truncate">{lead.title}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <div className={`text-lg font-bold font-mono ${scoreTextColor(lead.relevanceScore)}`}>
            {lead.relevanceScore}
          </div>
          <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreColor(lead.relevanceScore)}`}
              style={{ width: `${lead.relevanceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Source + Company badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSourceStyle(lead.source)}`}>
          {lead.source}
        </span>
        {lead.company && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
            {lead.company}
          </span>
        )}
      </div>

      {/* Pain points as tags */}
      {lead.detectedPainPoints && lead.detectedPainPoints.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {lead.detectedPainPoints.map((pp, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {pp}
            </span>
          ))}
        </div>
      )}

      {/* Content/context quote */}
      {lead.content && (
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3 mb-3 border-l-2 border-slate-300 dark:border-slate-600">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
            {lead.content}
          </p>
        </div>
      )}

      {/* Outreach angle */}
      {lead.outreachAngle && (
        <div className="bg-violet-500/10 rounded-lg p-3 mb-3 border border-violet-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3 h-3 text-violet-400" />
            <span className="text-xs font-medium text-violet-400">Outreach Angle</span>
          </div>
          <p className="text-xs text-violet-200 italic leading-relaxed">
            &ldquo;{lead.outreachAngle}&rdquo;
          </p>
        </div>
      )}

      {/* Source URL */}
      {lead.sourceUrl && (
        <a
          href={lead.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View source
        </a>
      )}
    </div>
  );
}

interface LeadsGridProps {
  leads: WarmLead[];
  companyName: string;
}

export default function LeadsGrid({ leads, companyName }: LeadsGridProps) {
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [painPointFilter, setPainPointFilter] = useState<string | null>(null);

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No leads found yet. Run a search to discover warm leads.</p>
      </div>
    );
  }

  const allSources = [...new Set(leads.map(l => l.source).filter(Boolean))];
  const allPainPoints = [...new Set(leads.flatMap(l => l.detectedPainPoints || []))];

  let filtered = leads;
  if (sourceFilter) {
    filtered = filtered.filter(l => l.source === sourceFilter);
  }
  if (painPointFilter) {
    filtered = filtered.filter(l =>
      l.detectedPainPoints?.includes(painPointFilter)
    );
  }

  const sorted = [...filtered].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return (
    <div>
      {/* Filter bar */}
      {(allSources.length > 1 || allPainPoints.length > 1) && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500">Source:</span>
            <button
              onClick={() => setSourceFilter(null)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                !sourceFilter ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {allSources.map(src => (
              <button
                key={src}
                onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  sourceFilter === src
                    ? 'bg-white text-slate-900 border-white'
                    : `${getSourceStyle(src)} hover:opacity-80`
                }`}
              >
                {src}
              </button>
            ))}
          </div>
          {allPainPoints.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 ml-5">Pain point:</span>
              <button
                onClick={() => setPainPointFilter(null)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  !painPointFilter ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {allPainPoints.slice(0, 6).map(pp => (
                <button
                  key={pp}
                  onClick={() => setPainPointFilter(painPointFilter === pp ? null : pp)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    painPointFilter === pp
                      ? 'bg-indigo-500 text-white'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25'
                  }`}
                >
                  {pp}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-500 mb-3">
        {sorted.length} lead{sorted.length !== 1 ? 's' : ''}{' '}
        {filtered.length !== leads.length && `(filtered from ${leads.length})`}
      </p>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((lead, idx) => (
          <LeadCard key={`${lead.name}-${idx}`} lead={lead} index={idx} />
        ))}
      </div>
    </div>
  );
}
