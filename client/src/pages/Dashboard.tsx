import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ArrowRight, 
  Workflow, 
  Plug, 
  Activity, 
  TrendingUp, 
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  GitBranch,
  Timer,
  ChevronRight,
  Sparkles,
  AlertCircle,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { runsApi, workflowsApi, connectionsApi } from '../api';

export default function Dashboard() {
  const { data: workflowsData, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: () => runsApi.list({ limit: 10 }),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.list(),
  });

  const workflows = workflowsData?.data?.workflows || [];
  const runs = runsData?.data?.runs || [];
  const connections = connectionsData?.data?.connections || [];

  const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length;
  const totalRuns = runs.length;
  const successRuns = runs.filter((r: any) => r.status === 'success').length;
  const failedRuns = runs.filter((r: any) => r.status === 'failed').length;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
  const avgDuration = runs.length > 0 
    ? Math.round(runs.reduce((acc: number, r: any) => acc + (r.durationMs || 0), 0) / runs.length) 
    : 0;

  const recentRuns = runs.slice(0, 8);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Overview</h1>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">Welcome back. Here's what's happening with your automations.</p>
        </div>
        <Link
          to="/app/workflows/new"
          className="group w-full sm:w-auto px-5 py-2.5 bg-white text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-100 shadow-lg shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          { 
            label: 'Active Workflows', 
            value: activeWorkflows, 
            suffix: '',
            icon: Workflow, 
            trend: `${workflows.length} total`,
            gradient: 'from-emerald-500/20 to-emerald-600/5',
            border: 'border-emerald-500/20',
            iconColor: 'text-emerald-400',
          },
          { 
            label: 'Success Rate', 
            value: successRate, 
            suffix: '%',
            icon: TrendingUp, 
            trend: failedRuns > 0 ? `${failedRuns} failed` : 'All good',
            gradient: 'from-blue-500/20 to-blue-600/5',
            border: 'border-blue-500/20',
            iconColor: 'text-blue-400',
          },
          { 
            label: 'Total Runs', 
            value: totalRuns, 
            suffix: '',
            icon: Activity, 
            trend: avgDuration > 0 ? `Avg ${formatDuration(avgDuration)}` : 'No runs yet',
            gradient: 'from-violet-500/20 to-violet-600/5',
            border: 'border-violet-500/20',
            iconColor: 'text-violet-400',
          },
          { 
            label: 'Connected Apps', 
            value: connections.length, 
            suffix: '',
            icon: Plug, 
            trend: 'Integrations',
            gradient: 'from-amber-500/20 to-amber-600/5',
            border: 'border-amber-500/20',
            iconColor: 'text-amber-400',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} p-5 hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {stat.value}{stat.suffix}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.trend}</p>
              </div>
            </div>
            {/* Subtle glow effect */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.iconColor.replace('text-', 'bg-')} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Runs - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Recent Activity</h2>
                <p className="text-xs text-slate-500">Latest workflow executions</p>
              </div>
            </div>
            <Link 
              to="/app/activity" 
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              View all
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {runsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
              </div>
            ) : recentRuns.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">No runs yet</p>
                <p className="text-xs text-slate-500">Create and activate a workflow to see runs here</p>
              </div>
            ) : (
              recentRuns.map((run: any, index: number) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      run.status === 'success' 
                        ? 'bg-emerald-500/10' 
                        : run.status === 'failed' 
                          ? 'bg-rose-500/10' 
                          : 'bg-amber-500/10'
                    }`}>
                      {run.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : run.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{run.workflow?.name || 'Workflow Run'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide ${
                          run.status === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : run.status === 'failed' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {run.status}
                        </span>
                        {run.durationMs && (
                          <span className="text-xs text-slate-500">{formatDuration(run.durationMs)}</span>
                        )}
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">{timeAgo(run.startedAt || run.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Workflows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-sm">Workflows</h2>
                  <p className="text-xs text-slate-500">{workflows.length} total</p>
                </div>
              </div>
              <Link to="/app/workflows" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                Manage
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {workflowsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-slate-500 mb-3">No workflows yet</p>
                  <Link
                    to="/app/workflows/new"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    Create your first <Plus className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                workflows.slice(0, 5).map((workflow: any, index: number) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    <Link to={`/app/workflows/${workflow.id}`} className="block">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-white truncate pr-2 group-hover:text-emerald-400 transition-colors">
                          {workflow.name}
                        </p>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          workflow.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'
                        }`} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {workflow.runCount || 0}
                        </span>
                        <span>{timeAgo(workflow.updatedAt)}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            {workflows.length > 5 && (
              <Link
                to="/app/workflows"
                className="flex items-center justify-center gap-1 p-3 text-xs text-slate-400 hover:text-white transition-colors border-t border-white/5"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Quick Actions</p>
            <div className="space-y-2">
              <Link
                to="/app/workflows/new"
                className="group flex items-center gap-3 p-3 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Create Workflow</p>
                  <p className="text-xs text-slate-500">Build a new automation</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                to="/app/integrations"
                className="group flex items-center gap-3 p-3 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Plug className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Connect App</p>
                  <p className="text-xs text-slate-500">Add new integrations</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                to="/app/activity"
                className="group flex items-center gap-3 p-3 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">View Activity</p>
                  <p className="text-xs text-slate-500">Monitor executions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Connected Apps */}
      {connections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                <Plug className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Connected Apps</h2>
                <p className="text-xs text-slate-500">{connections.length} active connections</p>
              </div>
            </div>
            <Link to="/app/integrations" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              Manage
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {connections.map((conn: any) => (
              <div
                key={conn.id}
                className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/50 hover:bg-slate-800/80 rounded-lg border border-white/5 transition-colors"
              >
                <div className="w-7 h-7 bg-slate-700 rounded-md flex items-center justify-center text-sm">
                  {conn.integration?.icon || conn.integration?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{conn.displayName || conn.integration?.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{conn.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
