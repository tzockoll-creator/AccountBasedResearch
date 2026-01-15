/**
 * News Search Utility
 * Fetches recent news about a company and analyzes for GTM theme relevance
 */

// Theme keywords for categorization
const THEME_KEYWORDS = {
  'governed-ai': ['AI', 'artificial intelligence', 'machine learning', 'GenAI', 'generative AI', 'LLM', 'chatbot', 'automation', 'data quality'],
  'semantic-layer': ['data governance', 'single source of truth', 'metrics', 'BI consolidation', 'data silos', 'analytics platform'],
  'trust-scale': ['compliance', 'security', 'audit', 'regulatory', 'SOX', 'GDPR', 'HIPAA', 'data privacy', 'risk'],
  'self-service': ['self-service', 'business intelligence', 'democratize', 'citizen analyst', 'data literacy'],
  'time-to-insight': ['real-time', 'faster decisions', 'agility', 'speed', 'competitive advantage'],
  'tco-consolidation': ['cost reduction', 'consolidation', 'efficiency', 'modernization', 'legacy', 'technical debt'],
  'controlled-costs': ['budget', 'cost control', 'cloud costs', 'spending', 'margin', 'profitability', 'expense'],
  'portability-flexibility': ['multi-cloud', 'vendor lock-in', 'migration', 'flexibility', 'open', 'interoperability']
};

/**
 * Analyze news text for theme relevance
 */
const analyzeThemeRelevance = (text) => {
  const textLower = text.toLowerCase();
  const themes = [];

  for (const [themeId, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        if (!themes.includes(themeId)) {
          themes.push(themeId);
        }
        break;
      }
    }
  }

  return themes;
};

/**
 * Search for news using Claude's web search capability
 */
export const searchNewsWithClaude = async (companyName) => {
  const prompt = `Search for the most recent news articles about "${companyName}" from the past 30 days.

Focus on:
- Business and technology announcements
- Financial news (earnings, acquisitions, investments)
- Strategic initiatives (digital transformation, AI adoption, cloud migration)
- Leadership changes
- Partnerships and vendor relationships

For each article found, extract:
1. Headline
2. Source (publication name)
3. Date (approximate if exact not available)
4. Brief summary (1-2 sentences)
5. URL if available

CRITICAL: Return ONLY valid JSON, no other text.

JSON format:
{
  "companyName": "${companyName}",
  "searchDate": "2024-01-15",
  "articles": [
    {
      "headline": "Article headline",
      "source": "Publication Name",
      "date": "2024-01-10",
      "summary": "Brief summary of the article",
      "url": "https://example.com/article"
    }
  ],
  "summary": "Overall summary of recent news themes and trends"
}

If no recent news is found, return:
{
  "companyName": "${companyName}",
  "searchDate": "2024-01-15",
  "articles": [],
  "summary": "No recent news articles found for this company"
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
        max_tokens: 3000,
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

    // Enrich articles with theme analysis
    const enrichedArticles = (parsed.articles || []).map(article => ({
      ...article,
      themes: analyzeThemeRelevance(`${article.headline} ${article.summary}`)
    }));

    // Count theme occurrences across all articles
    const themeCounts = {};
    enrichedArticles.forEach(article => {
      article.themes.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return {
      ...parsed,
      articles: enrichedArticles,
      themeCounts,
      scanDate: new Date().toISOString()
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('News search timed out. Try again later.');
    }
    throw err;
  }
};

/**
 * Search news using NewsAPI (for standalone deployment with proxy)
 * Note: NewsAPI requires a backend proxy due to CORS restrictions
 */
export const searchNewsWithAPI = async (companyName, apiKey, proxyUrl = '/api/news') => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

  const params = new URLSearchParams({
    q: companyName,
    from: fromDate,
    sortBy: 'relevancy',
    language: 'en',
    pageSize: '10'
  });

  try {
    const response = await fetch(`${proxyUrl}?${params}`, {
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI returned an error');
    }

    // Transform to our format
    const articles = (data.articles || []).map(article => ({
      headline: article.title,
      source: article.source?.name || 'Unknown',
      date: article.publishedAt?.split('T')[0] || 'Unknown',
      summary: article.description || '',
      url: article.url,
      themes: analyzeThemeRelevance(`${article.title} ${article.description}`)
    }));

    const themeCounts = {};
    articles.forEach(article => {
      article.themes.forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return {
      companyName,
      searchDate: new Date().toISOString().split('T')[0],
      articles,
      themeCounts,
      summary: `Found ${articles.length} recent articles about ${companyName}`,
      scanDate: new Date().toISOString()
    };

  } catch (err) {
    throw new Error(`News search failed: ${err.message}`);
  }
};

/**
 * Get theme name from ID
 */
export const THEME_NAMES = {
  'governed-ai': 'Governed AI',
  'semantic-layer': 'Single Source of Truth',
  'trust-scale': 'Trust at Scale',
  'self-service': 'Self-Service Without Chaos',
  'time-to-insight': 'Time-to-Insight',
  'tco-consolidation': 'TCO / Consolidation',
  'controlled-costs': 'Controlled Costs',
  'portability-flexibility': 'Portability & Flexibility'
};

export default { searchNewsWithClaude, searchNewsWithAPI, THEME_NAMES };
