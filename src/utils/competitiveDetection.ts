/**
 * Competitive tool detection via job posting analysis.
 */

import { API_CONFIG } from '../config/appConfig';
import { buildCompetitiveDetectionPrompt } from '../prompts/researchPrompt';
import type { ToolInfo, EnrichedTool, CompetitiveResult, StrategicImplication } from '../types';

// BI/Analytics tools to detect with their categories
const TOOLS: Record<string, ToolInfo> = {
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

/** Detect competitive tools from job posting search */
export const detectCompetitiveTools = async (companyName: string): Promise<CompetitiveResult> => {
  const prompt = buildCompetitiveDetectionPrompt(companyName);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.competitiveTimeout);

  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': API_CONFIG.version,
        'anthropic-dangerous-direct-browser-access': 'true',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || ''
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        tools: [API_CONFIG.webSearchTool]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    let textContent = data.content
      .filter((item: { type: string }) => item.type === 'text')
      .map((item: { text: string }) => item.text)
      .join('');

    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const enrichedTools = enrichToolData(parsed.toolMentions || {});

    return {
      ...parsed,
      enrichedTools,
      scanDate: new Date().toISOString()
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Competitive scan timed out. Try again later.');
    }
    throw err;
  }
};

/** Enrich tool mentions with metadata and confidence scores */
const enrichToolData = (toolMentions: Record<string, number>): EnrichedTool[] => {
  const totalMentions = Object.values(toolMentions).reduce((a, b) => a + b, 0);

  return Object.entries(toolMentions)
    .map(([toolName, count]): EnrichedTool => {
      const toolInfo = TOOLS[toolName] || { category: 'Unknown', vendor: 'Unknown' };

      let confidence: 'High' | 'Medium' | 'Low' = 'Low';
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

/** Get strategic implications based on detected tools */
export const getStrategicImplications = (enrichedTools: EnrichedTool[]): StrategicImplication[] => {
  const implications: StrategicImplication[] = [];

  const hasTableau = enrichedTools.some(t => t.name === 'Tableau');
  const hasPowerBI = enrichedTools.some(t => t.name === 'Power BI');
  const hasLooker = enrichedTools.some(t => t.name === 'Looker');
  const hasSnowflake = enrichedTools.some(t => t.name === 'Snowflake');
  const hasDatabricks = enrichedTools.some(t => t.name === 'Databricks');
  const hasBIPlatform = enrichedTools.some(t => t.category === 'BI Platform');
  const hasDataPlatform = enrichedTools.some(t => t.category === 'Data Platform');

  if (hasTableau || hasPowerBI || hasLooker) {
    const names = [hasTableau && 'Tableau', hasPowerBI && 'Power BI', hasLooker && 'Looker']
      .filter(Boolean).join('/');
    implications.push({
      theme: 'portability-flexibility',
      insight: `Currently using ${names} - potential vendor lock-in. Strategy's open architecture could provide flexibility.`
    });
  }

  if (hasSnowflake || hasDatabricks) {
    const names = [hasSnowflake && 'Snowflake', hasDatabricks && 'Databricks']
      .filter(Boolean).join('/');
    implications.push({
      theme: 'semantic-layer',
      insight: `Invested in ${names} - likely need a semantic layer to govern metrics across their data platform.`
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
