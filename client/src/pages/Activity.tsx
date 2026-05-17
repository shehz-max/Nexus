import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';
import { runsApi } from '../api';

export default function Activity() {
  const queryClient = useQueryClient();

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: () => runsApi.list({ limit: 50 }),
  });

  const runs = runsData?.data?.runs || [];
  const stats = runsData?.data?.pagination || { total: runs.length };

  const total = runs.length;
  const success = runs.filter((r: any) => r.status === 'success').length;
  const failed = runs.filter((r: any) => r.status === 'failed').length;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-slate-400">Monitor your workflow runs</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search runs..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['runs'] })}
          className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {runsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
            <p className="text-sm text-slate-400">Total Runs</p>
            <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
            <p className="text-sm text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-emerald-400">{successRate}%</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
            <p className="text-sm text-slate-400">Success</p>
            <p className="text-2xl font-bold text-emerald-400">{success.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 p-4">
            <p className="text-sm text-slate-400">Failed</p>
            <p className="text-2xl font-bold text-rose-400">{failed.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 overflow-hidden">
        {runsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No runs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Workflow</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Time</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run: any, index: number) => (
                  <motion.tr
                    key={run.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {run.status === 'success' ? (
                        <span className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                          Success
                        </span>
                      ) : run.status === 'failed' ? (
                        <span className="flex items-center gap-2 text-rose-400">
                          <XCircle className="w-4 h-4" />
                          Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-amber-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{run.workflowName}</p>
                      {run.error && <p className="text-sm text-rose-400">{run.error}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}