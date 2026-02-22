/**
 * Authenticity Scorer
 *
 * Uses Claude with web search as a judge to verify whether each lead
 * is a real person at the claimed company with the claimed title.
 *
 * Returns per-lead verdicts and an aggregate authenticity rate.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const JUDGE_MODEL = 'claude-sonnet-4-20250514';

async function verifyLead(lead, apiKey) {
  const prompt = `You are a fact-checking assistant. Your job is to verify whether the following person is real and works (or recently worked) at the claimed company with a similar title.

Person to verify:
- Name: ${lead.name}
- Title: ${lead.title}
- Company: ${lead.company}
- Source claimed: ${lead.source}
${lead.sourceUrl ? `- Source URL: ${lead.sourceUrl}` : ''}

Search the web to verify this person. Check LinkedIn, company websites, press releases, conference listings, or any other public source.

IMPORTANT:
- "Hiring Manager" with a Job Posting source does NOT need name verification — mark as "skip"
- Generic placeholder names like "John Doe" or obviously fabricated names should be flagged

Respond with ONLY valid JSON:
{
  "verdict": "verified" | "unverified" | "fabricated" | "skip",
  "confidence": "high" | "medium" | "low",
  "evidence": "Brief explanation of what you found or didn't find",
  "actualTitle": "Their actual title if different from claimed, or null"
}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Judge API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.content
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('');

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      verdict: 'unverified',
      confidence: 'low',
      evidence: 'Judge response was not valid JSON',
      actualTitle: null
    };
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Score a set of leads for authenticity.
 *
 * @param {Array} leads - Array of lead objects from findWarmLeads
 * @param {string} apiKey - Anthropic API key
 * @returns {Object} { leadVerdicts, summary }
 */
export async function scoreAuthenticity(leads, apiKey) {
  if (!leads || leads.length === 0) {
    return {
      leadVerdicts: [],
      summary: {
        totalLeads: 0,
        verified: 0,
        unverified: 0,
        fabricated: 0,
        skipped: 0,
        authenticityRate: null,
        score: 0
      }
    };
  }

  const verdicts = [];

  // Run verifications sequentially to avoid rate limits
  for (const lead of leads) {
    const isJobPosting = lead.source?.toLowerCase().includes('job posting')
      && lead.name?.toLowerCase().includes('hiring');

    if (isJobPosting) {
      verdicts.push({
        lead: { name: lead.name, title: lead.title, company: lead.company },
        verdict: 'skip',
        confidence: 'high',
        evidence: 'Job posting with generic hiring manager — no name to verify',
        actualTitle: null
      });
      continue;
    }

    try {
      const result = await verifyLead(lead, apiKey);
      verdicts.push({
        lead: { name: lead.name, title: lead.title, company: lead.company },
        ...result
      });
    } catch (err) {
      verdicts.push({
        lead: { name: lead.name, title: lead.title, company: lead.company },
        verdict: 'unverified',
        confidence: 'low',
        evidence: `Verification failed: ${err.message}`,
        actualTitle: null
      });
    }
  }

  // Compute summary
  const verifiable = verdicts.filter(v => v.verdict !== 'skip');
  const verified = verifiable.filter(v => v.verdict === 'verified').length;
  const fabricated = verifiable.filter(v => v.verdict === 'fabricated').length;
  const unverified = verifiable.filter(v => v.verdict === 'unverified').length;
  const skipped = verdicts.filter(v => v.verdict === 'skip').length;

  // Score: verified = 1, unverified = 0.5, fabricated = 0
  // Harsh on fabrication — a single fabricated lead tanks the score
  const verifiableCount = verifiable.length;
  let score = 0;
  if (verifiableCount > 0) {
    const rawScore = (verified * 1.0 + unverified * 0.5 + fabricated * 0) / verifiableCount;
    // Penalty: each fabricated lead applies a 0.2 penalty on top
    score = Math.max(0, rawScore - fabricated * 0.2);
  }

  return {
    leadVerdicts: verdicts,
    summary: {
      totalLeads: leads.length,
      verified,
      unverified,
      fabricated,
      skipped,
      authenticityRate: verifiableCount > 0
        ? Math.round((verified / verifiableCount) * 100)
        : null,
      score: Math.round(score * 100) / 100
    }
  };
}
