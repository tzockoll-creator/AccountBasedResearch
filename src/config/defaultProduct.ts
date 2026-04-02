/**
 * Default Product Configuration
 *
 * Pre-loaded with Strategy (formerly MicroStrategy) defaults.
 * Users can modify these or create their own product configs.
 */

import type { ProductConfig } from '../types';

export const STRATEGY_PRESET: ProductConfig = {
  productName: 'Strategy (MicroStrategy)',
  capabilities: [
    'Governed AI Analytics',
    'Semantic Layer / Single Source of Truth',
    'Self-Service BI with Guardrails',
    'Cloud-Agnostic Architecture',
    'Enterprise Security & Compliance'
  ],
  painPoints: [
    'inconsistent metrics across teams',
    'BI tool sprawl (Tableau, Power BI, Looker fragmentation)',
    'AI hallucinations from ungoverned data',
    'cloud cost overruns from consumption pricing',
    'analytics backlog / IT bottleneck',
    'data governance gaps',
    'vendor lock-in concerns',
    'shadow analytics / ungoverned self-service',
    'slow time-to-insight',
    'compliance and audit risks'
  ],
  targetRoles: [
    'CDO / CTO / CIO / VP Data',
    'Director / Head of Data & Analytics',
    'Data Architect / Principal Engineer',
    'Senior Data Engineer / Analytics Engineer',
    'BI Developer / Report Developer'
  ]
};

export const EMPTY_PRODUCT: ProductConfig = {
  productName: '',
  capabilities: [],
  painPoints: [],
  targetRoles: [
    'CDO / CTO / CIO / VP Data',
    'Director / Head of Data & Analytics',
    'Data Architect / Principal Engineer',
    'Senior Data Engineer / Analytics Engineer'
  ]
};
