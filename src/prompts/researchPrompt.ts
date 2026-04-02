/**
 * Claude prompt templates for company research and warm lead finding.
 * Extracted for easy iteration and testing.
 */

import type { ProductConfig } from '../types';

/**
 * Build the company research prompt for mapping findings to product capabilities.
 */
export function buildResearchPrompt(companyName: string, productConfig: ProductConfig): string {
  const capabilitiesList = productConfig.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const painPointsList = productConfig.painPoints.map(p => `- ${p}`).join('\n');

  return `You are an expert B2B sales researcher helping a sales team selling "${productConfig.productName}".

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
}

/**
 * Build the warm leads finding prompt.
 */
export function buildWarmLeadsPrompt(companyName: string, productConfig: ProductConfig): string {
  const painPointsList = productConfig.painPoints.map(p => `- ${p}`).join('\n');
  const rolesList = productConfig.targetRoles.map(r => `- ${r}`).join('\n');
  const capabilitiesList = productConfig.capabilities.map(c => `- ${c}`).join('\n');

  return `You are an expert B2B sales intelligence researcher. Your job is to find "warm leads" — real people at "${companyName}" who are publicly signaling pain points that "${productConfig.productName}" solves.

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
}

/**
 * Build the competitive detection prompt for scanning job postings.
 */
export function buildCompetitiveDetectionPrompt(companyName: string): string {
  return `Search for recent job postings from "${companyName}" that mention analytics, business intelligence, data engineering, or data analyst roles.

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
}
