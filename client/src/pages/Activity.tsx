import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, CheckCircle2, XCircle, Loader2,
  Play, Clock, AlertTriangle, ChevronRight, X, Eye, Zap,
  ArrowLeft, Copy, Download, Calendar
} from 'lucide-react';
import { runsApi, workflowsApi } from '../api';

export default function Activity() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: () => runsApi.list({ limit: 100 }),
  });

  const { data: workflowsData } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const runs = runsData?.data?.runs || [];
  const workflows = workflowsData?.data?.workflows || [];

  const filteredRuns = runs.filter((run: any) => {
    if (statusFilter !== 'all' && run.status !== statusFilter) return false;
    if (workflowFilter !== 'all' && run.workflowId !== workflowFilter) return false;
    if (searchQuery && !run.workflow?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: runs.length,
    success: runs.filter((r: any) => r.status === 'success').length,
    failed: runs.filter((r: any) => r.status === 'failed').length,
    running: runs.filter((r: any) => r.status === 'running').length,
    successRate: runs.length > 0 ? Math.round((runs.filter((r: any) => r.status === 'success').length / runs.length) * 100) : 0,
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity</h1>
          <p className="text-slate-400">Monitor your workflow executions</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['runs'] })}
          className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-400">Total Runs</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-400">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.successRate}%</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-400">Success</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.success}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-400">Failed</p>
          <p className="text-2xl font-bold text-rose-400">{stats.failed}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-400">Running</p>
          <p className="text-2xl font-bold text-amber-400">{stats.running}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by workflow name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
            showFilters ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 bg-slate-900/30 rounded-xl border border-white/5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="all">All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Workflow</label>
                <select
                  value={workflowFilter}
                  onChange={(e) => setWorkflowFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="all">All Workflows</option>
                  {workflows.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              {(statusFilter !== 'all' || workflowFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setStatusFilter('all'); setWorkflowFilter('all'); setSearchQuery(''); }}
                  className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors self-end"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Runs List */}
      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 overflow-hidden">
        {runsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 mb-2">No runs found</p>
            <p className="text-sm text-slate-500">
              {runs.length === 0 ? 'Workflows will appear here once executed' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRuns.map((run: any, index: number) => {
              const runData = typeof run.triggerData === 'string' ? JSON.parse(run.triggerData) : run.triggerData;
              const stepsData = typeof run.steps === 'string' ? JSON.parse(run.steps) : run.steps;

              return (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedRun(run)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        run.status === 'success' ? 'bg-emerald-500/10' :
                        run.status === 'failed' ? 'bg-rose-500/10' :
                        'bg-amber-500/10'
                      }`}>
                        {run.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : run.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{run.workflow?.name || 'Workflow Run'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            run.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                            run.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {run.status}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(run.durationMs)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatTime(run.startedAt || run.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {run.errorMessage && (
                        <span className="text-xs text-rose-400 max-w-[200px] truncate" title={run.errorMessage}>
                          {run.errorMessage}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Run Detail Modal */}
      <AnimatePresence>
        {selectedRun && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRun(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedRun.status === 'success' ? 'bg-emerald-500/10' :
                    selectedRun.status === 'failed' ? 'bg-rose-500/10' :
                    'bg-amber-500/10'
                  }`}>
                    {selectedRun.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : selectedRun.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedRun.workflow?.name}</h3>
                    <p className="text-sm text-slate-400">Run ID: {selectedRun.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Run Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400">Status</p>
                    <p className={`font-medium capitalize ${
                      selectedRun.status === 'success' ? 'text-emerald-400' :
                      selectedRun.status === 'failed' ? 'text-rose-400' :
                      'text-amber-400'
                    }`}>
                      {selectedRun.status}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="font-medium text-white">{formatDuration(selectedRun.durationMs)}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400">Started</p>
                    <p className="font-medium text-white">{new Date(selectedRun.startedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Error Message */}
                {selectedRun.errorMessage && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <p className="text-sm font-medium text-rose-400">Error</p>
                    </div>
                    <p className="text-sm text-rose-300">{selectedRun.errorMessage}</p>
                    {selectedRun.errorStack && (
                      <pre className="mt-2 text-xs text-rose-400/70 font-mono bg-rose-500/5 p-2 rounded-lg overflow-x-auto">
                        {selectedRun.errorStack}
                      </pre>
                    )}
                  </div>
                )}

                {/* Trigger Data */}
                {selectedRun.triggerData && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <p className="text-sm font-medium text-white">Trigger Data</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(typeof selectedRun.triggerData === 'string' ? JSON.parse(selectedRun.triggerData) : selectedRun.triggerData, null, 2))}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="text-xs text-slate-300 font-mono bg-slate-800/50 p-3 rounded-xl overflow-x-auto">
                      {JSON.stringify(typeof selectedRun.triggerData === 'string' ? JSON.parse(selectedRun.triggerData) : selectedRun.triggerData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Steps */}
                {selectedRun.steps && (
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Execution Steps</p>
                    <div className="space-y-2">
                      {(typeof selectedRun.steps === 'string' ? JSON.parse(selectedRun.steps) : selectedRun.steps).map((step: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              step.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                              step.status === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>
                              {i + 1}
                            </div>
                            <p className="text-sm font-medium text-white">{step.name || `Step ${i + 1}`}</p>
                            {step.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                step.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                step.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>
                                {step.status}
                              </span>
                            )}
                          </div>
                          {step.duration && (
                            <p className="text-xs text-slate-500 ml-8">{formatDuration(step.duration)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
