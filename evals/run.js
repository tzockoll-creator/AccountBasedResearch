#!/usr/bin/env node

/**
 * WarmLead AI Eval Runner
 *
 * Runs the findWarmLeads API call against test cases and scores results
 * for authenticity (real people?) and pain point matching (config-aligned?).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node evals/run.js [case-name]
 *
 * Examples:
 *   node evals/run.js              # Run all cases
 *   node evals/run.js dell         # Run only the Dell case
 *   node evals/run.js --skip-auth  # Skip authenticity scoring (saves API calls)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { scoreAuthenticity } from './scorers/authenticity.js';
import { scorePainPointMatch } from './scorers/painPointMatch.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const EVALS_DIR = new URL('.', import.meta.url).pathname;
const CASES_DIR = join(EVALS_DIR, 'cases');
const RESULTS_DIR = join(EVALS_DIR, 'results');

function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!key) {
    console.error('Error: Set ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }
  return key;
}

/**
 * Call findWarmLeads (mirrored from src/services/claudeApi.js)
 * Duplicated here so evals run standalone without Vite/import.meta.env
 */
async function callFindWarmLeads(companyName, productConfig, apiKey) {
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
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-dangerous-direct-browser-access': 'true'
      },
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
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function loadCases(filterName) {
  const files = readdirSync(CASES_DIR).filter(f => f.endsWith('.json'));
  return files
    .filter(f => !filterName || basename(f, '.json') === filterName)
    .map(f => ({
      name: basename(f, '.json'),
      ...JSON.parse(readFileSync(join(CASES_DIR, f), 'utf-8'))
    }));
}

function printSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function printScore(label, value, max = 1) {
  const pct = Math.round((value / max) * 100);
  const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
  console.log(`  ${label.padEnd(25)} ${bar} ${pct}%`);
}

async function runCase(caseDef, apiKey, skipAuth) {
  const { name, company, productConfig } = caseDef;
  printSection(`Case: ${company} (${name})`);
  console.log(`  ${caseDef.description}`);

  // Step 1: Call findWarmLeads
  console.log(`\n  ⏳ Calling findWarmLeads for "${company}"...`);
  const startTime = Date.now();
  let apiResult;
  try {
    apiResult = await callFindWarmLeads(company, productConfig, apiKey);
  } catch (err) {
    console.log(`  ❌ API call failed: ${err.message}`);
    return {
      case: name,
      company,
      error: err.message,
      leads: [],
      authenticity: null,
      painPointMatch: null,
      overallScore: 0
    };
  }
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const leads = apiResult.leads || [];
  console.log(`  ✅ Got ${leads.length} leads in ${elapsed}s`);

  // Step 2: Score pain point matching (fast, no API calls)
  console.log(`\n  📋 Scoring pain point matching...`);
  const ppResult = scorePainPointMatch(leads, productConfig);
  console.log(`  Alignment rate: ${ppResult.summary.avgAlignmentRate ?? 'N/A'}%`);
  console.log(`  Grounding rate: ${ppResult.summary.avgGroundingRate ?? 'N/A'}%`);
  if (ppResult.summary.inventedPainPoints.length > 0) {
    console.log(`  ⚠️  Invented pain points (not in config):`);
    for (const inv of ppResult.summary.inventedPainPoints) {
      console.log(`     - "${inv.painPoint}" (from ${inv.leadName})`);
    }
  }

  // Step 3: Score authenticity (slow, uses API calls per lead)
  let authResult = null;
  if (!skipAuth && leads.length > 0) {
    console.log(`\n  🔍 Scoring authenticity (${leads.length} leads to verify)...`);
    authResult = await scoreAuthenticity(leads, apiKey);
    console.log(`  Verified: ${authResult.summary.verified}/${authResult.summary.totalLeads - authResult.summary.skipped}`);
    if (authResult.summary.fabricated > 0) {
      console.log(`  🚨 FABRICATED: ${authResult.summary.fabricated} leads appear to be fake`);
      for (const v of authResult.leadVerdicts.filter(v => v.verdict === 'fabricated')) {
        console.log(`     - ${v.lead.name} (${v.lead.title}): ${v.evidence}`);
      }
    }
  } else if (skipAuth) {
    console.log(`\n  ⏭️  Skipping authenticity scoring (--skip-auth)`);
  }

  // Compute overall score
  const ppScore = ppResult.summary.score;
  const authScore = authResult ? authResult.summary.score : null;

  // If we have both scores: 50/50 weight. If only pain points: use that.
  const overallScore = authScore !== null
    ? Math.round(((ppScore + authScore) / 2) * 100) / 100
    : ppScore;

  // Print summary
  console.log('\n  📊 Scores:');
  printScore('Pain Point Match', ppScore);
  if (authScore !== null) {
    printScore('Authenticity', authScore);
  }
  printScore('Overall', overallScore);

  return {
    case: name,
    company,
    timestamp: new Date().toISOString(),
    elapsed,
    leadCount: leads.length,
    leads: leads.map(l => ({ name: l.name, title: l.title, source: l.source })),
    rawApiResult: apiResult,
    painPointMatch: ppResult,
    authenticity: authResult,
    scores: {
      painPointMatch: ppScore,
      authenticity: authScore,
      overall: overallScore
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const skipAuth = args.includes('--skip-auth');
  const filterName = args.find(a => !a.startsWith('--'));

  const apiKey = getApiKey();
  const cases = loadCases(filterName);

  if (cases.length === 0) {
    console.error(`No cases found${filterName ? ` matching "${filterName}"` : ''}`);
    process.exit(1);
  }

  console.log(`\nWarmLead AI Eval Runner`);
  console.log(`Cases: ${cases.map(c => c.name).join(', ')}`);
  console.log(`Authenticity scoring: ${skipAuth ? 'DISABLED' : 'ENABLED'}`);

  const results = [];
  for (const caseDef of cases) {
    const result = await runCase(caseDef, apiKey, skipAuth);
    results.push(result);
  }

  // Final summary
  printSection('EVAL SUMMARY');
  for (const r of results) {
    const status = r.error ? '❌' : '✅';
    console.log(`  ${status} ${r.company.padEnd(25)} Leads: ${String(r.leadCount ?? 0).padStart(2)}  Score: ${r.scores?.overall ?? 'ERR'}`);
  }

  const avgScore = results.filter(r => r.scores?.overall != null);
  if (avgScore.length > 0) {
    const avg = Math.round(avgScore.reduce((s, r) => s + r.scores.overall, 0) / avgScore.length * 100) / 100;
    console.log(`\n  Average overall score: ${avg}`);
  }

  // Save results
  const outFile = join(RESULTS_DIR, `eval-${Date.now()}.json`);
  writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\n  Results saved to: ${outFile}`);
}

main().catch(err => {
  console.error('Eval runner crashed:', err);
  process.exit(1);
});
