// BI/Analytics tools to detect with their categories
const TOOLS = {
  // BI Platforms
  'Tableau': { category: 'BI Platform', vendor: 'Salesforce', tier: 'enterprise', age: 'mature' },
  'Power BI': { category: 'BI Platform', vendor: 'Microsoft', tier: 'enterprise', age: 'mature' },
  'Looker': { category: 'BI Platform', vendor: 'Google', tier: 'enterprise', age: 'mature' },
  'Qlik': { category: 'BI Platform', vendor: 'Qlik', tier: 'enterprise', age: 'legacy' },
  'QlikView': { category: 'BI Platform', vendor: 'Qlik', tier: 'enterprise', age: 'legacy' },
  'Qlik Sense': { category: 'BI Platform', vendor: 'Qlik', tier: 'enterprise', age: 'mature' },
  'MicroStrategy': { category: 'BI Platform', vendor: 'Strategy', tier: 'enterprise', age: 'mature' },
  'Domo': { category: 'BI Platform', vendor: 'Domo', tier: 'mid-market', age: 'mature' },
  'Sisense': { category: 'BI Platform', vendor: 'Sisense', tier: 'mid-market', age: 'mature' },
  'ThoughtSpot': { category: 'BI Platform', vendor: 'ThoughtSpot', tier: 'enterprise', age: 'modern' },
  'Mode': { category: 'BI Platform', vendor: 'ThoughtSpot', tier: 'mid-market', age: 'modern' },
  'Metabase': { category: 'BI Platform', vendor: 'Open Source', tier: 'departmental', age: 'modern' },
  'Superset': { category: 'BI Platform', vendor: 'Apache', tier: 'departmental', age: 'modern' },
  'Sigma': { category: 'BI Platform', vendor: 'Sigma Computing', tier: 'mid-market', age: 'modern' },
  'SAP BusinessObjects': { category: 'BI Platform', vendor: 'SAP', tier: 'enterprise', age: 'legacy' },
  'BusinessObjects': { category: 'BI Platform', vendor: 'SAP', tier: 'enterprise', age: 'legacy' },
  'BOBJ': { category: 'BI Platform', vendor: 'SAP', tier: 'enterprise', age: 'legacy' },
  'Cognos': { category: 'BI Platform', vendor: 'IBM', tier: 'enterprise', age: 'legacy' },
  'IBM Cognos': { category: 'BI Platform', vendor: 'IBM', tier: 'enterprise', age: 'legacy' },
  'OBIEE': { category: 'BI Platform', vendor: 'Oracle', tier: 'enterprise', age: 'legacy' },
  'Oracle BI': { category: 'BI Platform', vendor: 'Oracle', tier: 'enterprise', age: 'legacy' },
  'Oracle Analytics': { category: 'BI Platform', vendor: 'Oracle', tier: 'enterprise', age: 'mature' },

  // Data Platforms
  'Snowflake': { category: 'Data Platform', vendor: 'Snowflake', tier: 'enterprise', age: 'modern' },
  'Databricks': { category: 'Data Platform', vendor: 'Databricks', tier: 'enterprise', age: 'modern' },
  'BigQuery': { category: 'Data Platform', vendor: 'Google', tier: 'enterprise', age: 'modern' },
  'Redshift': { category: 'Data Platform', vendor: 'AWS', tier: 'enterprise', age: 'mature' },
  'Synapse': { category: 'Data Platform', vendor: 'Microsoft', tier: 'enterprise', age: 'mature' },
  'Azure Synapse': { category: 'Data Platform', vendor: 'Microsoft', tier: 'enterprise', age: 'mature' },
  'Teradata': { category: 'Data Platform', vendor: 'Teradata', tier: 'enterprise', age: 'legacy' },
  'Vertica': { category: 'Data Platform', vendor: 'OpenText', tier: 'enterprise', age: 'legacy' },
  'Exadata': { category: 'Data Platform', vendor: 'Oracle', tier: 'enterprise', age: 'legacy' },
  'Netezza': { category: 'Data Platform', vendor: 'IBM', tier: 'enterprise', age: 'legacy' },

  // Data Integration / ETL
  'Informatica': { category: 'Data Integration', vendor: 'Informatica', tier: 'enterprise', age: 'mature' },
  'Talend': { category: 'Data Integration', vendor: 'Qlik', tier: 'mid-market', age: 'mature' },
  'Fivetran': { category: 'Data Integration', vendor: 'Fivetran', tier: 'mid-market', age: 'modern' },
  'dbt': { category: 'Data Integration', vendor: 'dbt Labs', tier: 'mid-market', age: 'modern' },
  'Airbyte': { category: 'Data Integration', vendor: 'Open Source', tier: 'departmental', age: 'modern' },
  'Matillion': { category: 'Data Integration', vendor: 'Matillion', tier: 'mid-market', age: 'modern' },
  'Stitch': { category: 'Data Integration', vendor: 'Talend', tier: 'mid-market', age: 'mature' },
  'SSIS': { category: 'Data Integration', vendor: 'Microsoft', tier: 'enterprise', age: 'legacy' },
  'DataStage': { category: 'Data Integration', vendor: 'IBM', tier: 'enterprise', age: 'legacy' },

  // Data Catalog / Governance
  'Alation': { category: 'Data Governance', vendor: 'Alation', tier: 'enterprise', age: 'modern' },
  'Collibra': { category: 'Data Governance', vendor: 'Collibra', tier: 'enterprise', age: 'mature' },
  'Atlan': { category: 'Data Governance', vendor: 'Atlan', tier: 'mid-market', age: 'modern' },
  'DataHub': { category: 'Data Governance', vendor: 'Open Source', tier: 'departmental', age: 'modern' },
};

// Vendor metadata for relationship mapping
const VENDOR_METADATA = {
  'Salesforce': {
    parentCompany: 'Salesforce',
    ecosystem: 'Salesforce Cloud',
    products: ['Tableau', 'Tableau CRM', 'Einstein Analytics'],
    lockInFactors: ['CRM integration', 'Salesforce ecosystem', 'Lightning platform'],
    displacement: { difficulty: 'high', reason: 'Deep CRM integration makes switching costly' }
  },
  'Microsoft': {
    parentCompany: 'Microsoft',
    ecosystem: 'Microsoft Azure / M365',
    products: ['Power BI', 'Azure Synapse', 'SSIS', 'Excel'],
    lockInFactors: ['M365 licensing', 'Azure ecosystem', 'Active Directory', 'Teams integration'],
    displacement: { difficulty: 'high', reason: 'Bundled with E5 licensing, tight Office integration' }
  },
  'Google': {
    parentCompany: 'Alphabet',
    ecosystem: 'Google Cloud',
    products: ['Looker', 'BigQuery', 'Looker Studio'],
    lockInFactors: ['BigQuery native', 'GCP ecosystem', 'Workspace integration'],
    displacement: { difficulty: 'medium', reason: 'Strong if on GCP, otherwise more portable' }
  },
  'Qlik': {
    parentCompany: 'Qlik (Thoma Bravo)',
    ecosystem: 'Qlik Cloud',
    products: ['Qlik Sense', 'QlikView', 'Talend'],
    lockInFactors: ['QVD files', 'Proprietary in-memory engine', 'Script language'],
    displacement: { difficulty: 'medium', reason: 'Proprietary data format creates friction' }
  },
  'SAP': {
    parentCompany: 'SAP SE',
    ecosystem: 'SAP Enterprise',
    products: ['BusinessObjects', 'SAP Analytics Cloud', 'BW/4HANA'],
    lockInFactors: ['ERP integration', 'HANA database', 'SAP ecosystem'],
    displacement: { difficulty: 'high', reason: 'Deep ERP integration, often mandated by IT' }
  },
  'IBM': {
    parentCompany: 'IBM',
    ecosystem: 'IBM Cloud / On-prem',
    products: ['Cognos', 'DataStage', 'Planning Analytics', 'Netezza'],
    lockInFactors: ['Mainframe integration', 'Legacy contracts', 'IBM consulting'],
    displacement: { difficulty: 'medium', reason: 'Legacy tech creates modernization opportunity' }
  },
  'Oracle': {
    parentCompany: 'Oracle Corporation',
    ecosystem: 'Oracle Cloud / On-prem',
    products: ['OBIEE', 'Oracle Analytics', 'Exadata'],
    lockInFactors: ['Oracle DB integration', 'ERP integration', 'Licensing terms'],
    displacement: { difficulty: 'medium', reason: 'Often bundled with database licensing' }
  },
  'Snowflake': {
    parentCompany: 'Snowflake Inc.',
    ecosystem: 'Multi-cloud',
    products: ['Snowflake Data Cloud', 'Streamlit'],
    lockInFactors: ['Data sharing', 'Marketplace', 'Snowpark'],
    displacement: { difficulty: 'low', reason: 'Data platform, not BI - complementary to Strategy' }
  },
  'Databricks': {
    parentCompany: 'Databricks',
    ecosystem: 'Multi-cloud',
    products: ['Lakehouse', 'Delta Lake', 'MLflow'],
    lockInFactors: ['Delta format', 'Unity Catalog', 'ML workflows'],
    displacement: { difficulty: 'low', reason: 'Data platform, not BI - complementary to Strategy' }
  },
  'ThoughtSpot': {
    parentCompany: 'ThoughtSpot',
    ecosystem: 'Cloud-native',
    products: ['ThoughtSpot', 'Mode'],
    lockInFactors: ['Search-based UI', 'SpotIQ'],
    displacement: { difficulty: 'medium', reason: 'Modern competitor, strong in search analytics' }
  },
  'Domo': {
    parentCompany: 'Domo Inc.',
    ecosystem: 'Cloud-native',
    products: ['Domo'],
    lockInFactors: ['Proprietary connectors', 'Beast Mode calculations'],
    displacement: { difficulty: 'low', reason: 'Often used at department level, easier to displace' }
  },
  'Sisense': {
    parentCompany: 'Sisense',
    ecosystem: 'Cloud / Embedded',
    products: ['Sisense', 'Periscope Data'],
    lockInFactors: ['Embedded analytics', 'In-chip technology'],
    displacement: { difficulty: 'low', reason: 'Strong in embedded, less enterprise adoption' }
  },
  'Strategy': {
    parentCompany: 'Strategy (MicroStrategy)',
    ecosystem: 'Multi-cloud / On-prem',
    products: ['MicroStrategy ONE', 'HyperIntelligence'],
    lockInFactors: ['Semantic layer', 'Enterprise security'],
    displacement: { difficulty: 'n/a', reason: 'Our product - upsell opportunity' }
  },
  'Open Source': {
    parentCompany: 'Community',
    ecosystem: 'Self-hosted',
    products: ['Metabase', 'Superset', 'Airbyte', 'DataHub'],
    lockInFactors: ['Customizations', 'Internal expertise'],
    displacement: { difficulty: 'low', reason: 'No vendor contract, easier to replace' }
  }
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
      const toolInfo = TOOLS[toolName] || { category: 'Unknown', vendor: 'Unknown', tier: 'unknown', age: 'unknown' };

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
        vendor: toolInfo.vendor,
        tier: toolInfo.tier,
        age: toolInfo.age
      };
    })
    .sort((a, b) => b.mentions - a.mentions);
};

/**
 * Build vendor relationship map from detected tools (4.2)
 */
export const buildVendorMap = (enrichedTools) => {
  const vendorMap = {};

  enrichedTools.forEach(tool => {
    const vendor = tool.vendor;
    if (!vendorMap[vendor]) {
      const metadata = VENDOR_METADATA[vendor] || {
        parentCompany: vendor,
        ecosystem: 'Unknown',
        products: [],
        lockInFactors: [],
        displacement: { difficulty: 'unknown', reason: 'No data available' }
      };
      vendorMap[vendor] = {
        ...metadata,
        detectedTools: [],
        totalMentions: 0,
        categories: new Set()
      };
    }
    vendorMap[vendor].detectedTools.push(tool);
    vendorMap[vendor].totalMentions += tool.mentions;
    vendorMap[vendor].categories.add(tool.category);
  });

  // Convert Sets to Arrays and calculate vendor strength
  Object.keys(vendorMap).forEach(vendor => {
    vendorMap[vendor].categories = Array.from(vendorMap[vendor].categories);
    vendorMap[vendor].strength = calculateVendorStrength(vendorMap[vendor]);
  });

  return vendorMap;
};

/**
 * Calculate vendor strength/presence score
 */
const calculateVendorStrength = (vendorData) => {
  let score = 0;

  // Points for number of tools
  score += Math.min(vendorData.detectedTools.length * 15, 45);

  // Points for total mentions
  score += Math.min(vendorData.totalMentions * 5, 30);

  // Points for category coverage
  score += vendorData.categories.length * 10;

  // Bonus for enterprise tier tools
  vendorData.detectedTools.forEach(tool => {
    if (tool.tier === 'enterprise') score += 10;
  });

  return Math.min(score, 100);
};

/**
 * Calculate displacement opportunity score (4.3)
 * Returns a score 0-100 and detailed breakdown
 */
export const calculateDisplacementScore = (enrichedTools, vendorMap) => {
  const factors = [];
  let score = 0;

  const biTools = enrichedTools.filter(t => t.category === 'BI Platform');
  const legacyTools = enrichedTools.filter(t => t.age === 'legacy');
  const hasStrategy = enrichedTools.some(t => t.vendor === 'Strategy');

  // Factor 1: Multiple BI platforms (fragmentation)
  if (biTools.length > 1) {
    const fragScore = Math.min(biTools.length * 15, 30);
    score += fragScore;
    factors.push({
      name: 'BI Tool Fragmentation',
      score: fragScore,
      maxScore: 30,
      detail: `${biTools.length} different BI platforms detected - consolidation opportunity`,
      icon: 'layers'
    });
  }

  // Factor 2: Legacy tools present
  if (legacyTools.length > 0) {
    const legacyScore = Math.min(legacyTools.length * 12, 25);
    score += legacyScore;
    factors.push({
      name: 'Legacy Modernization',
      score: legacyScore,
      maxScore: 25,
      detail: `${legacyTools.length} legacy tools (${legacyTools.map(t => t.name).join(', ')}) - modernization needed`,
      icon: 'clock'
    });
  }

  // Factor 3: Low lock-in vendors
  const lowLockInVendors = Object.entries(vendorMap)
    .filter(([, data]) => data.displacement?.difficulty === 'low')
    .map(([vendor]) => vendor);

  if (lowLockInVendors.length > 0) {
    const lockInScore = Math.min(lowLockInVendors.length * 10, 20);
    score += lockInScore;
    factors.push({
      name: 'Low Switching Cost',
      score: lockInScore,
      maxScore: 20,
      detail: `Easy displacement targets: ${lowLockInVendors.join(', ')}`,
      icon: 'unlock'
    });
  }

  // Factor 4: No enterprise semantic layer
  const hasGovernance = enrichedTools.some(t => t.category === 'Data Governance');
  if (!hasGovernance && biTools.length > 0) {
    score += 15;
    factors.push({
      name: 'Governance Gap',
      score: 15,
      maxScore: 15,
      detail: 'No data governance tool detected - semantic layer opportunity',
      icon: 'shield'
    });
  }

  // Factor 5: Data platform without strong BI
  const hasModernDataPlatform = enrichedTools.some(t =>
    t.category === 'Data Platform' && (t.name === 'Snowflake' || t.name === 'Databricks')
  );
  const hasEnterpriseBI = biTools.some(t => t.tier === 'enterprise' && t.vendor !== 'Strategy');

  if (hasModernDataPlatform && !hasEnterpriseBI) {
    score += 10;
    factors.push({
      name: 'Data Platform Ready',
      score: 10,
      maxScore: 10,
      detail: 'Modern data platform in place, needs enterprise BI layer',
      icon: 'database'
    });
  }

  // Penalty: Already using Strategy (but opportunity for expansion)
  if (hasStrategy) {
    score = Math.max(score - 20, 20);
    factors.push({
      name: 'Existing Customer',
      score: -20,
      maxScore: 0,
      detail: 'Already using Strategy - focus on expansion/upsell',
      icon: 'star'
    });
  }

  // Calculate opportunity level
  let opportunityLevel, recommendation;
  if (score >= 70) {
    opportunityLevel = 'High';
    recommendation = 'Strong displacement opportunity. Multiple factors favor switching to Strategy.';
  } else if (score >= 45) {
    opportunityLevel = 'Medium';
    recommendation = 'Moderate opportunity. Focus on specific pain points identified.';
  } else if (score >= 25) {
    opportunityLevel = 'Low';
    recommendation = 'Limited immediate opportunity. Build relationship for long-term potential.';
  } else {
    opportunityLevel = 'Minimal';
    recommendation = 'Low priority target. May be satisfied with current stack or have strong lock-in.';
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    opportunityLevel,
    recommendation,
    factors,
    primaryTargets: biTools.filter(t => t.vendor !== 'Strategy').map(t => ({
      tool: t.name,
      vendor: t.vendor,
      difficulty: VENDOR_METADATA[t.vendor]?.displacement?.difficulty || 'unknown',
      reason: VENDOR_METADATA[t.vendor]?.displacement?.reason || 'No data'
    }))
  };
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

export default { detectCompetitiveTools, getStrategicImplications, buildVendorMap, calculateDisplacementScore };
