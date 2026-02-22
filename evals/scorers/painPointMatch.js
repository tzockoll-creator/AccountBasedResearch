/**
 * Pain Point Match Scorer
 *
 * Two checks:
 * 1. Config alignment — are the detectedPainPoints from each lead actually
 *    in (or semantically close to) the product config's pain points list?
 * 2. Content grounding — does the lead's `content` field actually contain
 *    evidence of the claimed pain points, or is it hallucinated tagging?
 */

/**
 * Fuzzy match: check if a detected pain point is close enough to any
 * config pain point. Uses simple substring/token overlap.
 */
function fuzzyMatch(detected, configPainPoints) {
  const dLower = detected.toLowerCase().trim();

  // Exact substring match in either direction
  for (const cpp of configPainPoints) {
    const cLower = cpp.toLowerCase().trim();
    if (cLower.includes(dLower) || dLower.includes(cLower)) {
      return { matched: true, matchedTo: cpp, method: 'substring' };
    }
  }

  // Token overlap: if 60%+ of tokens in detected appear in some config pain point
  const dTokens = dLower.split(/\s+/).filter(t => t.length > 2);
  for (const cpp of configPainPoints) {
    const cTokens = cpp.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const overlap = dTokens.filter(dt => cTokens.some(ct => ct.includes(dt) || dt.includes(ct)));
    if (dTokens.length > 0 && overlap.length / dTokens.length >= 0.6) {
      return { matched: true, matchedTo: cpp, method: 'token-overlap' };
    }
  }

  return { matched: false, matchedTo: null, method: null };
}

/**
 * Check if the lead's content field actually contains evidence
 * of the claimed pain points (simple keyword grounding).
 */
function checkGrounding(lead) {
  if (!lead.content || !lead.detectedPainPoints?.length) {
    return { grounded: 0, total: 0, details: [] };
  }

  const contentLower = lead.content.toLowerCase();
  const details = [];

  for (const pp of lead.detectedPainPoints) {
    // Extract key tokens from the pain point (words > 3 chars)
    const tokens = pp.toLowerCase().split(/\s+/).filter(t => t.length > 3);

    // Check if at least 40% of meaningful tokens appear in content
    const found = tokens.filter(t => contentLower.includes(t));
    const isGrounded = tokens.length > 0 && found.length / tokens.length >= 0.4;

    details.push({
      painPoint: pp,
      grounded: isGrounded,
      tokensChecked: tokens.length,
      tokensFound: found.length
    });
  }

  const groundedCount = details.filter(d => d.grounded).length;
  return {
    grounded: groundedCount,
    total: details.length,
    details
  };
}

/**
 * Score leads for pain point matching.
 *
 * @param {Array} leads - Array of lead objects
 * @param {Object} productConfig - The product config used for the search
 * @returns {Object} { leadScores, summary }
 */
export function scorePainPointMatch(leads, productConfig) {
  if (!leads || leads.length === 0) {
    return {
      leadScores: [],
      summary: {
        totalLeads: 0,
        avgAlignmentRate: null,
        avgGroundingRate: null,
        inventedPainPoints: [],
        score: 0
      }
    };
  }

  const configPainPoints = productConfig.painPoints || [];
  const allInvented = [];
  const leadScores = [];

  for (const lead of leads) {
    const detected = lead.detectedPainPoints || [];

    // 1. Config alignment
    const alignmentResults = detected.map(pp => {
      const match = fuzzyMatch(pp, configPainPoints);
      if (!match.matched) {
        allInvented.push({ leadName: lead.name, painPoint: pp });
      }
      return { painPoint: pp, ...match };
    });

    const alignedCount = alignmentResults.filter(r => r.matched).length;
    const alignmentRate = detected.length > 0
      ? Math.round((alignedCount / detected.length) * 100)
      : 100; // no pain points = no misalignment

    // 2. Content grounding
    const grounding = checkGrounding(lead);
    const groundingRate = grounding.total > 0
      ? Math.round((grounding.grounded / grounding.total) * 100)
      : null;

    leadScores.push({
      lead: { name: lead.name, title: lead.title },
      detectedPainPoints: detected,
      alignment: {
        rate: alignmentRate,
        total: detected.length,
        aligned: alignedCount,
        details: alignmentResults
      },
      grounding: {
        rate: groundingRate,
        ...grounding
      }
    });
  }

  // Aggregate
  const leadsWithPainPoints = leadScores.filter(l => l.detectedPainPoints.length > 0);
  const avgAlignment = leadsWithPainPoints.length > 0
    ? Math.round(leadsWithPainPoints.reduce((s, l) => s + l.alignment.rate, 0) / leadsWithPainPoints.length)
    : null;

  const leadsWithGrounding = leadScores.filter(l => l.grounding.rate !== null);
  const avgGrounding = leadsWithGrounding.length > 0
    ? Math.round(leadsWithGrounding.reduce((s, l) => s + l.grounding.rate, 0) / leadsWithGrounding.length)
    : null;

  // Combined score: 60% alignment, 40% grounding
  let score = 0;
  if (avgAlignment !== null) {
    const alignmentNorm = avgAlignment / 100;
    const groundingNorm = avgGrounding !== null ? avgGrounding / 100 : 0.5; // default if no grounding measurable
    score = Math.round((alignmentNorm * 0.6 + groundingNorm * 0.4) * 100) / 100;
  }

  return {
    leadScores,
    summary: {
      totalLeads: leads.length,
      avgAlignmentRate: avgAlignment,
      avgGroundingRate: avgGrounding,
      inventedPainPoints: allInvented,
      score
    }
  };
}
