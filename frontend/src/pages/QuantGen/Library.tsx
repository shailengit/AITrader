import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  Trash2,
  Edit3,
  ArrowRight,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { NavLink } from 'react-router-dom';

interface Strategy {
  id: string;
  name: string;
  description: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'backtested' | 'optimized' | 'live';
  metrics?: {
    totalReturn?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    winRate?: number;
    trades?: number;
  };
}

type SortField = 'name' | 'updatedAt' | 'status' | 'return';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'draft' | 'backtested' | 'optimized' | 'live';

export default function Library() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load strategies from localStorage
  useEffect(() => {
    const loadStrategies = () => {
      try {
        const saved = localStorage.getItem('builderState');
        if (saved) {
          const state = JSON.parse(saved);
          if (state.strategies && Array.isArray(state.strategies)) {
            setStrategies(state.strategies);
          }
        }
      } catch (e) {
        console.error('Failed to load strategies:', e);
      }
      setIsLoading(false);
    };
    loadStrategies();
  }, []);

  // Delete strategy
  const deleteStrategy = (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;

    const newStrategies = strategies.filter((s) => s.id !== id);
    setStrategies(newStrategies);

    // Update localStorage
    try {
      const saved = localStorage.getItem('builderState');
      if (saved) {
        const state = JSON.parse(saved);
        state.strategies = newStrategies;
        localStorage.setItem('builderState', JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to save strategies:', e);
    }
  };

  // Load strategy into builder
  const loadStrategy = (strategy: Strategy) => {
    // Store the strategy data for the builder to load
    sessionStorage.setItem('loadStrategy', JSON.stringify(strategy));
    window.location.href = '/quantgen/build';
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'return':
          comparison =
            (a.metrics?.totalReturn || 0) - (b.metrics?.totalReturn || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getStatusIcon = (status: Strategy['status']) => {
    switch (status) {
      case 'draft':
        return <AlertCircle size={14} className="text-zinc-400" />;
      case 'backtested':
        return <Clock size={14} className="text-blue-400" />;
      case 'optimized':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'live':
        return <TrendingUp size={14} className="text-purple-400" />;
    }
  };

  const getStatusColor = (status: Strategy['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'backtested':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'optimized':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'live':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative min-h-full">
      <div
        className="relative z-10"
        style={{ paddingTop: '24px', paddingBottom: '96px', paddingLeft: '80px', paddingRight: '80px' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Strategy Library</h1>
              <p className="text-zinc-400 mt-1">Manage and organize your trading strategies</p>
            </div>
            <NavLink
              to="/quantgen/build"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors"
            >
              <Plus size={16} />
              New Strategy
            </NavLink>
          </div>

          {/* Filters */}
          <Card className="mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-zinc-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="backtested">Backtested</option>
                  <option value="optimized">Optimized</option>
                  <option value="live">Live</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Sort Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60">
            <button
              onClick={() => toggleSort('name')}
              className="col-span-3 flex items-center gap-1 hover:text-zinc-300"
            >
              Strategy Name
              {sortField === 'name' &&
                (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <button
              onClick={() => toggleSort('status')}
              className="col-span-2 flex items-center gap-1 hover:text-zinc-300"
            >
              Status
              {sortField === 'status' &&
                (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <button
              onClick={() => toggleSort('return')}
              className="col-span-2 flex items-center gap-1 hover:text-zinc-300 justify-end"
            >
              Return
              {sortField === 'return' &&
                (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <div className="col-span-2 text-right">Metrics</div>
            <button
              onClick={() => toggleSort('updatedAt')}
              className="col-span-2 flex items-center gap-1 hover:text-zinc-300 justify-end"
            >
              Updated
              {sortField === 'updatedAt' &&
                (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </button>
            <div className="col-span-1"></div>
          </div>

          {/* Strategy List */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="text-center py-12 text-zinc-500">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
                  Loading strategies...
                </div>
              ) : filteredStrategies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900/50 flex items-center justify-center">
                    <Search size={24} className="text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                    {strategies.length === 0 ? 'No Strategies Yet' : 'No Results Found'}
                  </h3>
                  <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                    {strategies.length === 0
                      ? 'Create your first trading strategy to get started with QuantGen.'
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                  {strategies.length === 0 && (
                    <NavLink
                      to="/quantgen/build"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors"
                    >
                      <Plus size={16} />
                      Create Strategy
                    </NavLink>
                  )}
                </motion.div>
              ) : (
                filteredStrategies.map((strategy) => (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <Card
                      className={`group cursor-pointer overflow-hidden ${
                        expandedId === strategy.id ? 'border-emerald-500/30' : ''
                      }`}
                    >
                      <div
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                        onClick={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)}
                      >
                        <div className="col-span-3">
                          <h3 className="font-semibold text-zinc-200 truncate">{strategy.name}</h3>
                          <p className="text-sm text-zinc-500 truncate">{strategy.description}</p>
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              strategy.status
                            )}`}
                          >
                            {getStatusIcon(strategy.status)}
                            {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          {strategy.metrics?.totalReturn !== undefined ? (
                            <span
                              className={`font-mono font-semibold ${
                                strategy.metrics.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-500'
                              }`}
                            >
                              {strategy.metrics.totalReturn.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          {strategy.metrics ? (
                            <div className="flex flex-col gap-1 text-xs">
                              {strategy.metrics.sharpeRatio !== undefined && (
                                <span className="text-zinc-400">
                                  SR: {strategy.metrics.sharpeRatio.toFixed(2)}
                                </span>
                              )}
                              {strategy.metrics.winRate !== undefined && (
                                <span className="text-zinc-400">
                                  WR: {strategy.metrics.winRate.toFixed(1)}%
                                </span>
                              )}
                              {strategy.metrics.maxDrawdown !== undefined && (
                                <span className="text-rose-400">
                                  DD: {strategy.metrics.maxDrawdown.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right text-sm text-zinc-500">
                          <div className="flex items-center justify-end gap-1">
                            <Calendar size={12} />
                            {formatDate(strategy.updatedAt)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadStrategy(strategy);
                            }}
                            className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStrategy(strategy.id);
                            }}
                            className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === strategy.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-zinc-800/60 bg-zinc-900/30"
                          >
                            <div className="px-6 py-4 space-y-4">
                              {strategy.description && (
                                <div>
                                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                                    Description
                                  </h4>
                                  <p className="text-sm text-zinc-300">{strategy.description}</p>
                                </div>
                              )}
                              {strategy.metrics && (
                                <div>
                                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Performance Metrics
                                  </h4>
                                  <div className="grid grid-cols-4 gap-4">
                                    {strategy.metrics.totalReturn !== undefined && (
                                      <div className="bg-zinc-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500">Total Return</div>
                                        <div
                                          className={`font-mono font-semibold ${
                                            strategy.metrics.totalReturn >= 0
                                              ? 'text-emerald-400'
                                              : 'text-rose-500'
                                          }`}
                                        >
                                          {strategy.metrics.totalReturn.toFixed(2)}%
                                        </div>
                                      </div>
                                    )}
                                    {strategy.metrics.sharpeRatio !== undefined && (
                                      <div className="bg-zinc-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500">Sharpe Ratio</div>
                                        <div className="font-mono font-semibold text-zinc-300">
                                          {strategy.metrics.sharpeRatio.toFixed(2)}
                                        </div>
                                      </div>
                                    )}
                                    {strategy.metrics.maxDrawdown !== undefined && (
                                      <div className="bg-zinc-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500">Max Drawdown</div>
                                        <div className="font-mono font-semibold text-rose-400">
                                          {strategy.metrics.maxDrawdown.toFixed(2)}%
                                        </div>
                                      </div>
                                    )}
                                    {strategy.metrics.winRate !== undefined && (
                                      <div className="bg-zinc-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-zinc-500">Win Rate</div>
                                        <div className="font-mono font-semibold text-zinc-300">
                                          {strategy.metrics.winRate.toFixed(1)}%
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {strategy.code && (
                                <div>
                                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Code Preview
                                  </h4>
                                  <pre className="p-3 bg-zinc-950 rounded-lg overflow-x-auto text-xs text-zinc-400 font-mono max-h-32">
                                    {strategy.code.slice(0, 500)}...
                                  </pre>
                                </div>
                              )}
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={() => loadStrategy(strategy)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors"
                                >
                                  <Edit3 size={14} />
                                  Edit Strategy
                                </button>
                                <NavLink
                                  to="/quantgen/dashboard"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
                                >
                                  View Results
                                  <ArrowRight size={14} />
                                </NavLink>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
