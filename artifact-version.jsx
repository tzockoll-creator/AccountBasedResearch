import React, { useState } from 'react';
import { Search, Building2, TrendingUp, TrendingDown, Shield, Zap, DollarSign, Users, FileText, Newspaper, Loader2, ChevronDown, ChevronUp, Target, AlertTriangle, Lightbulb, Shuffle, User, Radar, Briefcase } from 'lucide-react';

// ============================================
// COMPETITIVE DETECTION (inlined)
// ============================================

const TOOLS = {
  'Tableau': { category: 'BI Platform', vendor: 'Salesforce' },
  'Power BI': { category: 'BI Platform', vendor: 'Microsoft' },
  'Looker': { category: 'BI Platform', vendor: 'Google' },
  'Qlik': { category: 'BI Platform', vendor: 'Qlik' },
  'QlikView': { category: 'BI Platform', vendor: 'Qlik' },
  'Qlik Sense': { category: 'BI Platform', vendor: 'Qlik' },
  'MicroStrategy': { category: 'BI Platform', vendor: 'Strategy' },
  'Domo': { category: 'BI Platform', vendor: 'Domo' },
  'Sisense': { category: 'BI Platform', vendor: 'Sisense' },
  'ThoughtSpot': { category: 'BI Platform', vendor: 'ThoughtSpot' },
  'Mode': { category: 'BI Platform', vendor: 'ThoughtSpot' },
  'Metabase': { category: 'BI Platform', vendor: 'Open Source' },
  'Superset': { category: 'BI Platform', vendor: 'Apache' },
  'Sigma': { category: 'BI Platform', vendor: 'Sigma Computing' },
  'Snowflake': { category: 'Data Platform', vendor: 'Snowflake' },
  'Databricks': { category: 'Data Platform', vendor: 'Databricks' },
  'BigQuery': { category: 'Data Platform', vendor: 'Google' },
  'Redshift': { category: 'Data Platform', vendor: 'AWS' },
  'Synapse': { category: 'Data Platform', vendor: 'Microsoft' },
  'Azure Synapse': { category: 'Data Platform', vendor: 'Microsoft' },
  'Teradata': { category: 'Data Platform', vendor: 'Teradata' },
  'Vertica': { category: 'Data Platform', vendor: 'OpenText' },
  'Informatica': { category: 'Data Integration', vendor: 'Informatica' },
  'Talend': { category: 'Data Integration', vendor: 'Qlik' },
  'Fivetran': { category: 'Data Integration', vendor: 'Fivetran' },
  'dbt': { category: 'Data Integration', vendor: 'dbt Labs' },
  'Airbyte': { category: 'Data Integration', vendor: 'Open Source' },
  'Matillion': { category: 'Data Integration', vendor: 'Matillion' },
  'Alation': { category: 'Data Governance', vendor: 'Alation' },
  'Collibra': { category: 'Data Governance', vendor: 'Collibra' },
  'Atlan': { category: 'Data Governance', vendor: 'Atlan' },
};

const enrichToolData = (toolMentions) => {
  const totalMentions = Object.values(toolMentions).reduce((a, b) => a + b, 0);
  return Object.entries(toolMentions)
    .map(([toolName, count]) => {
      const toolInfo = TOOLS[toolName] || { category: 'Unknown', vendor: 'Unknown' };
      let confidence = 'Low';
      if (count >= 3 || (totalMentions > 0 && count / totalMentions >= 0.3)) {
        confidence = 'High';
      } else if (count >= 2 || (totalMentions > 0 && count / totalMentions >= 0.15)) {
        confidence = 'Medium';
      }
      return { name: toolName, mentions: count, confidence, category: toolInfo.category, vendor: toolInfo.vendor };
    })
    .sort((a, b) => b.mentions - a.mentions);
};

const getStrategicImplications = (enrichedTools) => {
  const implications = [];
  const hasTableau = enrichedTools.some(t => t.name === 'Tableau');
  const hasPowerBI = enrichedTools.some(t => t.name === 'Power BI');
  const hasLooker = enrichedTools.some(t => t.name === 'Looker');
  const hasSnowflake = enrichedTools.some(t => t.name === 'Snowflake');
  const hasDatabricks = enrichedTools.some(t => t.name === 'Databricks');
  const hasBIPlatform = enrichedTools.some(t => t.category === 'BI Platform');
  const hasDataPlatform = enrichedTools.some(t => t.category === 'Data Platform');

  if (hasTableau || hasPowerBI || hasLooker) {
    implications.push({
      theme: 'portability-flexibility',
      insight: `Currently using ${[hasTableau && 'Tableau', hasPowerBI && 'Power BI', hasLooker && 'Looker'].filter(Boolean).join('/')} - potential vendor lock-in. Strategy's open architecture could provide flexibility.`
    });
  }
  if (hasSnowflake || hasDatabricks) {
    implications.push({
      theme: 'semantic-layer',
      insight: `Invested in ${[hasSnowflake && 'Snowflake', hasDatabricks && 'Databricks'].filter(Boolean).join('/')} - likely need a semantic layer to govern metrics across their data platform.`
    });
  }
  if (enrichedTools.filter(t => t.category === 'BI Platform').length > 1) {
    implications.push({
      theme: 'tco-consolidation',
      insight: 'Multiple BI tools detected - consolidation opportunity to reduce licensing costs and training overhead.'
    });
  }
  if (hasBIPlatform && hasDataPlatform) {
    implications.push({
      theme: 'governed-ai',
      insight: 'Modern data stack in place - ready for AI/ML layer. Strategy can provide governed AI on top of their existing investments.'
    });
  }
  return implications;
};

const detectCompetitiveTools = async (companyName) => {
  const prompt = `Search for recent job postings from "${companyName}" that mention analytics, business intelligence, data engineering, or data analyst roles.

Look for job listings on LinkedIn, Indeed, Glassdoor, or the company's careers page.

For each relevant job posting you find, extract:
1. The job title
2. Any BI/analytics tools mentioned (Tableau, Power BI, Looker, Snowflake, Databricks, etc.)
3. The source where you found it

CRITICAL: Return ONLY valid JSON, no other text.

JSON format:
{
  "companyName": "${companyName}",
  "jobPostings": [
    {
      "title": "Senior Data Analyst",
      "tools": ["Tableau", "Snowflake", "dbt"],
      "source": "LinkedIn"
    }
  ],
  "toolMentions": {
    "Tableau": 3,
    "Snowflake": 2,
    "Power BI": 1
  },
  "summary": "Brief summary of the technology stack based on job postings"
}

If you cannot find job postings, return:
{
  "companyName": "${companyName}",
  "jobPostings": [],
  "toolMentions": {},
  "summary": "No recent job postings found for analytics/BI roles"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }]
      })
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    let textContent = data.content.filter(item => item.type === "text").map(item => item.text).join("");
    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return { ...parsed, enrichedTools: enrichToolData(parsed.toolMentions || {}), scanDate: new Date().toISOString() };
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Competitive scan timed out');
    throw err;
  }
};

// ============================================
// PERSONAS & THEMES CONFIG
// ============================================

const PERSONAS = [
  { id: 'cio', name: 'CIO / CTO', title: 'Chief Information Officer', icon: '🖥️', priorities: ['portability-flexibility', 'tco-consolidation', 'trust-scale', 'governed-ai'], cares: 'Technology strategy, architecture, vendor management, IT efficiency, innovation enablement', avoids: 'Vendor lock-in, technical debt, shadow IT, security risks' },
  { id: 'cfo', name: 'CFO / Finance', title: 'Chief Financial Officer', icon: '💰', priorities: ['controlled-costs', 'tco-consolidation', 'trust-scale', 'semantic-layer'], cares: 'Predictable spend, ROI, audit compliance, accurate financial reporting, cost control', avoids: 'Runaway cloud costs, inconsistent metrics, compliance gaps' },
  { id: 'cdo', name: 'CDO / Data Leader', title: 'Chief Data Officer', icon: '📊', priorities: ['semantic-layer', 'governed-ai', 'trust-scale', 'self-service'], cares: 'Data governance, single source of truth, data quality, democratization with guardrails', avoids: 'Data silos, ungoverned AI, metric chaos, shadow analytics' },
  { id: 'coo', name: 'COO / Operations', title: 'Chief Operating Officer', icon: '⚙️', priorities: ['time-to-insight', 'self-service', 'semantic-layer', 'controlled-costs'], cares: 'Operational efficiency, real-time visibility, faster decisions, process optimization', avoids: 'Slow reporting cycles, inconsistent data, bottlenecks' },
  { id: 'business', name: 'Business User / Analyst', title: 'Line of Business', icon: '👤', priorities: ['self-service', 'time-to-insight', 'governed-ai', 'portability-flexibility'], cares: 'Easy access to data, quick answers, flexibility in tools, trusted insights', avoids: 'IT backlogs, waiting for reports, unreliable data' }
];

const GTM_THEMES = [
  { id: 'governed-ai', name: 'Governed AI', icon: Shield, color: 'rose', description: 'AI answers grounded in trusted, governed data vs. hallucination risk', signals: ['AI initiatives', 'data quality concerns', 'analytics modernization', 'digital transformation', 'machine learning', 'generative AI', 'LLM', 'chatbot', 'automation'] },
  { id: 'semantic-layer', name: 'Single Source of Truth', icon: Target, color: 'blue', description: 'One consistent definition of metrics across the organization', signals: ['data silos', 'inconsistent reporting', 'multiple BI tools', 'data governance', 'metric definitions', 'data dictionary', 'master data', 'conflicting reports'] },
  { id: 'trust-scale', name: 'Trust at Scale', icon: Building2, color: 'emerald', description: 'Enterprise-grade security, governance, and auditability', signals: ['compliance', 'regulatory', 'audit', 'security', 'SOX', 'GDPR', 'HIPAA', 'data privacy', 'risk management', 'internal controls'] },
  { id: 'self-service', name: 'Self-Service Without Chaos', icon: Users, color: 'violet', description: 'Empower business users without creating shadow analytics', signals: ['business intelligence', 'self-service', 'democratize data', 'citizen analyst', 'data literacy', 'report backlog', 'IT bottleneck', 'ad-hoc reporting'] },
  { id: 'time-to-insight', name: 'Time-to-Insight', icon: Zap, color: 'amber', description: 'Faster decisions through natural language + governed data', signals: ['real-time', 'faster decisions', 'agility', 'speed', 'competitive advantage', 'market dynamics', 'rapid change', 'time-sensitive'] },
  { id: 'tco-consolidation', name: 'TCO / Consolidation', icon: DollarSign, color: 'teal', description: 'Replace fragmented BI stack with unified platform', signals: ['cost reduction', 'consolidation', 'efficiency', 'streamline', 'reduce complexity', 'vendor sprawl', 'technical debt', 'legacy systems', 'modernization'] },
  { id: 'controlled-costs', name: 'Controlled Costs', icon: TrendingDown, color: 'orange', description: 'Predictable, manageable analytics spend without runaway consumption costs', signals: ['budget constraints', 'cost overruns', 'cloud costs', 'consumption pricing', 'unpredictable spend', 'CFO', 'cost controls', 'budget optimization', 'expense management', 'margin pressure', 'profitability'] },
  { id: 'portability-flexibility', name: 'Portability & Flexibility', icon: Shuffle, color: 'cyan', description: 'Freedom to choose any front-end, avoid vendor lock-in, and adapt as technology evolves', signals: ['vendor lock-in', 'proprietary', 'migration', 'flexibility', 'open standards', 'interoperability', 'multi-cloud', 'portability', 'switching costs', 'future-proof', 'optionality', 'best-of-breed'] }
];

// ============================================
// THEME CARD COMPONENT
// ============================================

const ThemeCard = ({ theme, findings, isExpanded, onToggle }) => {
  const IconComponent = theme.icon;
  const colorClasses = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700'
  };
  const headerColors = {
    rose: 'bg-rose-600', blue: 'bg-blue-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600',
    amber: 'bg-amber-600', teal: 'bg-teal-600', orange: 'bg-orange-600', cyan: 'bg-cyan-600'
  };
  const relevanceScore = findings?.relevanceScore || 0;
  const hasFindings = findings && findings.evidence && findings.evidence.length > 0;

  return (
    <div className={`rounded-lg border-2 overflow-hidden transition-all ${hasFindings ? colorClasses[theme.color] : 'bg-gray-50 border-gray-200 opacity-60'}`}>
      <button onClick={onToggle} className={`w-full p-4 flex items-center justify-between ${headerColors[theme.color]} text-white`}>
        <div className="flex items-center gap-3">
          <IconComponent className="w-5 h-5" />
          <span className="font-semibold">{theme.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {hasFindings && <span className="bg-white/20 px-2 py-1 rounded text-sm">{relevanceScore}% relevant</span>}
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 space-y-4">
          <p className="text-sm opacity-80">{theme.description}</p>
          {hasFindings ? (
            <>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Evidence Found</h4>
                <ul className="space-y-2">
                  {findings.evidence.map((item, idx) => (
                    <li key={idx} className="text-sm bg-white/50 p-2 rounded"><span className="font-medium">{item.source}:</span> {item.text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Talking Points</h4>
                <ul className="space-y-1">
                  {findings.talkingPoints.map((point, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2"><span className="text-current mt-1">•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
              {findings.questions && findings.questions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Discovery Questions</h4>
                  <ul className="space-y-1">
                    {findings.questions.map((q, idx) => (<li key={idx} className="text-sm italic">"{q}"</li>))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No strong signals found for this theme</p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const AccountResearchApp = () => {
  const [companyInput, setCompanyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [research, setResearch] = useState(null);
  const [expandedThemes, setExpandedThemes] = useState({});
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showAllThemes, setShowAllThemes] = useState(true);
  const [fastMode, setFastMode] = useState(false);
  const [competitiveData, setCompetitiveData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleCompetitiveScan = async () => {
    if (!research?.companyName) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const data = await detectCompetitiveTools(research.companyName);
      data.implications = getStrategicImplications(data.enrichedTools || []);
      setCompetitiveData(data);
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleTheme = (themeId) => setExpandedThemes(prev => ({ ...prev, [themeId]: !prev[themeId] }));

  const expandRelevantThemes = (themeFindings) => {
    const expanded = {};
    Object.entries(themeFindings).forEach(([themeId, findings]) => {
      if (findings && findings.relevanceScore >= 50) expanded[themeId] = true;
    });
    setExpandedThemes(expanded);
  };

  const runResearch = async () => {
    if (!companyInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setResearch(null);
    setCompetitiveData(null);
    setScanError(null);
    setLoadingStatus('Analyzing company data...');

    try {
      const prompt = `You are an expert B2B sales researcher for Strategy (formerly MicroStrategy), an enterprise analytics and BI platform company.

Analyze the company "${companyInput}" and provide account research mapped to our GTM themes.

For each of these 8 GTM themes, find relevant signals from what you know about this company (from 10-Ks, news, earnings calls, press releases, industry context):

1. **Governed AI** - AI initiatives, data quality concerns, analytics modernization, GenAI adoption
2. **Single Source of Truth** - Data silos, inconsistent reporting, multiple BI tools, metric governance
3. **Trust at Scale** - Compliance, regulatory requirements, audit needs, security concerns
4. **Self-Service Without Chaos** - BI democratization, report backlogs, shadow analytics risk
5. **Time-to-Insight** - Speed of decisions, real-time needs, competitive agility
6. **TCO / Consolidation** - Cost pressures, vendor sprawl, legacy system modernization
7. **Controlled Costs** - Budget constraints, unpredictable cloud/consumption spend, margin pressure, CFO cost discipline initiatives
8. **Portability & Flexibility** - Vendor lock-in concerns, multi-cloud strategy, need for best-of-breed front-ends, avoiding proprietary traps, future-proofing technology investments

CRITICAL INSTRUCTIONS:
- Your response must be ONLY valid JSON - no text before or after
- Do NOT include any explanation, preamble, or commentary
- Do NOT use markdown code blocks
- Start your response with { and end with }

JSON format:
{
  "companyName": "Full company name",
  "ticker": "Stock ticker if public, null if private",
  "industry": "Primary industry",
  "summary": "2-3 sentence executive summary of why this account is interesting for Strategy",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "themeFindings": {
    "governed-ai": {
      "relevanceScore": 85,
      "evidence": [{"source": "10-K", "text": "specific finding"}],
      "talkingPoints": ["point1", "point2"],
      "questions": ["discovery question 1"]
    },
    "semantic-layer": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "trust-scale": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "self-service": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "time-to-insight": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "tco-consolidation": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "controlled-costs": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []},
    "portability-flexibility": {"relevanceScore": 0, "evidence": [], "talkingPoints": [], "questions": []}
  },
  "competitiveContext": "Known BI/analytics vendors they use or are evaluating",
  "recentNews": ["Recent relevant news item 1", "Recent relevant news item 2"]
}

If a theme has no relevant findings, set relevanceScore to 0 and leave arrays empty.
Be specific and cite actual business context where possible.

Remember: Output ONLY the JSON object, nothing else.`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), fastMode ? 60000 : 120000);

      const requestBody = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      };

      if (!fastMode) {
        requestBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API error ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'API returned an error');

      let textContent = data.content.filter(item => item.type === "text").map(item => item.text).join("");
      textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      setResearch(parsed);
      expandRelevantThemes(parsed.themeFindings);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Try Fast Mode or try again.');
      } else {
        setError(`Failed to analyze company: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Account Research Engine</h1>
          <p className="text-slate-400">AI-powered account intelligence mapped to Strategy GTM themes</p>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runResearch()}
              placeholder="Enter company name or ticker (e.g., Dell, Vizient, HEB, E2Open)"
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            onClick={runResearch}
            disabled={isLoading || !companyInput.trim()}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-semibold hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Researching...</>) : (<><TrendingUp className="w-5 h-5" />Analyze</>)}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setFastMode(!fastMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fastMode ? 'bg-amber-500' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fastMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-slate-400">
            {fastMode ? <span className="text-amber-400">⚡ Fast Mode ON - Uses training data (10-15s)</span> : <span>Fast Mode OFF - Uses live web search (30-90s)</span>}
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filter by Buyer Persona</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedPersona(null); setShowAllThemes(true); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPersona === null ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'}`}
            >All Themes</button>
            {PERSONAS.map(persona => (
              <button
                key={persona.id}
                onClick={() => { setSelectedPersona(persona); setShowAllThemes(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedPersona?.id === persona.id ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'}`}
              ><span>{persona.icon}</span>{persona.name}</button>
            ))}
          </div>

          {selectedPersona && (
            <div className="mt-4 bg-slate-800/70 rounded-xl p-4 border border-slate-700">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{selectedPersona.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedPersona.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{selectedPersona.title}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-emerald-400 font-medium">Cares about:</span><p className="text-slate-300 mt-1">{selectedPersona.cares}</p></div>
                    <div><span className="text-rose-400 font-medium">Wants to avoid:</span><p className="text-slate-300 mt-1">{selectedPersona.avoids}</p></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-slate-400 text-xs uppercase tracking-wide">Priority Themes:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPersona.priorities.map((themeId, idx) => {
                        const theme = GTM_THEMES.find(t => t.id === themeId);
                        return (<span key={themeId} className="text-xs bg-slate-700 px-2 py-1 rounded flex items-center gap-1"><span className="text-slate-500">{idx + 1}.</span> {theme?.name}</span>);
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && loadingStatus && (
          <div className="text-center text-slate-400 mb-8"><Loader2 className="w-6 h-6 animate-spin inline mr-2" />{loadingStatus}</div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-8"><p className="text-red-300">{error}</p></div>
        )}

        {research && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{research.companyName}</h2>
                  <div className="flex items-center gap-3 text-slate-400 mt-1">
                    {research.ticker && <span className="bg-slate-700 px-2 py-1 rounded text-sm">{research.ticker}</span>}
                    <span>{research.industry}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 mb-4">{research.summary}</p>
              {research.keyInsights && research.keyInsights.length > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-slate-400 mb-2">KEY INSIGHTS</h3>
                  <ul className="space-y-1">
                    {research.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm"><span className="text-red-400 mt-1">→</span><span>{insight}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {research.competitiveContext && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="font-semibold text-sm text-slate-400 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" />COMPETITIVE LANDSCAPE</h3>
                <p className="text-sm">{research.competitiveContext}</p>
              </div>
            )}

            {/* Tech Stack Detection */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-slate-400 flex items-center gap-2"><Radar className="w-4 h-4" />TECH STACK DETECTION</h3>
                <button
                  onClick={handleCompetitiveScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                >
                  {isScanning ? (<><Loader2 className="w-3 h-3 animate-spin" />Scanning jobs...</>) : (<><Briefcase className="w-3 h-3" />Scan Job Postings</>)}
                </button>
              </div>
              {scanError && <p className="text-red-400 text-sm mb-3">{scanError}</p>}
              {!competitiveData && !isScanning && !scanError && (
                <p className="text-slate-500 text-sm italic">Scan job postings to detect BI/analytics tools in use at {research.companyName}</p>
              )}
              {competitiveData && (
                <div className="space-y-4">
                  {competitiveData.enrichedTools && competitiveData.enrichedTools.length > 0 ? (
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">Detected Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {competitiveData.enrichedTools.map((tool, idx) => (
                          <div key={idx} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${tool.confidence === 'High' ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300' : tool.confidence === 'Medium' ? 'bg-amber-900/50 border border-amber-700 text-amber-300' : 'bg-slate-700 border border-slate-600 text-slate-300'}`}>
                            <span className="font-medium">{tool.name}</span>
                            <span className="text-xs opacity-70">({tool.category})</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${tool.confidence === 'High' ? 'bg-emerald-700' : tool.confidence === 'Medium' ? 'bg-amber-700' : 'bg-slate-600'}`}>{tool.confidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (<p className="text-slate-500 text-sm">No specific tools detected from job postings</p>)}
                  {competitiveData.jobPostings && competitiveData.jobPostings.length > 0 && (
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">Sample Job Postings</h4>
                      <div className="space-y-2">
                        {competitiveData.jobPostings.slice(0, 3).map((job, idx) => (
                          <div key={idx} className="bg-slate-900/50 rounded p-2 text-sm">
                            <span className="font-medium text-slate-200">{job.title}</span>
                            {job.tools && job.tools.length > 0 && <span className="text-slate-400 ml-2">— {job.tools.join(', ')}</span>}
                            <span className="text-slate-500 text-xs ml-2">({job.source})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {competitiveData.implications && competitiveData.implications.length > 0 && (
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">Strategic Implications</h4>
                      <div className="space-y-2">
                        {competitiveData.implications.map((imp, idx) => {
                          const theme = GTM_THEMES.find(t => t.id === imp.theme);
                          return (
                            <div key={idx} className="bg-slate-900/50 rounded p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                {theme && <theme.icon className="w-4 h-4 text-red-400" />}
                                <span className="font-medium text-slate-300">{theme?.name}</span>
                              </div>
                              <p className="text-slate-400">{imp.insight}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {competitiveData.summary && <p className="text-sm text-slate-400 italic border-t border-slate-700 pt-3">{competitiveData.summary}</p>}
                </div>
              )}
            </div>

            {research.recentNews && research.recentNews.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="font-semibold text-sm text-slate-400 mb-2 flex items-center gap-2"><Newspaper className="w-4 h-4" />RECENT NEWS</h3>
                <ul className="space-y-1">
                  {research.recentNews.map((news, idx) => (<li key={idx} className="text-sm flex items-start gap-2"><span className="text-orange-400">•</span><span>{news}</span></li>))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />GTM Theme Mapping
                {selectedPersona && <span className="text-sm font-normal text-slate-400 ml-2">— Filtered for {selectedPersona.name}</span>}
              </h3>

              {selectedPersona && research.themeFindings && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><span>{selectedPersona.icon}</span>{selectedPersona.name} Executive Summary</h4>
                  <p className="text-sm text-slate-300">
                    {(() => {
                      const topThemes = selectedPersona.priorities.map(id => ({ id, findings: research.themeFindings[id] })).filter(t => t.findings?.relevanceScore >= 50).slice(0, 2);
                      if (topThemes.length === 0) return `Limited direct signals for ${selectedPersona.name} priorities. Consider discovery questions to uncover latent needs.`;
                      const themeNames = topThemes.map(t => GTM_THEMES.find(g => g.id === t.id)?.name).join(' and ');
                      return `Strong alignment on ${themeNames}. Lead with these themes when engaging this persona.`;
                    })()}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {(showAllThemes ? GTM_THEMES : GTM_THEMES.filter(t => selectedPersona?.priorities.includes(t.id)))
                  .sort((a, b) => {
                    if (!selectedPersona) return 0;
                    const aIdx = selectedPersona.priorities.indexOf(a.id);
                    const bIdx = selectedPersona.priorities.indexOf(b.id);
                    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
                  })
                  .map((theme) => (
                  <div key={theme.id} className="relative">
                    {selectedPersona && selectedPersona.priorities.includes(theme.id) && (
                      <div className="absolute -top-2 -left-2 z-10 bg-white text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {selectedPersona.priorities.indexOf(theme.id) + 1}
                      </div>
                    )}
                    <ThemeCard theme={theme} findings={research.themeFindings?.[theme.id]} isExpanded={expandedThemes[theme.id]} onToggle={() => toggleTheme(theme.id)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!research && !isLoading && !error && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Research</h3>
            <p className="text-slate-500 max-w-md mx-auto">Enter a company name or ticker symbol to generate an account brief with GTM theme mapping</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Dell', 'Vizient', 'HEB', 'E2Open', 'BMC Software'].map(company => (
                <button key={company} onClick={() => setCompanyInput(company)} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all">{company}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountResearchApp;
