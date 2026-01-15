/**
 * SEC EDGAR Integration
 * Fetches and analyzes 10-K and 10-Q filings for public companies
 */

// Key sections to extract from filings
const FILING_SECTIONS = {
  'Item 1': 'Business Description',
  'Item 1A': 'Risk Factors',
  'Item 7': "Management's Discussion and Analysis (MD&A)",
  'Item 1B': 'Unresolved Staff Comments',
  'Item 2': 'Properties',
  'Item 3': 'Legal Proceedings',
};

/**
 * Search and analyze SEC filings using Claude web search
 * This approach works in Claude artifacts without CORS issues
 */
export const analyzeSecFilings = async (companyName, ticker = null) => {
  const searchTerm = ticker || companyName;

  const prompt = `Search for the most recent SEC EDGAR filings for "${searchTerm}" (${companyName}).

Find their latest 10-K (annual report) and any recent 10-Q (quarterly reports) from the SEC EDGAR database.

For each filing found, extract and summarize:
1. **Risk Factors (Item 1A)** - Key business risks disclosed
2. **Business Description (Item 1)** - What the company does, markets served
3. **MD&A (Item 7)** - Management's discussion of financial condition, trends, challenges
4. **Technology & Data mentions** - Any references to BI, analytics, data strategy, AI, digital transformation

Focus on finding specific quotes and facts that relate to:
- Data and analytics initiatives
- Technology investments or challenges
- Cost optimization efforts
- Regulatory/compliance concerns
- Digital transformation plans
- Cloud or infrastructure mentions

CRITICAL: Return ONLY valid JSON, no other text.

JSON format:
{
  "companyName": "${companyName}",
  "ticker": "${ticker || 'Unknown'}",
  "filings": [
    {
      "type": "10-K",
      "fiscalYear": "2023",
      "filingDate": "2024-02-15",
      "url": "https://www.sec.gov/..."
    }
  ],
  "riskFactors": [
    {
      "category": "Technology/Data",
      "risk": "Description of the risk",
      "quote": "Direct quote from filing if available"
    }
  ],
  "businessDescription": "Summary of what the company does",
  "mdaHighlights": [
    {
      "topic": "Topic area",
      "insight": "Key insight from MD&A"
    }
  ],
  "technologyMentions": [
    {
      "topic": "AI/Analytics/Cloud/etc",
      "context": "What they said about it"
    }
  ],
  "strategicInitiatives": ["Initiative 1", "Initiative 2"],
  "summary": "Overall summary of key findings relevant to enterprise analytics sales"
}

If the company is private or you cannot find SEC filings, return:
{
  "companyName": "${companyName}",
  "ticker": null,
  "filings": [],
  "riskFactors": [],
  "businessDescription": "Company appears to be private - no SEC filings available",
  "mdaHighlights": [],
  "technologyMentions": [],
  "strategicInitiatives": [],
  "summary": "No SEC filings found. This company may be private or trade under a different name.",
  "isPrivate": true
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout for thorough search

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    let textContent = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("");

    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Enrich with theme mapping
    const themeRelevance = analyzeThemeRelevance(parsed);

    return {
      ...parsed,
      themeRelevance,
      scanDate: new Date().toISOString()
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('SEC filing search timed out. Try again later.');
    }
    throw err;
  }
};

/**
 * Analyze SEC findings for GTM theme relevance
 */
const analyzeThemeRelevance = (data) => {
  const themes = {};

  // Check risk factors for theme signals
  (data.riskFactors || []).forEach(risk => {
    const text = `${risk.category} ${risk.risk} ${risk.quote || ''}`.toLowerCase();

    if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
      themes['governed-ai'] = (themes['governed-ai'] || 0) + 1;
    }
    if (text.includes('compliance') || text.includes('regulatory') || text.includes('audit')) {
      themes['trust-scale'] = (themes['trust-scale'] || 0) + 1;
    }
    if (text.includes('data') && (text.includes('quality') || text.includes('governance'))) {
      themes['semantic-layer'] = (themes['semantic-layer'] || 0) + 1;
    }
    if (text.includes('cost') || text.includes('expense') || text.includes('margin')) {
      themes['controlled-costs'] = (themes['controlled-costs'] || 0) + 1;
    }
    if (text.includes('vendor') || text.includes('lock-in') || text.includes('third party')) {
      themes['portability-flexibility'] = (themes['portability-flexibility'] || 0) + 1;
    }
  });

  // Check technology mentions
  (data.technologyMentions || []).forEach(mention => {
    const text = `${mention.topic} ${mention.context}`.toLowerCase();

    if (text.includes('analytics') || text.includes('bi') || text.includes('business intelligence')) {
      themes['self-service'] = (themes['self-service'] || 0) + 1;
    }
    if (text.includes('real-time') || text.includes('faster') || text.includes('agile')) {
      themes['time-to-insight'] = (themes['time-to-insight'] || 0) + 1;
    }
    if (text.includes('consolidat') || text.includes('legacy') || text.includes('moderniz')) {
      themes['tco-consolidation'] = (themes['tco-consolidation'] || 0) + 1;
    }
    if (text.includes('cloud') || text.includes('multi-cloud') || text.includes('hybrid')) {
      themes['portability-flexibility'] = (themes['portability-flexibility'] || 0) + 1;
    }
  });

  // Check MD&A highlights
  (data.mdaHighlights || []).forEach(highlight => {
    const text = `${highlight.topic} ${highlight.insight}`.toLowerCase();

    if (text.includes('cost') || text.includes('efficien') || text.includes('saving')) {
      themes['controlled-costs'] = (themes['controlled-costs'] || 0) + 1;
      themes['tco-consolidation'] = (themes['tco-consolidation'] || 0) + 1;
    }
    if (text.includes('digital') || text.includes('transform')) {
      themes['governed-ai'] = (themes['governed-ai'] || 0) + 1;
    }
  });

  return themes;
};

/**
 * Direct SEC EDGAR API search (for standalone deployment)
 * Note: Requires proxy due to CORS, and proper User-Agent header
 */
export const searchEdgarDirect = async (ticker, userAgent, proxyUrl = '/api/sec') => {
  const params = new URLSearchParams({
    q: ticker,
    dateRange: 'custom',
    forms: '10-K,10-Q',
    startdt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enddt: new Date().toISOString().split('T')[0],
  });

  try {
    const response = await fetch(`${proxyUrl}/cgi-bin/srch-ia?${params}`, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error(`SEC search failed: ${err.message}`);
  }
};

/**
 * Get filing section names
 */
export const SECTION_NAMES = FILING_SECTIONS;

/**
 * Risk category icons
 */
export const RISK_CATEGORIES = {
  'Technology/Data': '💻',
  'Cybersecurity': '🔒',
  'Regulatory': '⚖️',
  'Operational': '⚙️',
  'Financial': '💰',
  'Competition': '🏁',
  'Market': '📊',
  'Other': '📋'
};

export default { analyzeSecFilings, searchEdgarDirect, SECTION_NAMES, RISK_CATEGORIES };
