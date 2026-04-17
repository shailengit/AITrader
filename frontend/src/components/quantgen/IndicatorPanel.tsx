import { useState } from 'react';
import { LineChart, Eye, EyeOff } from 'lucide-react';

interface Indicator {
  name: string;
  type: string;
  params: Record<string, string | number>;
}

interface IndicatorPanelProps {
  indicators: Indicator[];
  selectedIndicators: Record<string, boolean>;
  onToggle: (indicatorName: string) => void;
}

export function IndicatorPanel({
  indicators,
  selectedIndicators,
  onToggle,
}: IndicatorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!indicators || indicators.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500 mb-2 hover:text-zinc-300 transition-colors"
      >
        <LineChart size={14} />
        Technical Indicators
        <span className="ml-auto">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="flex flex-wrap gap-2">
          {indicators.map((indicator, index) => {
            const isSelected = selectedIndicators[indicator.name] !== false;
            // Generate a unique color based on index
            const hue = (index * 137.508) % 360;
            const color = `hsl(${hue}, 70%, 50%)`;

            return (
              <button
                key={indicator.name}
                onClick={() => onToggle(indicator.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800/50'
                }`}
              >
                {isSelected ? (
                  <Eye size={12} className="text-emerald-400" />
                ) : (
                  <EyeOff size={12} />
                )}
                <span>{indicator.name}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
