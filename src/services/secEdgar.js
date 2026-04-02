/**
 * SEC EDGAR Integration Service
 *
 * Fetches and parses SEC filings (10-K, 10-Q) for public companies using the
 * EDGAR full-text search API. Extracts key sections (Risk Factors, MD&A,
 * Business Description) for use in AI-powered research analysis.
 *
 * SEC EDGAR is free and requires only a descriptive User-Agent header.
 *
 * @see https://efts.sec.gov/LATEST/search-index
 */

/** @typedef {import('../types/index.js').SECFiling} SECFiling */
/** @typedef {import('../types/index.js').SECFilingData} SECFilingData */
/** @typedef {import('../types/index.js').SECSearchResult} SECSearchResult */

const SEC_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index';
const SEC_FILING_BASE = 'https://www.sec.gov/Archives/edgar/data';
const USER_AGENT = 'AccountBasedResearch research@example.com';

// How many characters to extract per section (to stay within Claude context limits)
const MAX_SECTION_CHARS = 5000;

/**
 * Search SEC EDGAR for recent 10-K and 10-Q filings for a company.
 *
 * @param {string} companyName - Company name to search for
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional abort signal
 * @returns {Promise<SECSearchResult>}
 */
export async function searchSECFilings(companyName, { signal } = {}) {
  try {
    const params = new URLSearchParams({
      q: `"${companyName}"`,
      dateRange: 'custom',
      startdt: '2023-01-01',
      enddt: '2025-12-31',
      forms: '10-K,10-Q',
    });

    const response = await fetch(`${SEC_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal,
    });

    if (!response.ok) {
      throw new Error(`SEC EDGAR search failed: ${response.status}`);
    }

    const data = await response.json();
    const hits = data?.hits?.hits || [];

    if (hits.length === 0) {
      return {
        found: false,
        companyName: null,
        cik: null,
        filings: [],
        error: null,
      };
    }

    // Extract filing metadata from search results
    const filingMetas = hits.slice(0, 4).map((hit) => {
      const source = hit._source || {};
      return {
        formType: source.forms || source.form_type || 'Unknown',
        filingDate: source.file_date || source.date_filed || '',
        companyName: source.display_names?.[0] || source.entity_name || companyName,
        cik: source.entity_id ? String(source.entity_id) : null,
        accessionNumber: source.file_num || null,
        filingUrl: buildFilingUrl(source),
      };
    });

    // Deduplicate: keep the most recent 10-K and most recent 10-Q
    const latest10K = filingMetas.find((f) => f.formType === '10-K');
    const latest10Q = filingMetas.find((f) => f.formType === '10-Q');
    const selectedFilings = [latest10K, latest10Q].filter(Boolean);

    if (selectedFilings.length === 0) {
      return {
        found: false,
        companyName: filingMetas[0]?.companyName || null,
        cik: filingMetas[0]?.cik || null,
        filings: [],
        error: null,
      };
    }

    // Fetch and parse each filing
    const filings = await Promise.all(
      selectedFilings.map((meta) => fetchAndParseFiling(meta, { signal }))
    );

    return {
      found: true,
      companyName: selectedFilings[0]?.companyName || companyName,
      cik: selectedFilings[0]?.cik || null,
      filings: filings.filter((f) => f !== null),
      error: null,
    };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error('SEC EDGAR search error:', err);
    return {
      found: false,
      companyName: null,
      cik: null,
      filings: [],
      error: err.message,
    };
  }
}

/**
 * Build the SEC filing URL from search result source data.
 */
function buildFilingUrl(source) {
  // The search API returns file_path or we construct from CIK + accession
  if (source.file_path) {
    return `https://www.sec.gov${source.file_path}`;
  }
  if (source.entity_id && source.adsh) {
    const cik = String(source.entity_id);
    const accession = source.adsh.replace(/-/g, '');
    return `${SEC_FILING_BASE}/${cik}/${accession}`;
  }
  return null;
}

/**
 * Fetch a filing's HTML and extract key sections.
 *
 * @param {SECFiling} filingMeta
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<SECFilingData | null>}
 */
async function fetchAndParseFiling(filingMeta, { signal } = {}) {
  if (!filingMeta.filingUrl) {
    return { filing: filingMeta, sections: [] };
  }

  try {
    const response = await fetch(filingMeta.filingUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal,
    });

    if (!response.ok) {
      console.warn(`Failed to fetch filing: ${filingMeta.filingUrl} (${response.status})`);
      return { filing: filingMeta, sections: [] };
    }

    const html = await response.text();
    const sections = extractSections(html);

    return {
      filing: filingMeta,
      sections,
    };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Failed to parse filing:', err.message);
    return { filing: filingMeta, sections: [] };
  }
}

/**
 * Extract key sections from SEC filing HTML.
 *
 * SEC filings typically use <b>, <h>, or specific patterns to delineate sections.
 * We look for: Risk Factors, MD&A, and Business Description.
 */
function extractSections(html) {
  const sections = [];

  // Strip HTML tags helper - preserves text content
  const stripTags = (text) =>
    text
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#?\w+;/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  // Section patterns: [display name, regex to find section start]
  const sectionPatterns = [
    {
      title: 'Risk Factors',
      startPattern: /(?:Item\s*1A[\.\s\-—]*Risk\s*Factors|<b[^>]*>\s*Risk\s*Factors\s*<\/b>)/i,
      endPattern: /(?:Item\s*1B|Item\s*2[\.\s]|UNRESOLVED\s*STAFF\s*COMMENTS)/i,
    },
    {
      title: "Management's Discussion and Analysis (MD&A)",
      startPattern: /(?:Item\s*7[\.\s\-—]*Management['']?s?\s*Discussion|<b[^>]*>\s*Management['']?s?\s*Discussion)/i,
      endPattern: /(?:Item\s*7A|Item\s*8[\.\s]|QUANTITATIVE\s*AND\s*QUALITATIVE)/i,
    },
    {
      title: 'Business Description',
      startPattern: /(?:Item\s*1[\.\s\-—]*Business(?!\s*Risk)|<b[^>]*>\s*Business\s*<\/b>)/i,
      endPattern: /(?:Item\s*1A|Item\s*2[\.\s]|RISK\s*FACTORS)/i,
    },
  ];

  for (const { title, startPattern, endPattern } of sectionPatterns) {
    const startMatch = html.match(startPattern);
    if (!startMatch) continue;

    const startIdx = startMatch.index + startMatch[0].length;
    const remaining = html.slice(startIdx);
    const endMatch = remaining.match(endPattern);
    const endIdx = endMatch ? endMatch.index : Math.min(remaining.length, MAX_SECTION_CHARS * 3);

    const sectionHtml = remaining.slice(0, endIdx);
    const text = stripTags(sectionHtml);

    if (text.length > 50) {
      sections.push({
        title,
        content: text.slice(0, MAX_SECTION_CHARS),
      });
    }
  }

  return sections;
}

/**
 * Build a context string from SEC filings for inclusion in Claude prompts.
 *
 * @param {SECSearchResult} secResult
 * @returns {string} Formatted text to append to the research prompt
 */
export function buildSECContext(secResult) {
  if (!secResult?.found || secResult.filings.length === 0) {
    return '';
  }

  const parts = ['The following SEC filing excerpts are available for additional analysis:\n'];

  for (const filingData of secResult.filings) {
    const { filing, sections } = filingData;
    if (sections.length === 0) continue;

    parts.push(`\n--- ${filing.formType} Filing (${filing.filingDate}) ---`);

    for (const section of sections) {
      parts.push(`\n[${section.title}]\n${section.content}\n`);
    }
  }

  if (parts.length <= 1) return '';

  return parts.join('\n');
}
