/**
 * Core TypeScript interfaces for the WarmLead AI application.
 */

// --- Theme Configuration ---

export interface GtmTheme {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  signals: string[];
}

// --- Persona Configuration ---

export interface Persona {
  id: string;
  name: string;
  title: string;
  icon: string;
  priorities: string[];
  cares: string;
  avoids: string;
}

// --- Product Configuration ---

export interface ProductConfig {
  productName: string;
  capabilities: string[];
  painPoints: string[];
  targetRoles: string[];
}

// --- API Response: Company Research ---

export interface EvidenceItem {
  source: string;
  text: string;
}

export interface CapabilityMapping {
  capability: string;
  relevanceScore: number;
  evidence: EvidenceItem[];
  talkingPoints: string[];
  questions: string[];
}

export interface TechStack {
  confirmed: string[];
  likely: string[];
  notes: string;
}

export interface CompanyResearchResult {
  companyName: string;
  ticker: string | null;
  industry: string;
  employeeCount?: string;
  summary: string;
  keyInsights: string[];
  techStack: TechStack;
  capabilityMapping: CapabilityMapping[];
  competitiveContext: string;
  recentNews: string[];
  dataInitiatives: string[];
  _error?: string;
}

// --- API Response: Warm Leads ---

export interface WarmLead {
  name: string;
  title: string;
  company: string;
  source: string;
  sourceUrl: string | null;
  content: string;
  detectedPainPoints: string[];
  relevanceScore: number;
  outreachAngle: string;
}

export interface CompanyContext {
  companyName: string;
  industry: string;
  relevantInitiatives: string[];
  overallSignalStrength: string;
}

export interface SearchSummary {
  sourcesSearched: string[];
  totalSignalsFound: number;
  strongestSource: string;
}

export interface WarmLeadsResult {
  companyContext: CompanyContext;
  leads: WarmLead[];
  searchSummary: SearchSummary;
  _error?: string;
}

// --- Research History ---

export interface HistoryEntry {
  companyName: string;
  timestamp: number;
  leadCount: number;
  topLeadName: string | null;
  topLeadTitle: string | null;
  productName: string;
}

// --- Competitive Detection ---

export interface ToolInfo {
  category: string;
  vendor: string;
}

export interface EnrichedTool {
  name: string;
  mentions: number;
  confidence: 'High' | 'Medium' | 'Low';
  category: string;
  vendor: string;
}

export interface JobPosting {
  title: string;
  tools: string[];
  source: string;
}

export interface CompetitiveResult {
  companyName: string;
  jobPostings: JobPosting[];
  toolMentions: Record<string, number>;
  summary: string;
  enrichedTools: EnrichedTool[];
  scanDate: string;
  implications?: StrategicImplication[];
}

export interface StrategicImplication {
  theme: string;
  insight: string;
}

// --- Theme Findings (from AccountResearchApp) ---

export interface ThemeFindings {
  relevanceScore: number;
  evidence: EvidenceItem[];
  talkingPoints: string[];
  questions: string[];
}

export interface ThemeResearchResult {
  companyName: string;
  ticker: string | null;
  industry: string;
  summary: string;
  keyInsights: string[];
  themeFindings: Record<string, ThemeFindings>;
  competitiveContext: string;
  recentNews: string[];
}
