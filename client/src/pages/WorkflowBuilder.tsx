import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Loader2, Save, Settings,
  Play, CheckCircle2, XCircle, Zap, ChevronRight, ChevronDown,
  Copy, TestTube, AlertCircle, ArrowRight, Eye, GripVertical,
  Type, Hash, Calendar, List, ToggleLeft, Wand2, X, ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { integrationsApi, workflowsApi, triggerApi, actionApi } from '../api';

interface ActionConfig {
  id: string;
  integrationId: string;
  actionId: string;
  config: Record<string, any>;
}

interface Workflow {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    integrationId: string;
    triggerId: string;
    config: Record<string, any>;
  } | null;
  actions: ActionConfig[];
}

type Step = 'name' | 'trigger-app' | 'trigger-event' | 'trigger-config' | 'trigger-test' | 'actions' | 'review';

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const location = useLocation();
  const templateData = location.state?.template as { name?: string; description?: string; trigger?: any; actions?: any[] } | undefined;

  const [step, setStep] = useState<Step>('name');
  const [workflow, setWorkflow] = useState<Workflow>({
    name: templateData?.name || '',
    description: templateData?.description || '',
    status: 'draft',
    trigger: templateData?.trigger || null,
    actions: templateData?.actions || [],
  });
  const [triggerSample, setTriggerSample] = useState<any>(null);
  const [actionSamples, setActionSamples] = useState<Record<string, any>>({});
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [showFieldMapper, setShowFieldMapper] = useState<string | null>(null);
  const [testingTrigger, setTestingTrigger] = useState(false);
  const [testingAction, setTestingAction] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const triggerConfig = typeof w.triggerConfig === 'string' ? JSON.parse(w.triggerConfig) : w.triggerConfig;
      const actions = typeof w.actions === 'string' ? JSON.parse(w.actions) : w.actions;
      setWorkflow({
        name: w.name,
        description: w.description || '',
        status: w.status,
        trigger: triggerConfig?.integrationId ? triggerConfig : null,
        actions: actions?.map((a: any) => ({
          id: a.id || `action-${Date.now()}-${Math.random()}`,
          integrationId: a.integrationId,
          actionId: a.actionId,
          config: a.config || {},
        })) || [],
      });
      if (triggerConfig?.integrationId) {
        setStep('trigger-test');
      }
    }
  }, [workflowData]);

  const integrations = integrationsData?.data?.integrations || [];
  const selectedTriggerIntegration = integrations.find((i: any) => i.id === workflow.trigger?.integrationId);
  const selectedTrigger = selectedTriggerIntegration?.triggers?.find((t: any) => t.id === workflow.trigger?.triggerId);

  const getIntegration = (id: string) => integrations.find((i: any) => i.id === id);
  const getIntegrationTriggers = (integrationId: string) => {
    const integration = getIntegration(integrationId);
    return integration?.triggers || [];
  };
  const getIntegrationActions = (integrationId: string) => {
    const integration = getIntegration(integrationId);
    return integration?.actions || [];
  };
  const getAction = (integrationId: string, actionId: string) => {
    const actions = getIntegrationActions(integrationId);
    return actions.find((a: any) => a.id === actionId);
  };

  const testTrigger = useCallback(async () => {
    if (!workflow.trigger?.integrationId || !workflow.trigger?.triggerId) return;
    setTestingTrigger(true);
    try {
      const res = await triggerApi.test({
        integrationId: workflow.trigger.integrationId,
        triggerId: workflow.trigger.triggerId,
        config: workflow.trigger.config,
      });
      setTriggerSample(res.data.sampleData);
    } catch (e: any) {
      setErrors({ trigger: e.message || 'Failed to test trigger' });
    } finally {
      setTestingTrigger(false);
    }
  }, [workflow.trigger]);

  const testAction = useCallback(async (actionId: string) => {
    const action = workflow.actions.find(a => a.id === actionId);
    if (!action) return;
    setTestingAction(actionId);
    try {
      const res = await actionApi.test({
        integrationId: action.integrationId,
        actionId: action.actionId,
        config: action.config,
        sampleData: triggerSample,
      });
      setActionSamples(prev => ({ ...prev, [actionId]: res.data.result }));
    } catch (e: any) {
      setErrors({ [`action-${actionId}`]: e.message || 'Failed to test action' });
    } finally {
      setTestingAction(null);
    }
  }, [workflow.actions, triggerSample]);

  const handleSave = () => {
    if (!workflow.name) {
      setErrors({ name: 'Workflow name is required' });
      return;
    }
    if (!workflow.trigger?.integrationId || !workflow.trigger?.triggerId) {
      setErrors({ trigger: 'Please configure a trigger' });
      return;
    }
    if (workflow.actions.length === 0) {
      setErrors({ actions: 'Add at least one action' });
      return;
    }

    const data = {
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      trigger: workflow.trigger,
      actions: workflow.actions.map(a => ({
        id: a.id,
        integrationId: a.integrationId,
        actionId: a.actionId,
        config: a.config,
      })),
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addAction = () => {
    const newAction: ActionConfig = {
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      integrationId: '',
      actionId: '',
      config: {},
    };
    setWorkflow({ ...workflow, actions: [...workflow.actions, newAction] });
    setExpandedAction(newAction.id);
  };

  const removeAction = (actionId: string) => {
    setWorkflow({ ...workflow, actions: workflow.actions.filter(a => a.id !== actionId) });
    if (expandedAction === actionId) setExpandedAction(null);
  };

  const updateAction = (actionId: string, field: string, value: any) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.map(a =>
        a.id === actionId ? { ...a, [field]: value, ...(field === 'integrationId' ? { actionId: '', config: {} } : {}) } : a
      ),
    });
  };

  const updateActionConfig = (actionId: string, field: string, value: any) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.map(a =>
        a.id === actionId ? { ...a, config: { ...a.config, [field]: value } } : a
      ),
    });
  };

  const getTriggerFields = () => {
    if (!triggerSample) return [];
    const flatten = (obj: any, prefix = ''): string[] => {
      return Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return flatten(value, path);
        }
        return path;
      });
    };
    return flatten(triggerSample);
  };

  const getFieldTypeIcon = (value: any) => {
    if (typeof value === 'number') return Hash;
    if (typeof value === 'boolean') return ToggleLeft;
    if (value instanceof Date || (typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value))) return Calendar;
    if (Array.isArray(value)) return List;
    return Type;
  };

  const insertFieldMapping = (actionId: string, field: string, triggerField: string) => {
    const currentValue = workflow.actions.find(a => a.id === actionId)?.config[field] || '';
    const mapping = `{{trigger.${triggerField}}}`;
    updateActionConfig(actionId, field, currentValue ? `${currentValue} ${mapping}` : mapping);
  };

  const insertTransformation = (actionId: string, field: string, transform: string) => {
    const currentValue = workflow.actions.find(a => a.id === actionId)?.config[field] || '';
    const transformed = `{{${transform}(trigger.field)}}`.replace('trigger.field', currentValue.split('.').pop() || 'field');
    updateActionConfig(actionId, field, transformed);
  };

  const transformations = [
    { id: 'uppercase', label: 'UPPERCASE', icon: Type },
    { id: 'lowercase', label: 'lowercase', icon: Type },
    { id: 'trim', label: 'trim', icon: X },
    { id: 'capitalize', label: 'Capitalize', icon: Type },
    { id: 'date_format', label: 'Date Format', icon: Calendar },
  ];

  const renderFieldInput = (actionId: string, field: any) => {
    const action = workflow.actions.find(a => a.id === actionId);
    if (!action) return null;

    const value = action.config[field.name] || '';
    const hasMapping = typeof value === 'string' && value.includes('{{');

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            {field.label}
            {field.required && <span className="text-rose-400">*</span>}
          </label>
          {field.type === 'select' && field.options && (
            <div className="relative">
              <select
                value={value}
                onChange={(e) => updateActionConfig(actionId, field.name, e.target.value)}
                className="appearance-none pr-8 pl-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="">Select...</option>
                {field.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        
        {/* Field Input */}
        <div className="relative">
          {field.type === 'text' ? (
            <textarea
              value={value}
              onChange={(e) => updateActionConfig(actionId, field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm font-mono resize-none"
            />
          ) : field.type !== 'select' ? (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => updateActionConfig(actionId, field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm font-mono"
            />
          ) : null}
          
          {/* Field Mapping Button */}
          {triggerSample && (
            <button
              onClick={() => setShowFieldMapper(showFieldMapper === `${actionId}-${field.name}` ? null : `${actionId}-${field.name}`)}
              className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                hasMapping 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
              title="Insert field from trigger"
            >
              {hasMapping ? <Wand2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Field Mapping Panel */}
        {showFieldMapper === `${actionId}-${field.name}` && triggerSample && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-3 border-b border-white/5 bg-slate-800/50">
              <p className="text-xs text-slate-400 font-medium">Available Fields</p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {getTriggerFields().map(f => {
                const FieldIcon = getFieldTypeIcon(triggerSample);
                const fieldValue = f.split('.').reduce((obj: any, key: string) => obj?.[key], triggerSample);
                return (
                  <button
                    key={f}
                    onClick={() => { insertFieldMapping(actionId, field.name, f); setShowFieldMapper(null); }}
                    className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <FieldIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 font-mono truncate">{f}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {typeof fieldValue === 'object' ? JSON.stringify(fieldValue).slice(0, 30) : String(fieldValue || 'empty')}
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </button>
                );
              })}
            </div>
            
            {/* Transformations */}
            {hasMapping && (
              <div className="p-3 border-t border-white/5 bg-slate-800/50">
                <p className="text-xs text-slate-400 font-medium mb-2">Transform</p>
                <div className="flex flex-wrap gap-1">
                  {transformations.map(t => (
                    <button
                      key={t.id}
                      onClick={() => insertTransformation(actionId, field.name, t.id)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <t.icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Current Mapping Indicator */}
        {hasMapping && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 mt-1">
            <Wand2 className="w-3 h-3" />
            <span>Dynamic field mapping active</span>
            <button 
              onClick={() => updateActionConfig(actionId, field.name, '')}
              className="ml-auto text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  };

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'name', label: 'Name', num: 1 },
    { key: 'trigger-app', label: 'Trigger App', num: 2 },
    { key: 'trigger-event', label: 'Trigger Event', num: 3 },
    { key: 'trigger-config', label: 'Configure', num: 4 },
    { key: 'trigger-test', label: 'Test', num: 5 },
    { key: 'actions', label: 'Actions', num: 6 },
    { key: 'review', label: 'Review', num: 7 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const nextStep = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  };

  const prevStep = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  };

  if (integrationsLoading || (isEditing && workflowLoading)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <p className="text-slate-400">Build your automation step by step</p>
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
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditing ? 'Update' : 'Create'} Workflow
          </button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (i <= currentStepIndex) setStep(s.key);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  s.key === step
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : i < currentStepIndex
                    ? 'text-emerald-400 hover:bg-white/5'
                    : 'text-slate-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  s.key === step
                    ? 'bg-emerald-500 text-slate-950'
                    : i < currentStepIndex
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-600'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Name */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Name your workflow</h2>
                <p className="text-slate-400 text-sm">Give your automation a descriptive name</p>
              </div>
              <input
                type="text"
                placeholder="e.g., New Google Sheets row → Slack notification"
                value={workflow.name}
                onChange={(e) => { setWorkflow({ ...workflow, name: e.target.value }); setErrors({}); }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
              {errors.name && (
                <p className="text-rose-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.name}
                </p>
              )}
              <textarea
                placeholder="Description (optional)..."
                value={workflow.description || ''}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm resize-none"
              />
              <div className="flex justify-end">
                <button onClick={nextStep} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Trigger App */}
          {step === 'trigger-app' && (
            <motion.div
              key="trigger-app"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Choose a trigger app</h2>
                <p className="text-slate-400 text-sm">Which app will start this workflow?</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {integrations.map((integration: any) => (
                  <button
                    key={integration.id}
                    onClick={() => {
                      setWorkflow({ ...workflow, trigger: { integrationId: integration.id, triggerId: '', config: {} } });
                      nextStep();
                    }}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      workflow.trigger?.integrationId === integration.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{integration.icon}</span>
                    <span className="text-sm text-slate-300">{integration.name}</span>
                    {integration.authType === 'none' && (
                      <span className="text-xs text-slate-500">No auth needed</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Trigger Event */}
          {step === 'trigger-event' && (
            <motion.div
              key="trigger-event"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Choose a trigger event</h2>
                <p className="text-slate-400 text-sm">What event in {selectedTriggerIntegration?.name} starts this workflow?</p>
              </div>
              <div className="space-y-2">
                {getIntegrationTriggers(workflow.trigger?.integrationId || '').map((trigger: any) => (
                  <button
                    key={trigger.id}
                    onClick={() => {
                      setWorkflow({ ...workflow, trigger: { ...workflow.trigger!, triggerId: trigger.id } });
                      nextStep();
                    }}
                    className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                      workflow.trigger?.triggerId === trigger.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trigger.type === 'webhook' ? 'bg-amber-500/20' : trigger.type === 'schedule' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
                    }`}>
                      {trigger.type === 'webhook' ? <Zap className="w-5 h-5 text-amber-400" /> :
                       trigger.type === 'schedule' ? <Play className="w-5 h-5 text-blue-400" /> :
                       <Play className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{trigger.name}</p>
                      <p className="text-sm text-slate-400">{trigger.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trigger.type === 'webhook' ? 'bg-amber-500/20 text-amber-400' :
                      trigger.type === 'schedule' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {trigger.type}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Trigger Config */}
          {step === 'trigger-config' && (
            <motion.div
              key="trigger-config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Configure trigger</h2>
                <p className="text-slate-400 text-sm">Set up your {selectedTrigger?.name} trigger</p>
              </div>
              {selectedTrigger?.type === 'schedule' && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-300 mb-2">Schedule: <span className="font-mono text-emerald-400">{selectedTrigger.schedule}</span></p>
                  <p className="text-xs text-slate-500">This trigger runs automatically on the schedule above.</p>
                </div>
              )}
              {selectedTrigger?.type === 'webhook' && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-300 mb-2">Webhook URL will be generated after activation</p>
                  <p className="text-xs text-slate-500">Send POST requests to this URL to trigger your workflow.</p>
                </div>
              )}
              {selectedTrigger?.type === 'polling' && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-300 mb-2">Polling: Checks for new data every 15 minutes</p>
                  <p className="text-xs text-slate-500">Upgrade to reduce polling interval.</p>
                </div>
              )}
              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Test Trigger */}
          {step === 'trigger-test' && (
            <motion.div
              key="trigger-test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Test your trigger</h2>
                <p className="text-slate-400 text-sm">Fetch sample data to use in your actions</p>
              </div>
              <button
                onClick={testTrigger}
                disabled={testingTrigger}
                className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testingTrigger ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <TestTube className="w-5 h-5" />
                )}
                {testingTrigger ? 'Fetching sample data...' : 'Test Trigger'}
              </button>
              {triggerSample && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-400">Sample data received</p>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono bg-slate-900/50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(triggerSample, null, 2)}
                  </pre>
                </motion.div>
              )}
              {errors.trigger && (
                <p className="text-rose-400 text-sm flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {errors.trigger}
                </p>
              )}
              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Actions */}
          {step === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Add actions</h2>
                <p className="text-slate-400 text-sm">What should happen after the trigger fires?</p>
              </div>

              {/* Trigger Summary */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Trigger: {selectedTriggerIntegration?.name}</p>
                  <p className="text-xs text-slate-400">{selectedTrigger?.name}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Actions List */}
              <div className="space-y-3">
                {workflow.actions.map((action, index) => {
                  const actionIntegration = getIntegration(action.integrationId);
                  const actionDef = getAction(action.integrationId, action.actionId);
                  const isExpanded = expandedAction === action.id;

                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-white/10 rounded-xl overflow-hidden"
                    >
                      {/* Action Header */}
                      <div className="flex items-center gap-3 p-4 bg-slate-800/50">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                          {index + 2}
                        </div>
                        <button
                          onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                          className="flex-1 text-left"
                        >
                          {actionDef ? (
                            <div>
                              <p className="font-medium text-white">{actionIntegration?.icon} {actionDef.name}</p>
                              <p className="text-xs text-slate-400">{actionIntegration?.name}</p>
                            </div>
                          ) : (
                            <p className="text-slate-500">{action.integrationId ? 'Select action...' : 'Choose an app'}</p>
                          )}
                        </button>
                        {actionSamples[action.id] && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        <button
                          onClick={() => removeAction(action.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpandedAction(isExpanded ? null : action.id)} className="p-2 text-slate-400 hover:text-white transition-colors">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Action Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-white/5 space-y-4">
                              {/* App Selection */}
                              {!action.integrationId ? (
                                <div>
                                  <label className="block text-sm text-slate-400 mb-2">Choose App</label>
                                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {integrations.filter((i: any) => i.actions.length > 0).map((integration: any) => (
                                      <button
                                        key={integration.id}
                                        onClick={() => updateAction(action.id, 'integrationId', integration.id)}
                                        className="p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:border-white/20 transition-all flex flex-col items-center gap-1"
                                      >
                                        <span className="text-xl">{integration.icon}</span>
                                        <span className="text-xs text-slate-300">{integration.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : !action.actionId ? (
                                <div>
                                  <label className="block text-sm text-slate-400 mb-2">Choose Action</label>
                                  <div className="space-y-2">
                                    {getIntegrationActions(action.integrationId).map((a: any) => (
                                      <button
                                        key={a.id}
                                        onClick={() => updateAction(action.id, 'actionId', a.id)}
                                        className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:border-white/20 transition-all text-left flex items-center gap-3"
                                      >
                                        <Play className="w-4 h-4 text-blue-400" />
                                        <div>
                                          <p className="text-sm font-medium text-white">{a.name}</p>
                                          <p className="text-xs text-slate-400">{a.description}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : actionDef ? (
                                <>
                                  {/* Action Config Fields */}
                                  {actionDef.inputFields?.map((field: any) => (
                                    <div key={field.name}>
                                      <label className="block text-sm text-slate-400 mb-2">
                                        {field.label} {field.required && <span className="text-rose-400">*</span>}
                                      </label>
                                      {renderFieldInput(action.id, field)}
                                    </div>
                                  ))}

                                  {/* Test Action */}
                                  <button
                                    onClick={() => testAction(action.id)}
                                    disabled={testingAction === action.id}
                                    className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    {testingAction === action.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <TestTube className="w-4 h-4" />
                                    )}
                                    {testingAction === action.id ? 'Testing...' : 'Test Action'}
                                  </button>

                                  {actionSamples[action.id] && (
                                    <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <p className="text-xs font-medium text-emerald-400">Test successful</p>
                                      </div>
                                      <pre className="text-xs text-slate-400 font-mono">
                                        {JSON.stringify(actionSamples[action.id], null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Add Action Button */}
                <button
                  onClick={addAction}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Action
                </button>
              </div>

              {errors.actions && (
                <p className="text-rose-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.actions}
                </p>
              )}

              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 7: Review */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Review workflow</h2>
                <p className="text-slate-400 text-sm">Check your workflow before saving</p>
              </div>

              {/* Workflow Flow */}
              <div className="space-y-3">
                {/* Trigger */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{selectedTriggerIntegration?.name}</p>
                    <p className="text-sm text-slate-400">{selectedTrigger?.name}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    {selectedTrigger?.type}
                  </span>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />
                </div>

                {/* Actions */}
                {workflow.actions.map((action, index) => {
                  const actionIntegration = getIntegration(action.integrationId);
                  const actionDef = getAction(action.integrationId, action.actionId);
                  return (
                    <div key={action.id}>
                      {index > 0 && (
                        <div className="flex justify-center">
                          <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />
                        </div>
                      )}
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                          {index + 2}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{actionIntegration?.icon} {actionDef?.name || 'Action'}</p>
                          <p className="text-sm text-slate-400">{actionIntegration?.name}</p>
                        </div>
                        {actionSamples[action.id] && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">1</p>
                  <p className="text-sm text-slate-400">Trigger</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-white">{workflow.actions.length}</p>
                  <p className="text-sm text-slate-400">Actions</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-400">0</p>
                  <p className="text-sm text-slate-400">Total Runs</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors">
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isEditing ? 'Update Workflow' : 'Create Workflow'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
