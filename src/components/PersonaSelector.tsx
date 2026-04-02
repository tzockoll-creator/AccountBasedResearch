import React from 'react';
import {
  Monitor, DollarSign, BarChart3, Settings, User, Shield
} from 'lucide-react';
import { PERSONAS } from '../config/personas';
import type { Persona } from '../types';

// Map persona IDs to lucide-react icons
const PERSONA_ICONS: Record<string, React.ElementType> = {
  cio: Monitor,
  cfo: DollarSign,
  cdo: BarChart3,
  coo: Settings,
  business: User,
  ciso: Shield,
};

interface PersonaSelectorProps {
  selected: Persona | null;
  onSelect: (persona: Persona | null) => void;
}

/**
 * Persona selector with lucide-react icons and ring highlight on selection.
 */
export default function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  return (
    <div className="mb-6">
      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">
        Buyer Persona
      </p>
      <div className="flex flex-wrap gap-2">
        {/* All themes button */}
        <button
          onClick={() => onSelect(null)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${selected === null
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
            }
          `}
        >
          All
        </button>

        {PERSONAS.map(persona => {
          const Icon = PERSONA_ICONS[persona.id] || User;
          const isSelected = selected?.id === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => onSelect(isSelected ? null : persona)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 hover:-translate-y-0.5 hover:shadow-md'
                }
              `}
              title={persona.title}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{persona.name}</span>
              <span className="sm:hidden">{persona.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Persona detail card */}
      {selected && (
        <div className="mt-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const Icon = PERSONA_ICONS[selected.id] || User;
              return <Icon className="w-5 h-5 text-indigo-400" />;
            })()}
            <div>
              <h4 className="text-sm font-semibold text-white">{selected.name}</h4>
              <p className="text-xs text-slate-500">{selected.title}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-emerald-400 font-medium">Cares about:</span>
              <p className="text-slate-400 mt-0.5">{selected.cares}</p>
            </div>
            <div>
              <span className="text-rose-400 font-medium">Wants to avoid:</span>
              <p className="text-slate-400 mt-0.5">{selected.avoids}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
