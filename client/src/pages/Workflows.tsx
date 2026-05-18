import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Edit,
  Copy,
  GitBranch,
  ChevronDown,
  Zap,
  TestTube
} from 'lucide-react';
import { workflowsApi, workflowApi } from '../api';

export default function Workflows() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
  });

  const workflows = data?.data?.workflows || [];

  const filteredWorkflows = workflows.filter((wf: any) => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wf.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => workflowApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const triggerMutation = useMutation({
    mutationFn: (id: string) => workflowApi.triggerManual(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const toggleWorkflow = (workflow: any) => {
    if (workflow.status === 'active') {
      disableMutation.mutate(workflow.id);
    } else {
      enableMutation.mutate(workflow.id);
    }
    setOpenMenu(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Active' };
      case 'paused':
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Paused' };
      default:
        return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'Draft' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-slate-400 mt-1">{workflows.length} total workflows</p>
        </div>
        <Link
          to="/app/workflows/new"
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Workflow
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5"
        >
          <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GitBranch className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No matching workflows' : 'No workflows yet'}
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first workflow to start automating your tasks'}
          </p>
          {!searchQuery && (
            <Link
              to="/app/workflows/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Workflow
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredWorkflows.map((workflow: any, index: number) => {
            const status = getStatusBadge(workflow.status);
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden"
              >
                {/* Status Banner */}
                <div className={`h-1 ${workflow.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === workflow.id ? null : workflow.id)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenu === workflow.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-10 py-1 overflow-hidden"
                          >
                            <Link
                              to={`/app/workflows/${workflow.id}`}
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                              onClick={() => setOpenMenu(null)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit workflow
                            </Link>
                            <button
                              onClick={() => toggleWorkflow(workflow)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                            >
                              {workflow.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                duplicateMutation.mutate(workflow.id);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                triggerMutation.mutate(workflow.id);
                                setOpenMenu(null);
                              }}
                              disabled={triggerMutation.isPending}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                            >
                              {triggerMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <TestTube className="w-4 h-4" />
                              )}
                              Test Run
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button
                              onClick={() => {
                                if (confirm('Delete this workflow?')) {
                                  deleteMutation.mutate(workflow.id);
                                }
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Workflow Info */}
                  <Link to={`/app/workflows/${workflow.id}`} className="block mb-4">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{workflow.description}</p>
                    )}
                  </Link>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-white">{workflow.runCount || 0}</p>
                      <p className="text-xs text-slate-500">Runs</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-emerald-400">{workflow.successCount || 0}</p>
                      <p className="text-xs text-slate-500">Success</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-rose-400">{workflow.failureCount || 0}</p>
                      <p className="text-xs text-slate-500">Failed</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {workflow.lastRunAt 
                        ? `Last run ${new Date(workflow.lastRunAt).toLocaleDateString()}`
                        : 'Never run'}
                    </div>
                    <button
                      onClick={() => toggleWorkflow(workflow)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        workflow.status === 'active'
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {workflow.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}