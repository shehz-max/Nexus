import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  CheckCircle,
  XCircle,
  ArrowRight,
  Workflow,
  Plug,
  Activity,
  TrendingUp,
  Zap,
  Loader2,
} from 'lucide-react';
import { runsApi, workflowsApi } from '../api';

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['runs', 'stats'],
    queryFn: () => runsApi.stats(),
  });

  const { data: workflowsData, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: () => runsApi.list({ limit: 5 }),
  });

  const stats = statsData?.data;
  const workflows = workflowsData?.data?.workflows || [];
  const runs = runsData?.data?.runs || [];

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-400">Overview of your automations</p>
        </div>
        <Link
          to="/app/workflows/new"
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-full transition-all flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          New Workflow
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6"
        >
          {statsLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Workflow className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Active Workflows</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{activeWorkflows}</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6"
        >
          {workflowsLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Plug className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Connections</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{workflows.length}</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6"
        >
          {statsLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats?.successRate || 0}%</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6"
        >
          {statsLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 truncate">Total Runs</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{(stats?.total || 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/app/integrations"
          className="group bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6 hover:border-emerald-500/30 transition-all touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Plug className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm sm:text-base">
                  Connect an App
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">Link your favorite tools</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>

        <Link
          to="/app/workflows/new"
          className="group bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6 hover:border-emerald-500/30 transition-all touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm sm:text-base">
                  Create Automation
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">Build your first workflow</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>
      </div>

      <div className="bg-slate-900/50 backdrop-blur rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-white">Recent Activity</h2>
          <Link to="/app/activity" className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300">
            View all
          </Link>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {runsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : runs.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No recent activity</p>
          ) : (
            runs.map((run: any, index: number) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-2 sm:py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {run.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                  ) : run.status === 'failed' ? (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 animate-spin" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm sm:text-base truncate">{run.workflowName}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{new Date(run.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 capitalize ${
                    run.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : run.status === 'failed'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {run.status}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}