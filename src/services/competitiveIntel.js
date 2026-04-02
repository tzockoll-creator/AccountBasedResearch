/**
 * Competitive Install Detection Service
 *
 * Uses Claude with web search to detect which BI/analytics tools
 * a target company uses, based on job postings, case studies,
 * press releases, and partnership announcements.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const TARGET_TOOLS = [
  'Tableau',
  'Power BI',
  'Looker',
  'Qlik',
  'Databricks',
  'Snowflake',
  'Domo',
  'ThoughtSpot',
  'SAP Analytics Cloud',
  'AWS QuickSight',
];

/**
 * Detect competitive BI/analytics tools at a company using Claude web search
 */
export async function detectCompetitiveInstalls(companyName, { signal } = {}) {
  const toolList = TARGET_TOOLS.join(', ');

  const prompt = `You are a competitive intelligence analyst. Research "${companyName}" to determine which BI and analytics tools they currently use.

Target tools to detect: ${toolList}

Search for evidence across these sources:
1. **Job postings** — Look for "${companyName}" job listings mentioning any of these tools
2. **Case studies / customer stories** — Check if any of these vendors list "${companyName}" as a customer
3. **Press releases / partnership announcements** — Look for announcements about "${companyName}" adopting or partnering with these tools
4. **LinkedIn profiles** — Look for employees at "${companyName}" who list these tools in their profiles or posts

For each tool you find evidence of, provide:
- The tool name (exactly as listed above)
- Confidence level: "High" (multiple strong signals), "Medium" (some evidence), or "Low" (weak or indirect signal)
- A short evidence snippet (1-2 sentences describing where/how you found the evidence)
- Source URL if available (null if not)

CRITICAL INSTRUCTIONS:
- Only report tools you actually find evidence for — do NOT guess or assume
- Your response must be ONLY valid JSON — no text before or after
- Do NOT include any explanation, preamble, or commentary
- Start your response with { and end with }

JSON format:
{
  "companyName": "${companyName}",
  "detectedTools": [
    {
      "toolName": "Tableau",
      "confidence": "High",
      "evidence": "Found 12 job postings requiring Tableau experience, including Senior Data Analyst and BI Developer roles",
      "sourceUrl": "https://example.com/job-posting"
    }
  ],
  "summary": "Brief 1-2 sentence summary of the competitive landscape"
}

If no tools are detected, return:
{
  "companyName": "${companyName}",
  "detectedTools": [],
  "summary": "No competitive BI/analytics tools detected for this company"
}

Remember: Output ONLY the JSON object, nothing else.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

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
        max_tokens: 2048,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
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

    // Extract text content
    let textContent = data.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('');

    // Clean markdown code blocks
    textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in competitive intel response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      scanDate: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Competitive intel scan timed out. Try again later.');
    }
    throw err;
  }
}
