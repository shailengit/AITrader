import { useState } from 'react';
import { Settings, Plus, Trash2, Microscope } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ParamRange {
  name: string;
  start: number;
  stop: number;
  step: number;
}

interface WFOConfig {
  type: 'rolling' | 'expanding';
  windows: number;
  ratio: number;
  splitMethod: 'ratio' | 'fixed';
  train_days: number;
  test_days: number;
  start_date: string;
  end_date: string;
}

interface OptimizationConfigData {
  mode: 'simple' | 'wfo' | 'true_wfo';
  metric: 'total_return' | 'sharpe' | 'sortino' | 'max_dd';
  wfo: WFOConfig;
}

interface OptimizationConfigProps {
  config: OptimizationConfigData;
  setConfig: (config: OptimizationConfigData) => void;
  params: ParamRange[];
  setParams: (params: ParamRange[]) => void;
}

export default function OptimizationConfig({
  config,
  setConfig,
  params,
  setParams,
}: OptimizationConfigProps) {
  const { isDarkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  // Theme-aware colors
  const colors = {
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#A1A1AA' : '#6e6e73',
    surface: isDarkMode ? '#27272A' : '#ffffff',
    inputBg: isDarkMode ? '#18181B' : '#ffffff',
    border: isDarkMode ? '#3F3F46' : '#d2d2d7',
    headerBg: isDarkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f7',
    paramBg: isDarkMode ? 'rgba(0,0,0,0.3)' : '#f5f5f7',
  };

  const addParam = () => {
    setParams([
      ...params,
      { name: '', start: 10, stop: 50, step: 10 },
    ]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: keyof ParamRange, value: any) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  return (
    <div style={{ backgroundColor: colors.surface }}>
      <div
        className="h-12 flex items-center px-4 justify-between cursor-pointer"
        style={{ backgroundColor: colors.headerBg, borderBottom: `1px solid ${colors.border}` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: colors.muted }}>
          <Microscope size={14} />
          Optimization Config
        </span>
        <span className="text-xs" style={{ color: colors.muted }}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: colors.muted }}>
                Optimization Mode
              </label>
              <select
                value={config.mode}
                onChange={(e) =>
                  setConfig({ ...config, mode: e.target.value as 'simple' | 'wfo' | 'true_wfo' })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
              >
                <option value="simple">Simple (Grid Search)</option>
                <option value="wfo">Walk-Forward (Historical)</option>
                <option value="true_wfo">True Walk-Forward</option>
              </select>
              {config.mode === 'true_wfo' && (
                <p className="text-xs mt-1.5" style={{ color: '#10b981' }}>
                  True Walk-Forward: Optimizes on training window, trades single next day, maintains positions across windows.
                </p>
              )}
              {(config.mode === 'wfo' || config.mode === 'true_wfo') &&
                config.wfo.splitMethod === 'ratio' &&
                (config.wfo.train_days !== 252 || config.wfo.test_days !== 63) && (
                <p className="text-xs mt-1.5" style={{ color: '#f43f5e' }}>
                  Note: Train/Test days only apply when Split Method is set to "Fixed Days".
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: colors.muted }}>
                Optimization Metric
              </label>
              <select
                value={config.metric}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    metric: e.target.value as OptimizationConfigData['metric'],
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
              >
                <option value="total_return">Total Return</option>
                <option value="sharpe">Sharpe Ratio</option>
                <option value="sortino">Sortino Ratio</option>
                <option value="max_dd">Max Drawdown</option>
              </select>
            </div>
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase flex items-center gap-1" style={{ color: colors.muted }}>
                <Settings size={12} />
                Parameters to Optimize
              </label>
              <button
                onClick={addParam}
                className="text-xs flex items-center gap-1 hover:text-emerald-400 transition-colors"
                style={{ color: '#10b981' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {params.length === 0 && (
                <p className="text-xs italic" style={{ color: colors.muted }}>
                  No parameters configured. Add parameters from your code (e.g., sma_window, rsi_period).
                </p>
              )}

              {params.map((param, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-2 items-center p-2 rounded-lg border"
                  style={{ backgroundColor: colors.paramBg, borderColor: colors.border }}
                >
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParam(index, 'name', e.target.value)}
                    placeholder="param_name"
                    className="border rounded px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  />
                  <input
                    type="number"
                    value={param.start}
                    onChange={(e) => updateParam(index, 'start', parseFloat(e.target.value))}
                    placeholder="Start"
                    className="border rounded px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  />
                  <input
                    type="number"
                    value={param.stop}
                    onChange={(e) => updateParam(index, 'stop', parseFloat(e.target.value))}
                    placeholder="Stop"
                    className="border rounded px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  />
                  <input
                    type="number"
                    value={param.step}
                    onChange={(e) => updateParam(index, 'step', parseFloat(e.target.value))}
                    placeholder="Step"
                    className="border rounded px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  />
                  <button
                    onClick={() => removeParam(index)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: '#f43f5e' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* WFO Settings */}
          {(config.mode === 'wfo' || config.mode === 'true_wfo') && (
            <div className="pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <label className="text-xs font-semibold uppercase mb-3 block" style={{ color: colors.muted }}>
                Walk-Forward Settings
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.muted }}>Window Type</label>
                  <select
                    value={config.wfo.type}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        wfo: { ...config.wfo, type: e.target.value as WFOConfig['type'] },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  >
                    <option value="rolling">Rolling</option>
                    <option value="expanding">Expanding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.muted }}>Split Method</label>
                  <select
                    value={config.wfo.splitMethod}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        wfo: { ...config.wfo, splitMethod: e.target.value as WFOConfig['splitMethod'] },
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                  >
                    <option value="ratio">Ratio</option>
                    <option value="fixed">Fixed Days</option>
                  </select>
                </div>

                {config.wfo.splitMethod === 'fixed' && (
                  <>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.muted }}>Training Days</label>
                      <input
                        type="number"
                        min="14"
                        value={config.wfo.train_days}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            wfo: { ...config.wfo, train_days: parseInt(e.target.value) },
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.muted }}>Testing Days</label>
                      <input
                        type="number"
                        min="1"
                        value={config.wfo.test_days}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            wfo: { ...config.wfo, test_days: parseInt(e.target.value) },
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                      />
                    </div>
                  </>
                )}

                {config.wfo.splitMethod === 'ratio' && (
                  <>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.muted }}>Train/Test Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="0.9"
                        value={config.wfo.ratio}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            wfo: { ...config.wfo, ratio: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: colors.muted }}>Number of Windows</label>
                      <input
                        type="number"
                        min="1"
                        value={config.wfo.windows}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            wfo: { ...config.wfo, windows: parseInt(e.target.value) },
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        style={{ backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Info message for single-day testing */}
              {config.wfo.splitMethod === 'fixed' && config.wfo.test_days === 1 && (
                <p className="text-xs mt-2" style={{ color: '#f59e0b' }}>
                  Single-day testing mode: Each window will test on 1 day and advance by 1 day.
                  This creates maximum possible windows based on your date range.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
