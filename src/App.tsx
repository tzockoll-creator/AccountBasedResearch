import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Users, Building2, Info, X, Menu, Search as SearchIcon, TrendingUp
} from 'lucide-react';
import ThemeProvider from './components/ThemeProvider';
import DarkModeToggle from './components/DarkModeToggle';
import Sidebar from './components/Sidebar';
import ProductConfig from './components/ProductConfig';
import CompanySearch from './components/CompanySearch';
import StatusBar from './components/StatusBar';
import LeadsGrid from './components/LeadsGrid';
import CompanyIntel from './components/CompanyIntel';
import CompetitiveLandscape from './components/CompetitiveLandscape';
import EmailDraftGenerator from './components/EmailDraftGenerator';
import ExportButton from './components/ExportButton';
import ErrorBoundary from './components/ErrorBoundary';
import PersonaSelector from './components/PersonaSelector';
import { LeadsSkeleton, IntelSkeleton } from './components/SkeletonLoader';
import { useToast } from './components/Toast';
import { researchCompany, findWarmLeads } from './services/claudeApi';
import { searchSECFilings, buildSECContext } from './services/secEdgar';
import { detectCompetitiveTools, getStrategicImplications } from './utils/competitiveDetection';
import { useResearchHistory } from './hooks/useResearchHistory';
import { useDebounce } from './hooks/useDebounce';
import { useResearchCache } from './hooks/useResearchCache';
import { STRATEGY_PRESET } from './config/defaultProduct';
import { STORAGE_KEYS } from './config/appConfig';
import { validateCompanyName } from './utils/validation';
import type {
  ProductConfig as ProductConfigType,
  WarmLeadsResult,
  CompanyResearchResult,
  WarmLead,
  HistoryEntry,
  Persona,
} from './types';

const TABS = [
  { id: 'leads' as const, label: 'Warm Leads', icon: Users },
  { id: 'intel' as const, label: 'Company Intel', icon: Building2 },
];

function loadSavedProductConfig(): ProductConfigType {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.productConfig);
    return stored ? JSON.parse(stored) : STRATEGY_PRESET;
  } catch {
    return STRATEGY_PRESET;
  }
}

function AppContent() {
  const toast = useToast();

  // Product config
  const [productConfig, setProductConfig] = useState<ProductConfigType>(loadSavedProductConfig);

  // Search state
  const [companyInput, setCompanyInput] = useState('');
  const debouncedCompany = useDebounce(companyInput, 300);
  const [activeTab, setActiveTab] = useState<'leads' | 'intel'>('leads');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'leads' | 'intel' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Results
  const [leadsResult, setLeadsResult] = useState<WarmLeadsResult | null>(null);
  const [intelResult, setIntelResult] = useState<CompanyResearchResult | null>(null);
  const [searchedCompany, setSearchedCompany] = useState<string | null>(null);
  const [searchDuration, setSearchDuration] = useState<number | null>(null);

  // SEC EDGAR
  const [secData, setSecData] = useState<any>(null);

  // Competitive landscape
  const [competitiveData, setCompetitiveData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // History & sidebar
  const { history, addEntry, clearHistory } = useResearchHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // How it works tooltip
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Persona
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Abort controller ref
  const abortRef = useRef<AbortController | null>(null);

  // Research cache
  const cache = useResearchCache();

  // Validate debounced input in real-time
  useEffect(() => {
    if (debouncedCompany.trim()) {
      const err = validateCompanyName(debouncedCompany);
      setValidationError(err);
    } else {
      setValidationError(null);
    }
  }, [debouncedCompany]);

  const handleCompetitiveScan = useCallback(async () => {
    if (!searchedCompany) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const data = await detectCompetitiveTools(searchedCompany);
      const implications = getStrategicImplications(data.enrichedTools || []);
      setCompetitiveData({ ...data, implications });
      toast('Competitive scan complete', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      console.error('Competitive scan failed:', err);
      setScanError(message);
      toast('Competitive scan failed', 'error');
    } finally {
      setIsScanning(false);
    }
  }, [searchedCompany, toast]);

  const handleSearch = useCallback(async () => {
    const company = companyInput.trim();

    const valError = validateCompanyName(companyInput);
    if (valError) {
      setValidationError(valError);
      return;
    }
    setValidationError(null);

    if (isSearching) return;
    if (!productConfig.productName || productConfig.capabilities.length === 0) {
      setError('Please configure your product first (expand the Product Configuration panel above).');
      return;
    }

    // Check cache
    const cached = cache.get(company);
    if (cached) {
      setLeadsResult(cached.leads);
      setIntelResult(cached.intel);
      setSearchedCompany(company);
      setSecData(cached.sec || null);
      setCompetitiveData(null);
      setScanError(null);
      toast('Loaded from cache', 'info');
      return;
    }

    setError(null);
    setIsSearching(true);
    setLeadsResult(null);
    setIntelResult(null);
    setSecData(null);
    setCompetitiveData(null);
    setScanError(null);
    setSearchDuration(null);
    setSearchedCompany(company);

    const controller = new AbortController();
    abortRef.current = controller;
    const startTime = Date.now();

    try {
      // Run leads search
      setSearchMode('leads');
      const leadsData = await findWarmLeads(company, productConfig, { signal: controller.signal })
        .catch((err: Error) => ({
          _error: err.message,
          leads: [],
          companyContext: {
            companyName: company,
            industry: '',
            relevantInitiatives: [],
            overallSignalStrength: 'low',
          },
          searchSummary: { sourcesSearched: [], totalSignalsFound: 0, strongestSource: '' },
        } as WarmLeadsResult));
      setLeadsResult(leadsData);

      // Run intel search + SEC EDGAR in parallel
      setSearchMode('intel');
      const [intelData, secResult] = await Promise.all([
        researchCompany(company, productConfig, { signal: controller.signal })
          .catch((err: Error) => ({ _error: err.message } as CompanyResearchResult)),
        searchSECFilings(company, { signal: controller.signal })
          .catch(() => null),
      ]);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setSearchDuration(elapsed);

      if (secResult?.found) {
        setSecData(secResult);
      }

      if (leadsData._error) console.error('Lead search error:', leadsData._error);
      setLeadsResult(leadsData);

      if (intelData._error) {
        console.error('Intel search error:', intelData._error);
        if (leadsData._error) {
          setError(`Both searches failed. Leads: ${leadsData._error}. Intel: ${intelData._error}`);
          toast('Research failed', 'error');
        }
      } else {
        toast(`Research complete for ${company}`, 'success');
      }
      setIntelResult(intelData._error ? null : intelData);

      // Cache results
      cache.set(company, {
        leads: leadsData,
        intel: intelData._error ? null : intelData,
        sec: secResult?.found ? secResult : null,
      });

      const leads = leadsData?.leads || [];
      const topLead = leads[0];
      addEntry({
        companyName: company,
        leadCount: leads.length,
        topLeadName: topLead?.name || null,
        topLeadTitle: topLead?.title || null,
        productName: productConfig.productName,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(`Search failed: ${err.message}`);
        toast('Search failed', 'error');
      }
    } finally {
      setIsSearching(false);
      setSearchMode(null);
      abortRef.current = null;
    }
  }, [companyInput, productConfig, isSearching, addEntry, cache, toast]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleHistoryClick = useCallback((entry: HistoryEntry) => {
    setCompanyInput(entry.companyName);
  }, []);

  const leads: WarmLead[] = leadsResult?.leads || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Sidebar for research history */}
      <Sidebar
        history={history}
        onHistoryClick={handleHistoryClick}
        onClearHistory={clearHistory}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
          {/* Top bar: hamburger + brand + dark mode */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  WarmLead AI
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm hidden sm:block">
                  Find people publicly signaling the pain points your product solves
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
                title="How it works"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* How it works panel */}
          {showHowItWorks && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">How WarmLead AI Works</span>
                <button onClick={() => setShowHowItWorks(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p>WarmLead AI uses Claude with web search to find real people at your target company who are publicly signaling the pain points your product solves.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Sources searched:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>LinkedIn public posts and profiles</li>
                      <li>Reddit (r/dataengineering, r/analytics)</li>
                      <li>Company engineering/tech blogs</li>
                      <li>Conference speaker listings</li>
                      <li>Job postings (organizational priorities)</li>
                      <li>SEC EDGAR filings (10-K, 10-Q)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Company Intel provides:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Tech stack detection</li>
                      <li>Capability relevance mapping</li>
                      <li>Competitive landscape scan</li>
                      <li>SEC filing analysis</li>
                      <li>Email draft generator</li>
                      <li>Recent news and data initiatives</li>
                    </ul>
                  </div>
                </div>
                <p className="text-slate-400 dark:text-slate-500 mt-2 italic">Searches typically run 30-90 seconds with web search enabled.</p>
              </div>
            </div>
          )}

          {/* Product Config */}
          <ProductConfig productConfig={productConfig} onConfigChange={setProductConfig} />

          {/* Search */}
          <CompanySearch
            companyInput={companyInput}
            onCompanyInputChange={(val) => { setCompanyInput(val); setValidationError(null); }}
            onSearch={handleSearch}
            onAbort={handleAbort}
            isLoading={isSearching}
            disabled={isSearching}
            validationError={validationError}
          />

          {/* Quick company buttons (when no search yet) */}
          {!searchedCompany && !isSearching && (
            <div className="flex items-center gap-1.5 mb-4 -mt-3">
              <span className="text-xs text-slate-500">Try:</span>
              {['Dell', 'Vizient', 'HEB', 'E2Open'].map(name => (
                <button
                  key={name}
                  onClick={() => setCompanyInput(name)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Persona Selector */}
          <PersonaSelector selected={selectedPersona} onSelect={setSelectedPersona} />

          {/* Status bar */}
          <StatusBar isActive={isSearching} mode={searchMode} />

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/50 rounded-xl p-4 mb-6 animate-fade-in">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Skeleton loading during search */}
          {isSearching && !leadsResult && activeTab === 'leads' && <LeadsSkeleton />}
          {isSearching && searchMode === 'intel' && activeTab === 'intel' && <IntelSkeleton />}

          {/* Results area */}
          <ErrorBoundary>
            {searchedCompany && !isSearching && (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between mb-4 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold">{searchedCompany}</h2>
                    {searchDuration !== null && (
                      <p className="text-xs text-slate-500">
                        {leads.length} lead{leads.length !== 1 ? 's' : ''} found in {searchDuration}s
                      </p>
                    )}
                  </div>
                  <ExportButton leads={leads} companyName={searchedCompany} />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-5 border-b border-slate-200 dark:border-slate-700 pb-px">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-indigo-500 -mb-px'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id === 'leads' && leads.length > 0 && (
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full ml-1">
                            {leads.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                {activeTab === 'leads' && (
                  <LeadsGrid leads={leads} companyName={searchedCompany} />
                )}
                {activeTab === 'intel' && (
                  <div className="space-y-6">
                    <CompanyIntel research={intelResult} />

                    {/* SEC EDGAR Filing Sources */}
                    {secData?.found && secData.filings.length > 0 && (
                      <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 animate-fade-in">
                        <h3 className="font-semibold text-sm text-slate-400 mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          SEC FILING SOURCES
                        </h3>
                        <div className="space-y-2">
                          {secData.filings.map((filingData: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  {filingData.filing.formType}
                                </span>
                                <span className="text-xs text-slate-500">{filingData.filing.filingDate}</span>
                              </div>
                              {filingData.sections.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {filingData.sections.map((sec: any, sIdx: number) => (
                                    <span key={sIdx} className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                      {sec.title}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {filingData.filing.filingUrl && (
                                <a
                                  href={filingData.filing.filingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
                                >
                                  View on SEC.gov &rarr;
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competitive Landscape */}
                    {intelResult && (
                      <CompetitiveLandscape
                        data={competitiveData}
                        isLoading={isScanning}
                        error={scanError}
                      />
                    )}

                    {/* Scan button if no competitive data yet */}
                    {intelResult && !competitiveData && !isScanning && !scanError && (
                      <div className="text-center">
                        <button
                          onClick={handleCompetitiveScan}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          Scan Job Postings for Tech Stack
                        </button>
                      </div>
                    )}

                    {/* Email Draft Generator */}
                    {intelResult && (
                      <EmailDraftGenerator
                        research={{
                          companyName: intelResult.companyName,
                          industry: intelResult.industry,
                          summary: intelResult.summary,
                          keyInsights: intelResult.keyInsights,
                          competitiveContext: intelResult.competitiveContext,
                          themeFindings: {},
                        }}
                        persona={selectedPersona}
                        competitiveIntel={competitiveData}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </ErrorBoundary>

          {/* Professional empty state */}
          {!searchedCompany && !isSearching && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 flex items-center justify-center">
                <SearchIcon className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Enter a company name to begin research
              </h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
                WarmLead AI will search the web for people at your target company who are publicly
                signaling the pain points{' '}
                <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                  {productConfig.productName || 'your product'}
                </span>{' '}
                solves — with personalized outreach angles for each lead.
              </p>
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Warm leads with outreach angles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Company intel & tech stack</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Relevance scoring</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
