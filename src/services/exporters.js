/**
 * Export utilities for leads data
 */

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV content from leads array
 */
export function generateLeadsCSV(leads, companyName) {
  const headers = [
    'Name',
    'Title',
    'Company',
    'Source',
    'Source URL',
    'Content',
    'Pain Points',
    'Relevance Score',
    'Outreach Angle'
  ];

  const rows = leads.map(lead => [
    csvEscape(lead.name),
    csvEscape(lead.title),
    csvEscape(lead.company || companyName),
    csvEscape(lead.source),
    csvEscape(lead.sourceUrl),
    csvEscape(lead.content),
    csvEscape((lead.detectedPainPoints || []).join('; ')),
    csvEscape(lead.relevanceScore),
    csvEscape(lead.outreachAngle)
  ]);

  const csvContent = [
    headers.map(csvEscape).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for filenames
 */
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Export leads to CSV file download
 */
export function exportLeadsToCSV(leads, companyName) {
  const csv = generateLeadsCSV(leads, companyName);
  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const filename = `${safeName}-leads-${formatDate()}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Copy all outreach angles to clipboard
 */
export async function copyOutreachAngles(leads) {
  const angles = leads
    .filter(l => l.outreachAngle)
    .map((l, i) => `${i + 1}. [${l.name} - ${l.title}]\n   ${l.outreachAngle}`)
    .join('\n\n');

  await navigator.clipboard.writeText(angles);
  return angles;
}
