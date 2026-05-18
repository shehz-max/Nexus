import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Check, Loader2, Trash2, Zap, Play,
  ChevronRight, X, Filter, Link, AlertCircle
} from 'lucide-react';
import { integrationsApi, connectionsApi } from '../api';

export default function Integrations() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  const { data: integrationsData, isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(),
  });

  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.list(),
  });

  const connectMutation = useMutation({
    mutationFn: (integrationId: string) => connectionsApi.create({ integrationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const integrations = integrationsData?.data?.integrations || [];
  const connections = connectionsData?.data?.connections || [];

  const categorySet = new Set<string>();
  integrations.forEach((i: any) => categorySet.add(i.category || 'Other'));
  const categories: string[] = ['all', ...Array.from(categorySet)];

  const filteredIntegrations = integrations.filter((i: any) => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getConnection = (integrationId: string) => {
    return connections.find((c: any) => c.integrationId === integrationId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-slate-400">Connect your apps and services</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link className="w-4 h-4" />
          {connections.length} connected
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      {integrationsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700" />
                <div className="h-5 w-16 rounded-full bg-slate-700" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-3/4 mb-4" />
              <div className="h-9 bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredIntegrations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 mb-2">No integrations found</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration: any, index: number) => {
            const connection = getConnection(integration.id);
            const isConnected = !!connection;

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-slate-900/50 backdrop-blur rounded-2xl border transition-all cursor-pointer ${
                  isConnected
                    ? 'border-emerald-500/20 hover:border-emerald-500/40'
                    : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => setSelectedIntegration(integration)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      {integration.icon}
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">
                        {integration.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{integration.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {integration.triggers?.length || 0} triggers
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {integration.actions?.length || 0} actions
                    </span>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(connection.id);
                      }}
                      className="w-full py-2.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2 bg-slate-700/50 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </button>
                  ) : integration.authType === 'none' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        connectMutation.mutate(integration.id);
                      }}
                      className="w-full py-2.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        connectMutation.mutate(integration.id);
                      }}
                      className="w-full py-2.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Integration Detail Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedIntegration.name}</h3>
                    <p className="text-sm text-slate-400">{selectedIntegration.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <p className="text-sm text-slate-400">{selectedIntegration.description}</p>

                {/* Triggers */}
                {selectedIntegration.triggers?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-medium text-white">Triggers</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedIntegration.triggers.map((trigger: any) => (
                        <div key={trigger.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-white">{trigger.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              trigger.type === 'webhook' ? 'bg-amber-500/20 text-amber-400' :
                              trigger.type === 'schedule' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {trigger.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{trigger.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedIntegration.actions?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Actions</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedIntegration.actions.map((action: any) => (
                        <div key={action.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm font-medium text-white mb-1">{action.name}</p>
                          <p className="text-xs text-slate-400 mb-2">{action.description}</p>
                          {action.inputFields?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {action.inputFields.map((field: any) => (
                                <span key={field.name} className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                                  {field.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connection Status */}
                {getConnection(selectedIntegration.id) ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-400">Connected</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      This integration is ready to use in your workflows.
                    </p>
                  </div>
                ) : selectedIntegration.authType === 'none' ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      <p className="text-sm font-medium text-blue-400">No authentication required</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      This integration works without connecting an account.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                    <p className="text-sm text-slate-400 mb-3">Connect this integration to use it in your workflows.</p>
                    <button
                      onClick={() => {
                        connectMutation.mutate(selectedIntegration.id);
                        setSelectedIntegration(null);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Connect {selectedIntegration.name}
                    </button>
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
