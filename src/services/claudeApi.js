/**
 * Claude API Service
 *
 * Handles all Anthropic API calls for company research and warm lead finding.
 * Uses claude-sonnet-4-6 with web_search tool.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
}

function buildHeaders() {
  const apiKey = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
}

/**
 * Retry-aware fetch that handles 429 rate limits with backoff
 */
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < maxRetries) {
      const retryAfter = response.headers.get('retry-after');
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 15000;
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }
    return response;
  }
}

/**
 * Extract and parse JSON from Claude's response
 */
function extractJSON(data) {
  const textContent = data.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('');

  let cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Research a company and map findings to product capabilities
 */
export async function researchCompany(companyName, productConfig, { signal } = {}) {
  const capabilitiesList = productConfig.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const painPointsList = productConfig.painPoints.map(p => `- ${p}`).join('\n');

  const prompt = `You are an expert B2B sales researcher helping a sales team selling "${productConfig.productName}".

Analyze the company "${companyName}" and provide account research mapped to our product capabilities.

Our product's key capabilities:
${capabilitiesList}

Pain points our product solves:
${painPointsList}

For this company, research and provide:
1. Company overview (name, ticker if public, industry, employee count estimate)
2. Executive summary of why this account is relevant for our product
3. Key insights (3-5 bullet points)
4. Tech stack signals - what data/analytics/BI tools they currently use
5. For EACH of our capabilities, score relevance 0-100 and provide:
   - Evidence found (with source attribution)
   - Talking points for sales conversations
   - Discovery questions to ask
6. Recent news relevant to our product positioning
7. Competitive context - what solutions they currently use in our space

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
  "employeeCount": "Approximate employee count",
  "summary": "2-3 sentence executive summary of why this account is interesting",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "techStack": {
    "confirmed": ["Tool1", "Tool2"],
    "likely": ["Tool3"],
    "notes": "Additional context about their tech environment"
  },
  "capabilityMapping": [
    {
      "capability": "Capability name from our list",
      "relevanceScore": 85,
      "evidence": [{"source": "10-K / News / Job posting", "text": "specific finding"}],
      "talkingPoints": ["point1", "point2"],
      "questions": ["discovery question 1"]
    }
  ],
  "competitiveContext": "Known vendors they use or are evaluating in our space",
  "recentNews": ["Recent relevant news item 1", "Recent relevant news item 2"],
  "dataInitiatives": ["Notable data/tech initiative 1", "Initiative 2"]
}

If a capability has no relevant findings, set relevanceScore to 0 and leave arrays empty.
Be specific and cite actual business context where possible.

Remember: Output ONLY the JSON object, nothing else.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  // Combine external signal with timeout
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    return extractJSON(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Try again or use a simpler company name.');
    }
    throw err;
  }
}

/**
 * Find warm leads at a company - people publicly signaling pain points
 */
export async function findWarmLeads(companyName, productConfig, { signal } = {}) {
  const painPointsList = productConfig.painPoints.map(p => `- ${p}`).join('\n');
  const rolesList = productConfig.targetRoles.map(r => `- ${r}`).join('\n');
  const capabilitiesList = productConfig.capabilities.map(c => `- ${c}`).join('\n');

  const prompt = `You are an expert B2B sales intelligence researcher. Your job is to find "warm leads" — real people at "${companyName}" who are publicly signaling pain points that "${productConfig.productName}" solves.

PRODUCT CONTEXT:
Product: ${productConfig.productName}
Key capabilities:
${capabilitiesList}

Pain points to detect:
${painPointsList}

Target roles (in priority order):
${rolesList}

SEARCH INSTRUCTIONS:
Search thoroughly across these sources for people at "${companyName}" who are publicly discussing, writing about, or signaling the pain points listed above:

1. **LinkedIn public posts** - Search for "${companyName}" employees posting about data analytics, BI tools, data governance, or any of the pain points above
2. **Reddit** - Search r/dataengineering, r/businessintelligence, r/analytics, r/MachineLearning for mentions by "${companyName}" employees
3. **Company tech blog** - Search for "${companyName}" engineering blog or tech blog posts about data/analytics topics
4. **Conference speakers** - Search for "${companyName}" speakers at data conferences (Snowflake Summit, dbt Coalesce, Gartner Data & Analytics, Strata, etc.)
5. **Job postings** - Search "${companyName}" job postings that mention the pain point keywords — these indicate organizational priorities even if we don't have a named lead

For EACH lead found, provide:
- Full name (real name only — never fabricate)
- Title/role at the company
- Source where you found them (LinkedIn, Reddit, Blog, Conference, Job Posting)
- Source URL if available
- The actual content/context (what they said, wrote, or posted)
- Which pain points from our list were detected
- Relevance score 0-100 (how strong is the signal)
- A personalized outreach angle — a specific first line for outreach that references what they actually said or did (NOT generic)

CRITICAL INSTRUCTIONS:
- ONLY include REAL people you actually found through search. NEVER fabricate names or leads.
- If you cannot find real people, return an empty leads array — that is better than fake data.
- Job postings without named individuals should still be included with name: "Hiring Manager" and the job title as their role.
- Your response must be ONLY valid JSON
- Do NOT include any explanation, preamble, or commentary
- Start your response with { and end with }

JSON format:
{
  "companyContext": {
    "companyName": "${companyName}",
    "industry": "Primary industry",
    "relevantInitiatives": ["Data/tech initiative found during search"],
    "overallSignalStrength": "high/medium/low"
  },
  "leads": [
    {
      "name": "Full Name",
      "title": "Their Title at Company",
      "company": "${companyName}",
      "source": "LinkedIn | Reddit | Blog | Conference | Job Posting",
      "sourceUrl": "URL where found (if available, otherwise null)",
      "content": "What they said, wrote, or posted — the actual signal",
      "detectedPainPoints": ["pain point 1 from our list", "pain point 2"],
      "relevanceScore": 85,
      "outreachAngle": "Specific personalized first line referencing what they said"
    }
  ],
  "searchSummary": {
    "sourcesSearched": ["LinkedIn", "Reddit", "Company blog", "Conferences", "Job postings"],
    "totalSignalsFound": 5,
    "strongestSource": "LinkedIn"
  }
}

Remember: Output ONLY the JSON object, nothing else. Quality over quantity — 3 real leads beat 10 fabricated ones.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150000); // 2.5 min timeout for deeper search

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    return extractJSON(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Lead searches can take up to 2 minutes with deep web search.');
    }
    throw err;
  }
}
