import React from 'react';
import { Building2, Newspaper, Cpu, TrendingUp, Target, FileText } from 'lucide-react';

export default function CompanyIntel({ research }) {
  if (!research) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Run a company search to see intel here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Company Header */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{research.companyName}</h2>
            <div className="flex items-center gap-3 text-slate-400 mt-1 flex-wrap">
              {research.ticker && (
                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                  {research.ticker}
                </span>
              )}
              {research.industry && <span className="text-sm">{research.industry}</span>}
              {research.employeeCount && (
                <span className="text-sm text-slate-500">~{research.employeeCount} employees</span>
              )}
            </div>
          </div>
        </div>
        {research.summary && (
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">{research.summary}</p>
        )}
      </div>

      {/* Key Insights */}
      {research.keyInsights && research.keyInsights.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            KEY INSIGHTS
          </h3>
          <ul className="space-y-2">
            {research.keyInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5 shrink-0">&#8594;</span>
                <span className="text-slate-300">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack */}
      {research.techStack && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            TECH STACK SIGNALS
          </h3>
          {research.techStack.confirmed && research.techStack.confirmed.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Confirmed</p>
              <div className="flex flex-wrap gap-1.5">
                {research.techStack.confirmed.map((tool, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {research.techStack.likely && research.techStack.likely.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Likely</p>
              <div className="flex flex-wrap gap-1.5">
                {research.techStack.likely.map((tool, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {research.techStack.notes && (
            <p className="text-xs text-slate-400 mt-2 italic">{research.techStack.notes}</p>
          )}
        </div>
      )}

      {/* Capability Mapping */}
      {research.capabilityMapping && research.capabilityMapping.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            CAPABILITY RELEVANCE
          </h3>
          <div className="space-y-3">
            {research.capabilityMapping
              .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
              .map((cap, idx) => (
                <CapabilityCard key={idx} capability={cap} />
              ))}
          </div>
        </div>
      )}

      {/* Data Initiatives */}
      {research.dataInitiatives && research.dataInitiatives.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            DATA & TECH INITIATIVES
          </h3>
          <ul className="space-y-1.5">
            {research.dataInitiatives.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-orange-400 mt-0.5 shrink-0">&#8226;</span>
                <span className="text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitive Context */}
      {research.competitiveContext && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            COMPETITIVE LANDSCAPE
          </h3>
          <p className="text-sm text-slate-300">{research.competitiveContext}</p>
        </div>
      )}

      {/* Recent News */}
      {research.recentNews && research.recentNews.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            RECENT NEWS
          </h3>
          <ul className="space-y-1.5">
            {research.recentNews.map((news, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-orange-400 mt-0.5 shrink-0">&#8226;</span>
                <span className="text-slate-300">{news}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CapabilityCard({ capability }) {
  const [expanded, setExpanded] = useState(false);
  const score = capability.relevanceScore || 0;
  const hasContent = (capability.evidence?.length > 0) || (capability.talkingPoints?.length > 0);

  const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-slate-600';
  const textColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-slate-500';

  return (
    <div
      className={`rounded-lg border transition-colors ${
        score >= 50 ? 'border-slate-600 bg-slate-900/40' : 'border-slate-700/50 bg-slate-900/20 opacity-70'
      }`}
    >
      <button
        onClick={() => hasContent && setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-slate-200 truncate flex-1">
          {capability.capability}
        </span>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className={`text-sm font-mono font-semibold ${textColor}`}>{score}%</span>
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </button>

      {expanded && hasContent && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50 pt-2">
          {capability.evidence?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Evidence</p>
              {capability.evidence.map((e, i) => (
                <p key={i} className="text-xs text-slate-400 mb-1">
                  <span className="text-slate-500">{e.source}:</span> {e.text}
                </p>
              ))}
            </div>
          )}
          {capability.talkingPoints?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Talking Points</p>
              {capability.talkingPoints.map((tp, i) => (
                <p key={i} className="text-xs text-slate-400">&#8226; {tp}</p>
              ))}
            </div>
          )}
          {capability.questions?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Discovery Questions</p>
              {capability.questions.map((q, i) => (
                <p key={i} className="text-xs text-slate-400 italic">"{q}"</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
