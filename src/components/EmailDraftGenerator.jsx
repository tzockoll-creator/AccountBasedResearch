import React, { useState } from 'react';
import { Mail, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'cold',
    label: 'Cold Outreach',
    description: 'Introduction + key finding + meeting request',
  },
  {
    id: 'followup',
    label: 'Meeting Follow-Up',
    description: 'Reference to meeting + insights + next steps',
  },
  {
    id: 'executive',
    label: 'Executive Briefing',
    description: 'High-level strategic findings for C-suite',
  },
];

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildEmailPrompt(template, research, persona, competitiveIntel) {
  const templateInstructions = {
    cold: `Write a cold outreach email. Structure:
- Brief introduction of yourself (sales rep at Strategy, formerly MicroStrategy)
- Reference ONE specific finding from the research that would grab their attention
- Explain briefly how Strategy can help with that specific challenge
- End with a clear call to action requesting a 20-minute meeting
- Keep it under 150 words. Be direct, not salesy.`,
    followup: `Write a meeting follow-up email. Structure:
- Thank them for their time in a recent meeting
- Reference 2-3 key insights from the research that are relevant to topics discussed
- Propose specific next steps (demo, technical deep-dive, or POC)
- Keep it under 200 words. Be professional and action-oriented.`,
    executive: `Write an executive briefing email for C-suite. Structure:
- Open with a high-level strategic observation about their industry or company
- Present 2-3 key findings that tie to business outcomes (revenue, risk, efficiency)
- Frame Strategy as a strategic enabler, not just a tool
- End with an offer to share a full executive briefing deck
- Keep it under 200 words. Be concise, strategic, and avoid technical jargon.`,
  };

  // Gather research context
  const themes = research.themeFindings || {};
  const topThemes = Object.entries(themes)
    .filter(([, f]) => f && f.relevanceScore >= 50)
    .sort(([, a], [, b]) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  const themeContext = topThemes
    .map(([id, f]) => {
      const evidence = (f.evidence || []).map((e) => `${e.source}: ${e.text}`).join('; ');
      const points = (f.talkingPoints || []).join('; ');
      return `Theme: ${id} (score: ${f.relevanceScore})\n  Evidence: ${evidence}\n  Talking points: ${points}`;
    })
    .join('\n\n');

  const competitiveContext = competitiveIntel?.detectedTools?.length
    ? `Competitive tools detected: ${competitiveIntel.detectedTools.map((t) => `${t.toolName} (${t.confidence} confidence)`).join(', ')}`
    : '';

  const personaContext = persona
    ? `Target persona: ${persona.name} (${persona.title})\nCares about: ${persona.cares}\nWants to avoid: ${persona.avoids}`
    : 'Target persona: General / All audiences';

  return `You are a sales copywriter for Strategy (formerly MicroStrategy), an enterprise analytics and BI platform.

Generate a personalized outreach email for ${research.companyName}.

${templateInstructions[template]}

CONTEXT FROM RESEARCH:
Company: ${research.companyName} (${research.industry})
Summary: ${research.summary}

Key Insights:
${(research.keyInsights || []).map((i) => `- ${i}`).join('\n')}

Top Relevant Themes:
${themeContext || 'No strong themes detected'}

${competitiveContext}

${research.competitiveContext ? `Known competitive context: ${research.competitiveContext}` : ''}

${personaContext}

IMPORTANT INSTRUCTIONS:
- Reference SPECIFIC findings from the research (e.g., "I noticed your 10-K mentioned AI governance challenges..." or "Given your investment in Snowflake...")
- Match the tone to the target persona
- Do NOT use generic platitudes or filler
- Output ONLY the email text (Subject line + body), nothing else
- Format: First line is "Subject: ..." then a blank line, then the email body
- Use the sender name "Alex" as a placeholder`;
}

export default function EmailDraftGenerator({ research, persona, competitiveIntel }) {
  const [selectedTemplate, setSelectedTemplate] = useState('cold');
  const [emailDraft, setEmailDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    const prompt = buildEmailPrompt(selectedTemplate, research, persona, competitiveIntel);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      }

      const textContent = data.content
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('');

      setEmailDraft(textContent.trim());
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setGenerateError('Email generation timed out. Try again.');
      } else {
        setGenerateError(`Failed to generate email: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = emailDraft;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-xl p-6 border border-violet-500/30">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-violet-500/20 rounded-lg">
          <Mail className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Email Draft Generator</h3>
          <p className="text-xs text-slate-400">Generate personalized outreach based on research findings</p>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex gap-2 mb-5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              selectedTemplate === t.id
                ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="text-center">
              <div>{t.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{t.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Generate Button */}
      {!emailDraft && !isGenerating && (
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg font-semibold text-sm hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          <Mail className="w-4 h-4" />
          Draft Outreach Email
        </button>
      )}

      {/* Loading */}
      {isGenerating && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400 mr-3" />
          <span className="text-sm text-slate-400">Generating personalized email draft...</span>
        </div>
      )}

      {/* Error */}
      {generateError && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-300">{generateError}</p>
        </div>
      )}

      {/* Email Draft */}
      {emailDraft && (
        <div className="space-y-3">
          <textarea
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            className="w-full h-64 bg-slate-900/70 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 leading-relaxed resize-y focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                  : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Email copied to clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-600 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Persona context indicator */}
      {persona && (
        <p className="text-xs text-slate-500 mt-4">
          Tailored for: <span className="text-slate-400">{persona.icon} {persona.name}</span>
        </p>
      )}
    </div>
  );
}
