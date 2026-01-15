// BI/Analytics tools to detect with their categories
const TOOLS = {
  // BI Platforms
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

  // Data Platforms
  'Snowflake': { category: 'Data Platform', vendor: 'Snowflake' },
  'Databricks': { category: 'Data Platform', vendor: 'Databricks' },
  'BigQuery': { category: 'Data Platform', vendor: 'Google' },
  'Redshift': { category: 'Data Platform', vendor: 'AWS' },
  'Synapse': { category: 'Data Platform', vendor: 'Microsoft' },
  'Azure Synapse': { category: 'Data Platform', vendor: 'Microsoft' },
  'Teradata': { category: 'Data Platform', vendor: 'Teradata' },
  'Vertica': { category: 'Data Platform', vendor: 'OpenText' },

  // Data Integration / ETL
  'Informatica': { category: 'Data Integration', vendor: 'Informatica' },
  'Talend': { category: 'Data Integration', vendor: 'Qlik' },
  'Fivetran': { category: 'Data Integration', vendor: 'Fivetran' },
  'dbt': { category: 'Data Integration', vendor: 'dbt Labs' },
  'Airbyte': { category: 'Data Integration', vendor: 'Open Source' },
  'Matillion': { category: 'Data Integration', vendor: 'Matillion' },
  'Stitch': { category: 'Data Integration', vendor: 'Talend' },

  // Data Catalog / Governance
  'Alation': { category: 'Data Governance', vendor: 'Alation' },
  'Collibra': { category: 'Data Governance', vendor: 'Collibra' },
  'Atlan': { category: 'Data Governance', vendor: 'Atlan' },
  'DataHub': { category: 'Data Governance', vendor: 'Open Source' },
};

// Build regex patterns for matching
const buildToolPatterns = () => {
  return Object.keys(TOOLS).map(tool => ({
    name: tool,
    pattern: new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    ...TOOLS[tool]
  }));
};

const TOOL_PATTERNS = buildToolPatterns();

/**
 * Detect competitive tools from job posting search
 */
export const detectCompetitiveTools = async (companyName) => {
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
        tools: [{
          type: "web_search_20250305",
          name: "web_search"
        }]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract text from response
    let textContent = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("");

    // Clean up response
    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Enrich with tool metadata and calculate confidence
    const enrichedTools = enrichToolData(parsed.toolMentions || {});

    return {
      ...parsed,
      enrichedTools,
      scanDate: new Date().toISOString()
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Competitive scan timed out. Try again later.');
    }
    throw err;
  }
};

/**
 * Enrich tool mentions with metadata and confidence scores
 */
const enrichToolData = (toolMentions) => {
  const totalMentions = Object.values(toolMentions).reduce((a, b) => a + b, 0);

  return Object.entries(toolMentions)
    .map(([toolName, count]) => {
      const toolInfo = TOOLS[toolName] || { category: 'Unknown', vendor: 'Unknown' };

      // Calculate confidence based on mention frequency
      let confidence = 'Low';
      if (count >= 3 || (totalMentions > 0 && count / totalMentions >= 0.3)) {
        confidence = 'High';
      } else if (count >= 2 || (totalMentions > 0 && count / totalMentions >= 0.15)) {
        confidence = 'Medium';
      }

      return {
        name: toolName,
        mentions: count,
        confidence,
        category: toolInfo.category,
        vendor: toolInfo.vendor
      };
    })
    .sort((a, b) => b.mentions - a.mentions);
};

/**
 * Get strategic implications based on detected tools
 */
export const getStrategicImplications = (enrichedTools) => {
  const implications = [];

  const hasBIPlatform = enrichedTools.some(t => t.category === 'BI Platform');
  const hasDataPlatform = enrichedTools.some(t => t.category === 'Data Platform');
  const hasSnowflake = enrichedTools.some(t => t.name === 'Snowflake');
  const hasDatabricks = enrichedTools.some(t => t.name === 'Databricks');
  const hasTableau = enrichedTools.some(t => t.name === 'Tableau');
  const hasPowerBI = enrichedTools.some(t => t.name === 'Power BI');
  const hasLooker = enrichedTools.some(t => t.name === 'Looker');

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

export default { detectCompetitiveTools, getStrategicImplications };
