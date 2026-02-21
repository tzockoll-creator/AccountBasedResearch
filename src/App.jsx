import React, { useState, useRef, useCallback } from 'react';
import { Users, Building2, Clock, Trash2, Info, X } from 'lucide-react';
import ProductConfig from './components/ProductConfig';
import CompanySearch from './components/CompanySearch';
import StatusBar from './components/StatusBar';
import LeadsGrid from './components/LeadsGrid';
import CompanyIntel from './components/CompanyIntel';
import ExportButton from './components/ExportButton';
import { researchCompany, findWarmLeads } from './services/claudeApi';
import { useResearchHistory } from './hooks/useResearchHistory';
import { STRATEGY_PRESET } from './config/defaultProduct';

const TABS = [
  { id: 'leads', label: 'Warm Leads', icon: Users },
  { id: 'intel', label: 'Company Intel', icon: Building2 }
];

function loadSavedProductConfig() {
  try {
    const stored = localStorage.getItem('warmlead-ai-product-config');
    return stored ? JSON.parse(stored) : STRATEGY_PRESET;
  } catch {
    return STRATEGY_PRESET;
  }
}

export default function App() {
  // Product config
  const [productConfig, setProductConfig] = useState(loadSavedProductConfig);

  // Search state
  const [companyInput, setCompanyInput] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(null); // 'leads' | 'intel'
  const [error, setError] = useState(null);

  // Results
  const [leadsResult, setLeadsResult] = useState(null);
  const [intelResult, setIntelResult] = useState(null);
  const [searchedCompany, setSearchedCompany] = useState(null);
  const [searchDuration, setSearchDuration] = useState(null);

  // History
  const { history, addEntry, clearHistory } = useResearchHistory();
  const [showHistory, setShowHistory] = useState(false);

  // How it works tooltip
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Abort controller ref
  const abortRef = useRef(null);

  const handleSearch = useCallback(async () => {
    const company = companyInput.trim();
    if (!company || isSearching) return;
    if (!productConfig.productName || productConfig.capabilities.length === 0) {
      setError('Please configure your product first (expand the Product Configuration panel above).');
      return;
    }

    setError(null);
    setIsSearching(true);
    setLeadsResult(null);
    setIntelResult(null);
    setSearchDuration(null);
    setSearchedCompany(company);

    const controller = new AbortController();
    abortRef.current = controller;
    const startTime = Date.now();

    try {
      // Run both searches in parallel
      setSearchMode('leads');
      const [leadsData, intelData] = await Promise.all([
        findWarmLeads(company, productConfig, { signal: controller.signal })
          .catch(err => ({ _error: err.message, leads: [] })),
        researchCompany(company, productConfig, { signal: controller.signal })
          .catch(err => ({ _error: err.message }))
      ]);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setSearchDuration(elapsed);

      // Handle leads result
      if (leadsData._error) {
        console.error('Lead search error:', leadsData._error);
      }
      setLeadsResult(leadsData);

      // Handle intel result
      if (intelData._error) {
        console.error('Intel search error:', intelData._error);
        if (leadsData._error) {
          setError(`Both searches failed. Leads: ${leadsData._error}. Intel: ${intelData._error}`);
        }
      }
      setIntelResult(intelData._error ? null : intelData);

      // Add to history
      const leads = leadsData?.leads || [];
      const topLead = leads[0];
      addEntry({
        companyName: company,
        leadCount: leads.length,
        topLeadName: topLead?.name || null,
        topLeadTitle: topLead?.title || null,
        productName: productConfig.productName
      });

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(`Search failed: ${err.message}`);
      }
    } finally {
      setIsSearching(false);
      setSearchMode(null);
      abortRef.current = null;
    }
  }, [companyInput, productConfig, isSearching, addEntry]);

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const handleHistoryClick = useCallback((entry) => {
    setCompanyInput(entry.companyName);
    setShowHistory(false);
  }, []);

  const leads = leadsResult?.leads || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            WarmLead AI
          </h1>
          <p className="text-slate-400 text-sm">
            Find people publicly signaling the pain points your product solves
          </p>
        </div>

        {/* Product Config */}
        <ProductConfig
          productConfig={productConfig}
          onConfigChange={setProductConfig}
        />

        {/* Search + History row */}
        <div className="relative">
          <CompanySearch
            companyInput={companyInput}
            onCompanyInputChange={setCompanyInput}
            onSearch={handleSearch}
            onAbort={handleAbort}
            isLoading={isSearching}
            disabled={isSearching}
          />

          {/* History + How it works buttons */}
          <div className="flex items-center gap-3 mb-4 -mt-2">
            <button
              onClick={() => { setShowHistory(!showHistory); setShowHowItWorks(false); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Clock className="w-3 h-3" />
              Recent ({history.length})
            </button>
            <button
              onClick={() => { setShowHowItWorks(!showHowItWorks); setShowHistory(false); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Info className="w-3 h-3" />
              How it works
            </button>

            {/* Quick company buttons */}
            {!searchedCompany && (
              <div className="flex items-center gap-1.5 ml-auto">
                {['Dell', 'Vizient', 'HEB', 'E2Open'].map(name => (
                  <button
                    key={name}
                    onClick={() => setCompanyInput(name)}
                    className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* History dropdown */}
          {showHistory && (
            <div className="absolute z-20 top-16 left-0 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
                <span className="text-xs text-slate-400 font-medium">Recent Searches</span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="px-3 py-4 text-xs text-slate-500 text-center">No recent searches</p>
              ) : (
                <ul>
                  {history.map((entry, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleHistoryClick(entry)}
                        className="w-full px-3 py-2.5 text-left hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{entry.companyName}</span>
                          <span className="text-xs text-slate-500">
                            {entry.leadCount} lead{entry.leadCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                          {entry.productName && (
                            <span className="text-xs text-slate-600">&#8226; {entry.productName}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* How it works tooltip */}
          {showHowItWorks && (
            <div className="absolute z-20 top-16 left-0 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">How WarmLead AI Works</span>
                <button onClick={() => setShowHowItWorks(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p>WarmLead AI uses Claude with web search to find real people at your target company who are publicly signaling the pain points your product solves.</p>
                <p className="font-medium text-slate-300">Sources searched:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>LinkedIn public posts and profiles</li>
                  <li>Reddit (r/dataengineering, r/analytics, etc.)</li>
                  <li>Company engineering/tech blogs</li>
                  <li>Conference speaker listings</li>
                  <li>Job postings (indicate organizational priorities)</li>
                </ul>
                <p className="font-medium text-slate-300 mt-2">Company Intel tab also provides:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Tech stack detection</li>
                  <li>Capability relevance mapping</li>
                  <li>Competitive landscape</li>
                  <li>Recent news and data initiatives</li>
                </ul>
                <p className="text-slate-500 mt-2 italic">Searches typically run 30-90 seconds with web search enabled.</p>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <StatusBar isActive={isSearching} mode={searchMode} />

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results area */}
        {(searchedCompany && !isSearching) && (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{searchedCompany}</h2>
                {searchDuration !== null && (
                  <p className="text-xs text-slate-500">
                    {leads.length} lead{leads.length !== 1 ? 's' : ''} found in {searchDuration}s
                  </p>
                )}
              </div>
              <ExportButton leads={leads} companyName={searchedCompany} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-5 border-b border-slate-700 pb-px">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border-b-2 border-red-500 -mb-px'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'leads' && leads.length > 0 && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full ml-1">
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
              <CompanyIntel research={intelResult} />
            )}
          </>
        )}

        {/* Empty state */}
        {!searchedCompany && !isSearching && (
          <div className="text-center py-16">
            <Users className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Find Your Warm Leads</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Enter a company name to discover people publicly signaling the pain points {productConfig.productName || 'your product'} solves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
