import React from 'react';
import { Radar, Shield, Database, BarChart3, Cloud, ExternalLink, Loader2 } from 'lucide-react';

const toolIcons = {
  'Tableau': BarChart3,
  'Power BI': BarChart3,
  'Looker': BarChart3,
  'Qlik': BarChart3,
  'Databricks': Database,
  'Snowflake': Cloud,
  'Domo': BarChart3,
  'ThoughtSpot': BarChart3,
  'SAP Analytics Cloud': Cloud,
  'AWS QuickSight': Cloud,
};

const confidenceStyles = {
  High: 'bg-emerald-900/50 border-emerald-600/50 text-emerald-300',
  Medium: 'bg-amber-900/50 border-amber-600/50 text-amber-300',
  Low: 'bg-slate-700/50 border-slate-600/50 text-slate-300',
};

const badgeStyles = {
  High: 'bg-emerald-600 text-white',
  Medium: 'bg-amber-600 text-white',
  Low: 'bg-slate-600 text-slate-200',
};

export default function CompetitiveLandscape({ data, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl p-6 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Radar className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Competitive Landscape</h3>
            <p className="text-xs text-slate-400">Scanning for installed tools...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mr-3" />
          <span className="text-sm text-slate-400">Searching job postings, case studies, and press releases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Radar className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-semibold text-white">Competitive Landscape</h3>
        </div>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const tools = data.detectedTools || [];

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl p-6 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Radar className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Competitive Landscape</h3>
          <p className="text-xs text-slate-400">
            {tools.length > 0
              ? `${tools.length} tool${tools.length !== 1 ? 's' : ''} detected`
              : 'No competitive tools detected'}
          </p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="bg-slate-900/50 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No competitive BI/analytics tools detected</p>
          <p className="text-xs text-slate-500 mt-1">This could mean limited public signals or a greenfield opportunity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool, idx) => {
            const Icon = toolIcons[tool.toolName] || BarChart3;
            const confidence = tool.confidence || 'Low';
            return (
              <div
                key={idx}
                className={`rounded-lg border p-4 transition-all ${confidenceStyles[confidence]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-white/10 rounded-lg flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{tool.toolName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStyles[confidence]}`}>
                          {confidence}
                        </span>
                      </div>
                      <p className="text-xs mt-1 opacity-80 leading-relaxed">{tool.evidence}</p>
                    </div>
                  </div>
                  {tool.sourceUrl && (
                    <a
                      href={tool.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                      title="View source"
                    >
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.summary && (
        <p className="text-xs text-slate-400 mt-4 italic border-t border-slate-700/50 pt-3">
          {data.summary}
        </p>
      )}
    </div>
  );
}
