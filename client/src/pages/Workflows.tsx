import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Play, Pause, Copy, Trash2, MoreHorizontal, Search, Filter, Loader2 } from 'lucide-react';
import { workflowsApi } from '../api';

export default function Workflows() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const workflows = data?.data?.workflows || [];

  const enableMutation = useMutation({
    mutationFn: (id: string) => workflowsApi.enable(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => workflowsApi.disable(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'paused': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-slate-400">Manage your automation workflows</p>
        </div>
        <Link
          to="/app/workflows/new"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-full transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Workflow
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-white/5">
          <p className="text-slate-400 mb-4">No workflows yet</p>
          <Link
            to="/app/workflows/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create your first workflow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow: any, index: number) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-white mb-2">{workflow.name}</h3>
              <p className="text-sm text-slate-500 mb-4">
                {workflow.runCount || 0} runs · Last run {workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleDateString() : 'Never'}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  to={`/app/workflows/${workflow.id}`}
                  className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Edit
                </Link>
                {workflow.status === 'active' ? (
                  <button
                    onClick={() => disableMutation.mutate(workflow.id)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded-lg transition-all"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => enableMutation.mutate(workflow.id)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg transition-all"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(workflow.id)}
                  className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}