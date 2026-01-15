# CLAUDE.md - Instructions for Claude Code

## Project Overview

This is an Account Research Engine for Strategy (formerly MicroStrategy) sales engineers. It analyzes target companies and maps findings to GTM themes with buyer persona filtering.

## Tech Stack

- React 18 + Vite
- Tailwind CSS for styling
- Lucide React for icons
- Anthropic Claude API for AI analysis

## Key Files

- `src/components/AccountResearchApp.jsx` - Main app component (monolith for now)
- `src/config/themes.js` - GTM theme definitions (editable)
- `src/config/personas.js` - Buyer persona definitions (editable)

## How the App Works

1. User enters a company name/ticker
2. App calls Claude API with a structured prompt
3. Claude returns JSON with theme mappings
4. App displays results filtered by selected persona

## Current Issues to Be Aware Of

1. **JSON Parsing** - Claude sometimes returns text before JSON. The app has a regex to extract JSON but it's not bulletproof.
2. **Web Search Speed** - With web search enabled, requests can take 60-90+ seconds. Fast mode (no web search) is much faster.
3. **API Key Handling** - Currently the app runs in a Claude artifact which handles auth. For standalone deployment, you need to add API key handling.

## When Adding Features

### API Integration Pattern

```javascript
// Use this pattern for external APIs
const fetchData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
};
```

### Adding New Themes

Edit `src/config/themes.js`:
```javascript
{
  id: 'new-theme-id',
  name: 'Display Name',
  icon: 'LucideIconName',
  color: 'tailwindColor', // must add to colorClasses in AccountResearchApp.jsx
  description: 'Short description',
  signals: ['keyword1', 'keyword2']
}
```

Then update the prompt in `AccountResearchApp.jsx` to include the new theme.

### Adding New Personas

Edit `src/config/personas.js`:
```javascript
{
  id: 'new-persona',
  name: 'Short Name',
  title: 'Full Title',
  icon: '🎯',
  priorities: ['theme-id-1', 'theme-id-2', 'theme-id-3', 'theme-id-4'],
  cares: 'What they care about',
  avoids: 'What they want to avoid'
}
```

## Deployment Notes

For standalone deployment (outside Claude artifacts):

1. Add API key input or environment variable handling
2. Add CORS proxy if needed for SEC/News APIs
3. Consider rate limiting for team use

## Testing

Test with these companies:
- Dell Technologies (public, lots of data)
- Vizient (healthcare GPO)
- HEB (private grocery, limited data)
- E2Open (supply chain software)

## Priority Features to Add

See README.md for full roadmap. Top priorities:
1. PDF export
2. SEC EDGAR integration
3. Save/history functionality
4. Salesforce export format
