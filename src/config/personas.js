/**
 * Buyer Persona Configuration
 * 
 * Customize these personas to match your target buyers.
 * Each persona includes:
 * - id: Unique identifier
 * - name: Display name
 * - title: Full title
 * - icon: Emoji for quick recognition
 * - priorities: Array of theme IDs in priority order (first = most important)
 * - cares: What this persona cares about
 * - avoids: What this persona wants to avoid
 */

export const PERSONAS = [
  {
    id: 'cio',
    name: 'CIO / CTO',
    title: 'Chief Information Officer / Chief Technology Officer',
    icon: '🖥️',
    priorities: ['portability-flexibility', 'tco-consolidation', 'trust-scale', 'governed-ai'],
    cares: 'Technology strategy, architecture, vendor management, IT efficiency, innovation enablement, digital transformation',
    avoids: 'Vendor lock-in, technical debt, shadow IT, security risks, integration complexity'
  },
  {
    id: 'cfo',
    name: 'CFO / Finance',
    title: 'Chief Financial Officer',
    icon: '💰',
    priorities: ['controlled-costs', 'tco-consolidation', 'trust-scale', 'semantic-layer'],
    cares: 'Predictable spend, ROI, audit compliance, accurate financial reporting, cost control, margin improvement',
    avoids: 'Runaway cloud costs, inconsistent metrics, compliance gaps, budget surprises'
  },
  {
    id: 'cdo',
    name: 'CDO / Data Leader',
    title: 'Chief Data Officer / VP Data & Analytics',
    icon: '📊',
    priorities: ['semantic-layer', 'governed-ai', 'trust-scale', 'self-service'],
    cares: 'Data governance, single source of truth, data quality, democratization with guardrails, AI governance',
    avoids: 'Data silos, ungoverned AI, metric chaos, shadow analytics, data quality issues'
  },
  {
    id: 'coo',
    name: 'COO / Operations',
    title: 'Chief Operating Officer / VP Operations',
    icon: '⚙️',
    priorities: ['time-to-insight', 'self-service', 'semantic-layer', 'controlled-costs'],
    cares: 'Operational efficiency, real-time visibility, faster decisions, process optimization, performance management',
    avoids: 'Slow reporting cycles, inconsistent data, bottlenecks, delayed insights'
  },
  {
    id: 'business',
    name: 'Business User / Analyst',
    title: 'Line of Business / Business Analyst',
    icon: '👤',
    priorities: ['self-service', 'time-to-insight', 'governed-ai', 'portability-flexibility'],
    cares: 'Easy access to data, quick answers, flexibility in tools, trusted insights, natural language queries',
    avoids: 'IT backlogs, waiting for reports, unreliable data, complex interfaces'
  },
  {
    id: 'ciso',
    name: 'CISO / Security',
    title: 'Chief Information Security Officer',
    icon: '🔒',
    priorities: ['trust-scale', 'governed-ai', 'portability-flexibility', 'semantic-layer'],
    cares: 'Data security, access controls, compliance, audit trails, AI safety, privacy',
    avoids: 'Shadow IT, ungoverned data access, compliance violations, security gaps'
  }
];

/**
 * Get persona by ID
 */
export const getPersonaById = (id) => PERSONAS.find(p => p.id === id);

/**
 * Get all persona IDs
 */
export const getPersonaIds = () => PERSONAS.map(p => p.id);

/**
 * Get themes prioritized for a persona
 */
export const getPersonaThemes = (personaId, allThemes) => {
  const persona = getPersonaById(personaId);
  if (!persona) return allThemes;
  
  return [...allThemes].sort((a, b) => {
    const aIdx = persona.priorities.indexOf(a.id);
    const bIdx = persona.priorities.indexOf(b.id);
    const aPriority = aIdx === -1 ? 999 : aIdx;
    const bPriority = bIdx === -1 ? 999 : bIdx;
    return aPriority - bPriority;
  });
};
