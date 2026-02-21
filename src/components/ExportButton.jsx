import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { exportLeadsToCSV, copyOutreachAngles } from '../services/exporters';

export default function ExportButton({ leads, companyName }) {
  const [copied, setCopied] = useState(false);

  if (!leads || leads.length === 0) return null;

  const handleExportCSV = () => {
    exportLeadsToCSV(leads, companyName);
  };

  const handleCopyAngles = async () => {
    try {
      await copyOutreachAngles(leads);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard failed
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors"
      >
        <Download className="w-3 h-3" />
        Export CSV
      </button>
      <button
        onClick={handleCopyAngles}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy Outreach Angles
          </>
        )}
      </button>
    </div>
  );
}
