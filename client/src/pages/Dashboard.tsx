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
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Settings,
  BarChart3,
  GitBranch,
  Timer,
  ChevronRight
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

  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
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

  const recentRuns = runs.slice(0, 5);

  const stats = [
    { 
      label: 'Active Workflows', 
      value: activeWorkflows, 
      total: workflows.length,
      icon: Workflow, 
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400'
    },
    { 
      label: 'Connections', 
      value: connections.length, 
      icon: Plug, 
      color: 'blue',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400'
    },
    { 
      label: 'Success Rate', 
      value: `${successRate}%`, 
      icon: TrendingUp, 
      color: 'amber',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400'
    },
    { 
      label: 'Total Runs', 
      value: totalRuns, 
      icon: Activity, 
      color: 'purple',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Monitor and manage your automations</p>
        </div>
        <Link
          to="/app/workflows/new"
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Workflow
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              {stat.total !== undefined && (
                <span className="text-xs text-slate-500">
                  of {stat.total}
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/app/workflows/new"
          className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-500/20 p-6 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">New Workflow</h3>
          <p className="text-sm text-slate-400">Create automation with trigger and actions</p>
        </Link>

        <Link
          to="/app/integrations"
          className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-500/20 p-6 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Plug className="w-6 h-6 text-blue-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Connect App</h3>
          <p className="text-sm text-slate-400">Link your favorite tools</p>
        </Link>

        <Link
          to="/app/activity"
          className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-500/20 p-6 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">View Activity</h3>
          <p className="text-sm text-slate-400">Monitor workflow executions</p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Runs */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Recent Runs</h2>
                <p className="text-sm text-slate-400">Latest workflow executions</p>
              </div>
            </div>
            <Link to="/app/activity" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {runsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : recentRuns.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-2">No runs yet</p>
                <p className="text-sm text-slate-500">Workflows will appear here once executed</p>
              </div>
            ) : (
              recentRuns.map((run: any, index: number) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      run.status === 'success' 
                        ? 'bg-emerald-500/10' 
                        : run.status === 'failed' 
                          ? 'bg-rose-500/10' 
                          : 'bg-amber-500/10'
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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          run.status === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : run.status === 'failed' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {run.status}
                        </span>
                        {run.durationMs && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {run.durationMs}ms
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(run.startedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Active Workflows */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Workflows</h2>
                <p className="text-sm text-slate-400">{workflows.length} total</p>
              </div>
            </div>
            <Link to="/app/workflows" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {workflowsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-slate-400 mb-3">No workflows yet</p>
                <Link
                  to="/app/workflows/new"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                >
                  Create your first <Plus className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              workflows.slice(0, 5).map((workflow: any, index: number) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white truncate">{workflow.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {workflow.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {workflow.runCount || 0} runs
                    </span>
                    <span>
                      Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {workflows.length > 5 && (
            <Link
              to="/app/workflows"
              className="flex items-center justify-center gap-2 p-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors border-t border-white/5"
            >
              View all workflows <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Integrations Section */}
      {connections.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Plug className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Connected Apps</h2>
                <p className="text-sm text-slate-400">{connections.length} integrations</p>
              </div>
            </div>
            <Link to="/app/integrations" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              Manage
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {connections.map((conn: any) => (
              <div
                key={conn.id}
                className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5"
              >
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-sm">
                  {conn.integration?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{conn.displayName || conn.integration?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{conn.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}