import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plug, Plus, Check, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { integrationsApi, connectionsApi } from '../api';

export default function Integrations() {
  const queryClient = useQueryClient();

  const { data: integrationsData, isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(),
  });

  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionsApi.list(),
  });

  const deleteConnection = useMutation({
    mutationFn: (id: string) => connectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const integrations = integrationsData?.data?.integrations || [];
  const connections = connectionsData?.data?.connections || [];

  const getIntegrationIcon = (slug: string) => {
    const icons: Record<string, string> = {
      'gmail': '📧',
      'google-sheets': '📊',
      'slack': '💬',
      'notion': '📝',
      'hubspot': '🔷',
    };
    return icons[slug] || '🔌';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-slate-400">Connect your favorite apps and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrationsLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : (
          integrations.map((integration: any, index: number) => {
            const isConnected = connections.some(c => c.integrationId === integration.id);
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 hover:border-emerald-500/30 transition-all ${
                  isConnected ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {integration.icon || getIntegrationIcon(integration.slug)}
                  </div>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">
                      Available
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{integration.description}</p>

                <button
                  className={`w-full py-2.5 font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isConnected
                      ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                  disabled={isConnected}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-4 h-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {connections.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Active Connections</h2>
          <div className="space-y-4">
            {connectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : (
              connections.map((conn: any) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                      {getIntegrationIcon(conn.integrationSlug)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{conn.name}</p>
                      <p className="text-sm text-slate-500">Connected: {new Date(conn.connectedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      conn.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {conn.status}
                    </span>
                    <button
                      onClick={() => deleteConnection.mutate(conn.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}