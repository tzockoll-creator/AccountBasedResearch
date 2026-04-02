# Contributing to Account Research Engine

Thanks for your interest in contributing! This guide will help you get set up and productive quickly.

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm** (comes with Node.js)
- **Anthropic API key** ([get one here](https://console.anthropic.com/))

## Setup

```bash
# Clone the repo
git clone https://github.com/tzockoll-creator/AccountBasedResearch.git
cd AccountBasedResearch

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key:
# VITE_ANTHROPIC_API_KEY=sk-ant-...

# Start the dev server
npm run dev
```

The app will open at `http://localhost:5173`.

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally with `npm run dev`.

3. Run the linter before committing:
   ```bash
   npm run lint
   ```

4. Build to check for production issues:
   ```bash
   npm run build
   ```

5. Commit with a clear message:
   ```bash
   git commit -m "Add your feature description"
   ```

6. Push and open a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Project Structure

```
src/
  components/       # React UI components
  config/           # Theme and persona definitions
  hooks/            # Custom React hooks
  services/         # API integrations (Claude, exporters)
  utils/            # Utilities (PDF export, competitive detection)
  App.jsx           # Main application entry point
  index.css         # Tailwind + custom styles
```

## Code Style

- **JavaScript with JSX** (React components use `.jsx`)
- **Tailwind CSS** for styling (no CSS modules or styled-components)
- **Functional components** with React hooks
- **lucide-react** for icons
- Keep components focused and under 200 lines where possible

## Adding New GTM Themes

Edit `src/config/themes.js`:

```javascript
{
  id: 'your-theme-id',
  name: 'Theme Display Name',
  icon: IconComponent,      // From lucide-react
  color: 'tailwind-color',  // e.g., 'rose', 'blue', 'emerald'
  description: 'What this theme means for prospects',
  signals: ['keyword1', 'keyword2', 'keyword3']
}
```

Then update the Claude prompt in `src/services/claudeApi.js` to include the new theme in the research instructions.

## Adding New Buyer Personas

Edit `src/config/personas.js`:

```javascript
{
  id: 'persona-id',
  name: 'Persona Name',
  title: 'Full Title',
  icon: 'emoji',
  priorities: ['theme-id-1', 'theme-id-2', 'theme-id-3', 'theme-id-4'],
  cares: 'What this persona cares about',
  avoids: 'What this persona wants to avoid'
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |

## Notes

- The app calls the Claude API directly from the browser using `anthropic-dangerous-direct-browser-access`. This is intentional for demo purposes but should use a backend proxy in production.
- SEC EDGAR API is free and requires no key (just a User-Agent header).
- API calls use exponential backoff for rate limiting.
