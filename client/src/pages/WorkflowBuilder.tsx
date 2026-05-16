import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2, Save, Settings } from 'lucide-react';
import { integrationsApi, workflowsApi } from '../api';

interface TriggerConfig {
  triggerId: string;
  integrationId: string;
  config: Record<string, any>;
}

interface ActionConfig {
  id: number;
  integrationId: string;
  actionId: string;
  config: Record<string, any>;
}

interface Workflow {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger?: TriggerConfig;
  actions: ActionConfig[];
}

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    description: '',
    status: 'draft',
    actions: [],
  });
  const [selectedTrigger, setSelectedTrigger] = useState<{ integrationId: string; triggerId: string } | null>(null);

  const { data: integrationsData, isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(),
  });

  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsApi.get(id!),
    enabled: isEditing,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => workflowsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      navigate('/app/workflows');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => workflowsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      navigate('/app/workflows');
    },
  });

  useEffect(() => {
    if (workflowData?.data?.workflow) {
      const w = workflowData.data.workflow;
      setWorkflow({
        name: w.name,
        description: w.description || '',
        status: w.status,
        trigger: w.trigger,
        actions: w.actions?.map((a: any, i: number) => ({
          id: i,
          integrationId: a.integrationId,
          actionId: a.actionId,
          config: a.config || {},
        })) || [],
      });
      if (w.trigger) {
        setSelectedTrigger({ integrationId: w.trigger.integrationId, triggerId: w.trigger.triggerId });
      }
    }
  }, [workflowData]);

  const integrations = integrationsData?.data?.integrations || [];

  const getIntegrationTriggers = (integrationId: string) => {
    const integration = integrations.find((i: any) => i.id === integrationId);
    return integration?.triggers || [];
  };

  const getIntegrationActions = (integrationId: string) => {
    const integration = integrations.find((i: any) => i.id === integrationId);
    return integration?.actions || [];
  };

  const handleSave = () => {
    const workflowData = {
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description,
      status: 'draft' as const,
      trigger: selectedTrigger ? { ...selectedTrigger, config: {} } : null,
      actions: workflow.actions.map(a => ({
        integrationId: a.integrationId,
        actionId: a.actionId,
        config: a.config,
      })),
    };

    if (isEditing) {
      updateMutation.mutate(workflowData);
    } else {
      createMutation.mutate(workflowData);
    }
  };

  const addAction = () => {
    setWorkflow({
      ...workflow,
      actions: [...workflow.actions, { id: Date.now(), integrationId: '', actionId: '', config: {} }],
    });
  };

  const removeAction = (id: number) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.filter((a) => a.id !== id),
    });
  };

  const updateAction = (id: number, field: string, value: string) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    });
  };

  const isLoading = integrationsLoading || (isEditing && workflowLoading);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/workflows')}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Workflow' : 'Create Workflow'}
            </h1>
            <p className="text-slate-400">Build your automation from scratch</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/workflows')}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !workflow.name}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Update' : 'Create'} Workflow
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6">
        <input
          type="text"
          placeholder="Workflow name..."
          value={workflow.name}
          onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xl font-semibold placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 mb-6"
        />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-semibold text-white">Trigger</h2>
            <span className="text-sm text-slate-500">What starts this workflow?</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {integrations.map((integration: any) => (
              <button
                key={integration.id}
                onClick={() => setSelectedTrigger({ integrationId: integration.id, triggerId: '' })}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  selectedTrigger?.integrationId === integration.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className="text-sm text-slate-300">{integration.name}</span>
              </button>
            ))}
          </div>

          {selectedTrigger?.integrationId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-800/50 rounded-xl border border-white/5"
            >
              <label className="block text-sm text-slate-400 mb-2">Select Trigger Event</label>
              <select
                value={selectedTrigger.triggerId}
                onChange={(e) => setSelectedTrigger({ ...selectedTrigger, triggerId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Choose a trigger...</option>
                {getIntegrationTriggers(selectedTrigger.integrationId).map((trigger: any) => (
                  <option key={trigger.id} value={trigger.id}>
                    {trigger.name}
                  </option>
                ))}
              </select>
              {selectedTrigger.triggerId && (
                <p className="mt-2 text-sm text-slate-500">
                  {getIntegrationTriggers(selectedTrigger.integrationId).find((t: any) => t.id === selectedTrigger.triggerId)?.description}
                </p>
              )}
            </motion.div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-semibold text-white">Actions</h2>
            <span className="text-sm text-slate-500">What should happen?</span>
          </div>

          {workflow.actions.length === 0 ? (
            <p className="text-center text-slate-500 py-8 mb-4">
              No actions yet. Add an action to continue.
            </p>
          ) : (
            workflow.actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 mb-4"
              >
                <div className="flex items-center gap-2 pt-3">
                  <GripVertical className="w-5 h-5 text-slate-500" />
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {index + 2}
                  </div>
                </div>

                <div className="flex-1 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">App</label>
                      <select
                        value={action.integrationId}
                        onChange={(e) => updateAction(action.id, 'integrationId', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="">Select app...</option>
                        {integrations.map((i: any) => (
                          <option key={i.id} value={i.id}>
                            {i.icon} {i.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Action</label>
                      <select
                        value={action.actionId}
                        onChange={(e) => updateAction(action.id, 'actionId', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                        disabled={!action.integrationId}
                      >
                        <option value="">Select action...</option>
                        {action.integrationId &&
                          getIntegrationActions(action.integrationId).map((a: any) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {action.actionId && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Settings className="w-4 h-4" />
                        Configuration
                      </div>
                      <input
                        type="text"
                        placeholder="Configure action parameters..."
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 text-sm"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeAction(action.id)}
                  className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all mt-8"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}

          <button
            onClick={addAction}
            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Action
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Workflow Summary</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            workflow.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
          }`}>
            {workflow.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-white">{workflow.trigger ? 1 : 0}</p>
            <p className="text-sm text-slate-400">Trigger</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-white">{workflow.actions.length}</p>
            <p className="text-sm text-slate-400">Actions</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="text-sm text-slate-400">Total Runs</p>
          </div>
        </div>
      </div>
    </div>
  );
}