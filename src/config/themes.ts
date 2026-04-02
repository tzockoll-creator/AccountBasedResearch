/**
 * GTM Theme Configuration
 *
 * Customize these themes to match your company's go-to-market messaging.
 * Each theme includes:
 * - id: Unique identifier (used in code)
 * - name: Display name
 * - icon: Lucide icon name
 * - color: Tailwind color name (used for styling)
 * - description: Short description shown in UI
 * - signals: Keywords Claude looks for when analyzing companies
 */

import type { GtmTheme } from '../types';

export const GTM_THEMES: GtmTheme[] = [
  {
    id: 'governed-ai',
    name: 'Governed AI',
    icon: 'Shield',
    color: 'rose',
    description: 'AI answers grounded in trusted, governed data vs. hallucination risk',
    signals: [
      'AI initiatives',
      'data quality concerns',
      'analytics modernization',
      'digital transformation',
      'machine learning',
      'generative AI',
      'LLM',
      'chatbot',
      'automation',
      'AI governance',
      'responsible AI'
    ]
  },
  {
    id: 'semantic-layer',
    name: 'Single Source of Truth',
    icon: 'Target',
    color: 'blue',
    description: 'One consistent definition of metrics across the organization',
    signals: [
      'data silos',
      'inconsistent reporting',
      'multiple BI tools',
      'data governance',
      'metric definitions',
      'data dictionary',
      'master data',
      'conflicting reports',
      'data discrepancies',
      'single version of truth'
    ]
  },
  {
    id: 'trust-scale',
    name: 'Trust at Scale',
    icon: 'Building2',
    color: 'emerald',
    description: 'Enterprise-grade security, governance, and auditability',
    signals: [
      'compliance',
      'regulatory',
      'audit',
      'security',
      'SOX',
      'GDPR',
      'HIPAA',
      'data privacy',
      'risk management',
      'internal controls',
      'data protection',
      'cybersecurity'
    ]
  },
  {
    id: 'self-service',
    name: 'Self-Service Without Chaos',
    icon: 'Users',
    color: 'violet',
    description: 'Empower business users without creating shadow analytics',
    signals: [
      'business intelligence',
      'self-service',
      'democratize data',
      'citizen analyst',
      'data literacy',
      'report backlog',
      'IT bottleneck',
      'ad-hoc reporting',
      'business user',
      'data democratization'
    ]
  },
  {
    id: 'time-to-insight',
    name: 'Time-to-Insight',
    icon: 'Zap',
    color: 'amber',
    description: 'Faster decisions through natural language + governed data',
    signals: [
      'real-time',
      'faster decisions',
      'agility',
      'speed',
      'competitive advantage',
      'market dynamics',
      'rapid change',
      'time-sensitive',
      'decision velocity',
      'operational speed'
    ]
  },
  {
    id: 'tco-consolidation',
    name: 'TCO / Consolidation',
    icon: 'DollarSign',
    color: 'teal',
    description: 'Replace fragmented BI stack with unified platform',
    signals: [
      'cost reduction',
      'consolidation',
      'efficiency',
      'streamline',
      'reduce complexity',
      'vendor sprawl',
      'technical debt',
      'legacy systems',
      'modernization',
      'platform rationalization'
    ]
  },
  {
    id: 'controlled-costs',
    name: 'Controlled Costs',
    icon: 'TrendingDown',
    color: 'orange',
    description: 'Predictable, manageable analytics spend without runaway consumption costs',
    signals: [
      'budget constraints',
      'cost overruns',
      'cloud costs',
      'consumption pricing',
      'unpredictable spend',
      'CFO',
      'cost controls',
      'budget optimization',
      'expense management',
      'margin pressure',
      'profitability',
      'cost discipline'
    ]
  },
  {
    id: 'portability-flexibility',
    name: 'Portability & Flexibility',
    icon: 'Shuffle',
    color: 'cyan',
    description: 'Freedom to choose any front-end, avoid vendor lock-in, and adapt as technology evolves',
    signals: [
      'vendor lock-in',
      'proprietary',
      'migration',
      'flexibility',
      'open standards',
      'interoperability',
      'multi-cloud',
      'portability',
      'switching costs',
      'future-proof',
      'optionality',
      'best-of-breed'
    ]
  }
];

/** Get theme by ID */
export const getThemeById = (id: string): GtmTheme | undefined =>
  GTM_THEMES.find(t => t.id === id);

/** Get all theme IDs */
export const getThemeIds = (): string[] => GTM_THEMES.map(t => t.id);
