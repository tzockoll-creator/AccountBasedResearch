import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Save, RotateCcw, Package } from 'lucide-react';
import { STRATEGY_PRESET } from '../config/defaultProduct';
import { STORAGE_KEYS } from '../config/appConfig';
import type { ProductConfig as ProductConfigType } from '../types';

interface ProductConfigProps {
  productConfig: ProductConfigType;
  onConfigChange: (config: ProductConfigType) => void;
}

export default function ProductConfig({ productConfig, onConfigChange }: ProductConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localName, setLocalName] = useState(productConfig.productName);
  const [localCapabilities, setLocalCapabilities] = useState(
    productConfig.capabilities.join('\n')
  );
  const [localPainPoints, setLocalPainPoints] = useState(
    productConfig.painPoints.join('\n')
  );
  const [localRoles, setLocalRoles] = useState(
    productConfig.targetRoles.join('\n')
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const config: ProductConfigType = {
      productName: localName.trim(),
      capabilities: localCapabilities.split('\n').map(s => s.trim()).filter(Boolean),
      painPoints: localPainPoints.split('\n').map(s => s.trim()).filter(Boolean),
      targetRoles: localRoles.split('\n').map(s => s.trim()).filter(Boolean)
    };
    onConfigChange(config);
    try {
      localStorage.setItem(STORAGE_KEYS.productConfig, JSON.stringify(config));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoadPreset = () => {
    setLocalName(STRATEGY_PRESET.productName);
    setLocalCapabilities(STRATEGY_PRESET.capabilities.join('\n'));
    setLocalPainPoints(STRATEGY_PRESET.painPoints.join('\n'));
    setLocalRoles(STRATEGY_PRESET.targetRoles.join('\n'));
    onConfigChange(STRATEGY_PRESET);
  };

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-violet-400" />
          <span className="font-medium text-sm">
            Product Configuration
          </span>
          {productConfig.productName && (
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
              {productConfig.productName}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400">
            Configure the product you're selling. Everything downstream — company research, lead finding, outreach angles — uses this as the lens.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              placeholder="e.g., Strategy, Snowflake, Databricks"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Key Capabilities (one per line)
            </label>
            <textarea
              value={localCapabilities}
              onChange={e => setLocalCapabilities(e.target.value)}
              rows={4}
              placeholder={'Governed AI Analytics\nSemantic Layer\nSelf-Service BI'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Pain Points to Detect (one per line)
            </label>
            <textarea
              value={localPainPoints}
              onChange={e => setLocalPainPoints(e.target.value)}
              rows={5}
              placeholder={'inconsistent metrics across teams\nBI tool sprawl\nAI hallucinations from ungoverned data'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Target Roles (one per line, priority order)
            </label>
            <textarea
              value={localRoles}
              onChange={e => setLocalRoles(e.target.value)}
              rows={3}
              placeholder={'CDO / CTO / CIO\nDirector of Data\nData Architect'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Saved!' : 'Save Config'}
            </button>
            <button
              onClick={handleLoadPreset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Strategy Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
