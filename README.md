# Account Research Engine

AI-powered account research tool that analyzes companies and maps findings to your GTM themes. Built for sales engineers to quickly prepare for prospect meetings with persona-specific talking points.

![Strategy Account Research](https://img.shields.io/badge/Strategy-Account%20Research-red)

![Demo](bespokeprospecttool-ezgif.com-video-to-gif-converter.gif)

## What It Does

1. **Ingests** public data about target accounts (10-Ks, news, earnings calls, press releases)
2. **Extracts** relevant signals (pain points, initiatives, leadership changes, financial pressures)
3. **Maps** signals to your GTM themes (Governed AI, Single Source of Truth, etc.)
4. **Filters** by buyer persona (CIO, CFO, CDO, COO, Business User)
5. **Outputs** talking points and discovery questions for sales conversations

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key (for Claude API calls)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/account-research-engine.git
cd account-research-engine

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the app
npm run dev
```

### Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
# Optional: for enhanced features
SEC_EDGAR_USER_AGENT=YourName your@email.com
NEWS_API_KEY=your_newsapi_key
```

## Architecture

```
account-research-engine/
├── src/
│   ├── components/
│   │   ├── AccountResearchApp.jsx   # Main app component
│   │   ├── ThemeCard.jsx            # GTM theme display
│   │   ├── PersonaSelector.jsx      # Buyer persona filter
│   │   ├── CompanyHeader.jsx        # Company info display
│   │   └── ExportOptions.jsx        # Export functionality
│   ├── config/
│   │   ├── themes.js                # GTM theme definitions
│   │   └── personas.js              # Buyer persona definitions
│   ├── services/
│   │   ├── claudeApi.js             # Claude API wrapper
│   │   ├── secEdgar.js              # SEC filing fetcher
│   │   └── newsApi.js               # News aggregation
│   ├── utils/
│   │   ├── jsonParser.js            # Safe JSON extraction
│   │   └── exporters.js             # PDF/PPTX/etc generators
│   └── App.jsx
├── public/
├── .env.example
├── package.json
└── README.md
```

## Current Features

- [x] Company research via Claude API
- [x] 8 GTM theme mapping
- [x] 5 buyer personas with priority themes
- [x] Fast mode (no web search) vs Full mode (with web search)
- [x] Relevance scoring per theme
- [x] Evidence citations with sources
- [x] Talking points generation
- [x] Discovery questions

## Feature Roadmap

### Phase 1: Core Enhancements (Priority)

#### 1.1 SEC EDGAR Integration
Pull real 10-K/10-Q filings instead of relying on Claude's training data.

```
Claude Code Prompt:
"Add SEC EDGAR integration to fetch 10-K and 10-Q filings. Use the SEC EDGAR API 
(https://www.sec.gov/search-api/query) to search by company name/ticker. Parse 
the filing HTML to extract relevant sections (Risk Factors, MD&A, Business 
Description). Pass the extracted text to Claude for analysis. Add a 'Sources' 
section showing which filings were analyzed."
```

#### 1.2 Export to PDF One-Pager
Generate a clean PDF summary for meeting prep.

```
Claude Code Prompt:
"Add PDF export functionality using @react-pdf/renderer. Create a one-page 
layout with: company header, executive summary, top 3 relevant themes with 
talking points, discovery questions, and competitive context. Style it 
professionally with the Strategy brand colors (red/dark gray). Add an 
'Export PDF' button to the UI."
```

#### 1.3 Salesforce Field Export
Copy research as Salesforce-ready fields.

```
Claude Code Prompt:
"Add a 'Copy for Salesforce' button that formats the research into standard 
SFDC fields: Account Description, Industry, Key Pain Points (multi-line), 
Competitive Landscape, Next Steps. Use clipboard API to copy. Show a toast 
notification on success."
```

### Phase 2: Data Sources

#### 2.1 News API Integration
Real-time news beyond Claude's training cutoff.

```
Claude Code Prompt:
"Integrate NewsAPI.org to fetch recent news articles about the target company. 
Add a NEWS_API_KEY environment variable. Fetch the top 10 articles from the 
past 30 days. Display them in a 'Recent News' section. Pass headlines and 
snippets to Claude for theme analysis alongside the main research."
```

#### 2.2 Earnings Call Transcripts
Access recent earnings call content.

```
Claude Code Prompt:
"Add earnings call transcript analysis. Use the Seeking Alpha unofficial API 
or scrape from public sources. Extract key quotes from the CEO/CFO about 
technology investments, cost initiatives, and strategic priorities. Map these 
to GTM themes. Show direct quotes as evidence."
```

### Phase 3: Account Management

#### 3.1 Save & History
Persist research for future reference.

```
Claude Code Prompt:
"Add local storage persistence for researched accounts. Create a sidebar 
showing research history with company name, date, and top themes. Allow 
clicking to reload past research. Add a 'Clear History' option. Use 
localStorage for now, but structure the code so we can swap to a database 
later."
```

#### 3.2 Batch Research
Research multiple accounts at once.

```
Claude Code Prompt:
"Add batch research mode. Allow users to paste a list of company names 
(one per line) or upload a CSV. Process them sequentially with a progress 
indicator. Show results in a table view with company name, top theme, and 
relevance score. Allow drilling into individual accounts. Add rate limiting 
to avoid API throttling."
```

#### 3.3 Account Notes & Annotations
Add personal notes to research.

```
Claude Code Prompt:
"Add a notes section to each researched account. Allow users to type free-form 
notes that persist with the account. Add the ability to 'flag' specific themes 
or talking points as important. Show flagged items at the top. Store in 
localStorage alongside the research data."
```

### Phase 4: Enhanced Analysis

#### 4.1 Competitive Install Detection
Identify current BI/analytics tools.

```
Claude Code Prompt:
"Add competitive intelligence detection. Search for job postings mentioning 
the company + BI tools (Tableau, Power BI, Looker, Qlik, Databricks, Snowflake). 
Check LinkedIn job posts or Indeed. Parse for technology mentions. Add a 
'Competitive Install' section showing detected tools with confidence levels."
```

#### 4.2 Key Contacts / Org Chart
Identify relevant personas at the account.

```
Claude Code Prompt:
"Add key contact identification. Search for the company's CIO, CDO, CFO, 
VP of Analytics, Director of BI on LinkedIn (via search, not API). Display 
name, title, and tenure. Map each contact to the persona most likely to 
care about our themes. Show which persona's themes to emphasize for each 
contact."
```

#### 4.3 Financial Health Scoring
Assess company's financial situation.

```
Claude Code Prompt:
"Add financial health analysis for public companies. Fetch key metrics from 
a free API (Alpha Vantage, Yahoo Finance): revenue growth, operating margin, 
debt/equity, cash position. Calculate a simple 'financial health' score. 
Flag if company is under cost pressure (relevant for TCO/Controlled Costs 
themes) or investing heavily (relevant for AI/Modernization themes)."
```

### Phase 5: Integrations

#### 5.1 Salesforce Push
Write research directly to SFDC.

```
Claude Code Prompt:
"Add Salesforce integration using the Salesforce REST API. Allow users to 
authenticate via OAuth. On export, search for the account in SFDC by name. 
If found, update custom fields (Research_Summary__c, Key_Themes__c, etc.). 
If not found, offer to create. Show success/failure toast. Store OAuth 
tokens securely."
```

#### 5.2 Slack Integration
Share research to team channels.

```
Claude Code Prompt:
"Add Slack integration using incoming webhooks. Allow users to configure a 
webhook URL in settings. Add a 'Share to Slack' button. Format the research 
as a Slack message with blocks: company header, summary, top themes, and a 
link to full research. Include the researcher's name and timestamp."
```

#### 5.3 Email Draft Generator
Create outreach emails based on research.

```
Claude Code Prompt:
"Add email draft generation. Based on the research findings and selected 
persona, generate a personalized outreach email. Use Claude to write the 
email, referencing specific findings (e.g., 'I noticed your recent 10-K 
mentioned AI initiatives...'). Allow editing before copying. Provide 
templates for: cold outreach, meeting follow-up, and executive briefing."
```

### Phase 6: Collaboration

#### 6.1 Shareable Links
Share research via URL.

```
Claude Code Prompt:
"Add shareable research links. When research is complete, generate a unique 
URL that encodes the research data (use base64 or a short ID with backend 
storage). Anyone with the link can view the research read-only. Add a 
'Copy Link' button. Consider privacy - don't include sensitive notes in 
shared links."
```

#### 6.2 Team Comments
Collaborate on account research.

```
Claude Code Prompt:
"Add team commenting on research. Allow multiple users to add comments to 
specific themes or talking points. Show comments inline with timestamp and 
author. This requires a simple backend - use Supabase or Firebase for quick 
setup. Add real-time updates so comments appear without refresh."
```

## GTM Themes (Customizable)

Edit `src/config/themes.js` to customize:

| Theme | Description | Key Signals |
|-------|-------------|-------------|
| Governed AI | AI grounded in trusted data vs. hallucination | AI initiatives, data quality, GenAI adoption |
| Single Source of Truth | Consistent metrics across org | Data silos, multiple BI tools, metric chaos |
| Trust at Scale | Enterprise security & compliance | SOX, GDPR, audit, regulatory |
| Self-Service Without Chaos | Empower users without shadow analytics | BI democratization, report backlogs |
| Time-to-Insight | Faster decisions | Real-time needs, competitive agility |
| TCO / Consolidation | Replace fragmented BI stack | Vendor sprawl, legacy modernization |
| Controlled Costs | Predictable analytics spend | Budget pressure, consumption pricing |
| Portability & Flexibility | Avoid vendor lock-in | Multi-cloud, best-of-breed, optionality |

## Buyer Personas (Customizable)

Edit `src/config/personas.js` to customize:

| Persona | Priority Themes |
|---------|-----------------|
| CIO/CTO | Portability → TCO → Trust → Governed AI |
| CFO/Finance | Controlled Costs → TCO → Trust → Single Source of Truth |
| CDO/Data Leader | Single Source of Truth → Governed AI → Trust → Self-Service |
| COO/Operations | Time-to-Insight → Self-Service → Single Source of Truth → Costs |
| Business User | Self-Service → Time-to-Insight → Governed AI → Portability |

## API Reference

### Claude API Call Structure

The app makes calls to the Anthropic API with this structure:

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search" }] // optional
  })
});
```

### Response Structure

```javascript
{
  companyName: "Dell Technologies",
  ticker: "DELL",
  industry: "Technology Hardware",
  summary: "...",
  keyInsights: ["...", "...", "..."],
  themeFindings: {
    "governed-ai": {
      relevanceScore: 85,
      evidence: [{ source: "10-K", text: "..." }],
      talkingPoints: ["...", "..."],
      questions: ["..."]
    },
    // ... other themes
  },
  competitiveContext: "...",
  recentNews: ["...", "..."]
}
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

Built for Strategy Sales Engineering
