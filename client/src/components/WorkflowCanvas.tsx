import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Play, GitBranch, Clock, Filter, Plus, Trash2, Edit,
  ChevronRight, ChevronDown, GripVertical, X, ZoomIn, ZoomOut,
  Maximize2, Grid3X3, Eye, EyeOff
} from 'lucide-react';

interface ActionConfig {
  id: string;
  integrationId: string;
  actionId: string;
  config: Record<string, any>;
}

interface Condition {
  id: string;
  type: 'filter' | 'if_else' | 'delay';
  field: string;
  operator: string;
  value: string;
  delayMs?: number;
}

interface WorkflowCanvasProps {
  trigger: { integrationId: string; triggerId: string; config: Record<string, any> } | null;
  triggerIntegration?: any;
  actions: ActionConfig[];
  conditions: Condition[];
  integrations: any[];
  onEditAction?: (actionId: string) => void;
  onEditTrigger?: () => void;
  onEditCondition?: (conditionId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

const NodeColors = {
  trigger: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', icon: 'text-emerald-400', badge: 'bg-emerald-500' },
  action: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', icon: 'text-blue-400', badge: 'bg-blue-500' },
  condition: { bg: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/30', icon: 'text-violet-400', badge: 'bg-violet-500' },
  delay: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', icon: 'text-amber-400', badge: 'bg-amber-500' },
  filter: { bg: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', icon: 'text-cyan-400', badge: 'bg-cyan-500' },
};

export default function WorkflowCanvas({
  trigger,
  triggerIntegration,
  actions,
  conditions,
  integrations,
  onEditAction,
  onEditTrigger,
  onEditCondition,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showMiniMap, setShowMiniMap] = useState(true);

  const getIntegration = (id: string) => integrations.find((i: any) => i.id === id);
  const getTrigger = (integrationId: string) => {
    const integration = getIntegration(integrationId);
    return integration?.triggers?.find((t: any) => t.id === trigger?.triggerId);
  };
  const getAction = (integrationId: string, actionId: string) => {
    const integration = getIntegration(integrationId);
    return integration?.actions?.find((a: any) => a.id === actionId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 2));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const calculateNodePositions = () => {
    const nodes: Array<{ id: string; type: string; label: string; sublabel: string; icon: string; position: NodePosition; color: keyof typeof NodeColors }> = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const NODE_WIDTH = isMobile ? 240 : 280;
    const NODE_HEIGHT = isMobile ? 70 : 80;
    const SPACING_Y = isMobile ? 100 : 120;
    const START_Y = 60;
    const TRIGGER_X = isMobile ? 40 : 80;
    const ACTION_X = isMobile ? 300 : 400;
    const CONDITION_X = isMobile ? 560 : 720;

    // Trigger node
    if (trigger && triggerIntegration) {
      const triggerDef = getTrigger(trigger.integrationId);
      nodes.push({
        id: 'trigger',
        type: 'trigger',
        label: triggerIntegration.name,
        sublabel: triggerDef?.name || 'Trigger',
        icon: triggerIntegration.icon,
        position: { x: TRIGGER_X, y: START_Y + (actions.length * SPACING_Y) / 2 - NODE_HEIGHT / 2 },
        color: 'trigger',
      });
    }

    // Action nodes
    actions.forEach((action, index) => {
      const integration = getIntegration(action.integrationId);
      const actionDef = getAction(action.integrationId, action.actionId);
      if (integration && actionDef) {
        nodes.push({
          id: action.id,
          type: 'action',
          label: actionDef.name,
          sublabel: integration.name,
          icon: integration.icon,
          position: { x: ACTION_X, y: START_Y + index * SPACING_Y },
          color: 'action',
        });
      }
    });

    // Condition nodes
    conditions.forEach((condition, index) => {
      const isDelay = condition.type === 'delay';
      const isFilter = condition.type === 'filter';
      const color = isDelay ? 'delay' : isFilter ? 'filter' : 'condition';
      
      nodes.push({
        id: condition.id,
        type: condition.type,
        label: condition.type === 'delay' ? `Wait ${(condition.delayMs || 60000) / 1000}s` : 
               condition.type === 'filter' ? 'Filter' : 'Condition',
        sublabel: condition.field ? `${condition.field} ${condition.operator} ${condition.value}` : 'Configure condition',
        icon: condition.type === 'delay' ? '⏰' : condition.type === 'filter' ? '🔲' : '🔀',
        position: { x: CONDITION_X, y: START_Y + index * SPACING_Y },
        color,
      });
    });

    return nodes;
  };

  const nodes = calculateNodePositions();

  const renderConnections = () => {
    const connections: Array<{ from: NodePosition; to: NodePosition; fromId: string; toId: string }> = [];
    
    // Trigger to first action
    if (trigger && actions.length > 0) {
      const firstAction = nodes.find(n => n.id === actions[0].id);
      const triggerNode = nodes.find(n => n.id === 'trigger');
      if (firstAction && triggerNode) {
        connections.push({
          from: { x: triggerNode.position.x + 280, y: triggerNode.position.y + 40 },
          to: { x: firstAction.position.x, y: firstAction.position.y + 40 },
          fromId: 'trigger',
          toId: actions[0].id,
        });
      }
    }

    // Between actions
    for (let i = 0; i < actions.length - 1; i++) {
      const current = nodes.find(n => n.id === actions[i].id);
      const next = nodes.find(n => n.id === actions[i + 1].id);
      if (current && next) {
        connections.push({
          from: { x: current.position.x + 280, y: current.position.y + 40 },
          to: { x: next.position.x, y: next.position.y + 40 },
          fromId: actions[i].id,
          toId: actions[i + 1].id,
        });
      }
    }

    return connections;
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-white/5">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={zoomOut}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all backdrop-blur-sm"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 bg-slate-800/80 border border-white/10 rounded-lg text-sm text-white font-mono backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all backdrop-blur-sm"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all backdrop-blur-sm"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          className={`p-2 border rounded-lg transition-all backdrop-blur-sm ${
            showMiniMap ? 'bg-slate-700 text-white border-white/20' : 'bg-slate-800/80 text-slate-400 border-white/10 hover:text-white'
          }`}
          title="Toggle mini map"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="px-3 py-1.5 bg-slate-800/80 border border-white/10 rounded-lg text-xs text-slate-400 backdrop-blur-sm flex items-center gap-2">
          <Eye className="w-3 h-3" />
          Drag to pan • Scroll to zoom
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="canvas-background w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections().map((conn, i) => (
              <g key={i}>
                <path
                  d={`M ${conn.from.x} ${conn.from.y} C ${conn.from.x + 60} ${conn.from.y}, ${conn.to.x - 60} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
                  fill="none"
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-flow"
                />
                {/* Arrow head */}
                <circle cx={conn.to.x - 5} cy={conn.to.y} r="4" fill="#10b981" />
              </g>
            ))}
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node, index) => {
            const colors = NodeColors[node.color];
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`absolute bg-gradient-to-br ${colors.bg} backdrop-blur border ${colors.border} rounded-xl p-4 cursor-pointer hover:border-white/40 transition-all group`}
                style={{
                  width: 280,
                  left: node.position.x,
                  top: node.position.y,
                }}
                onClick={() => {
                  if (node.type === 'trigger' && onEditTrigger) onEditTrigger();
                  else if (node.type !== 'trigger' && node.type !== 'action' && onEditCondition) onEditCondition(node.id);
                  else if (onEditAction) onEditAction(node.id);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl ${colors.icon}`}>
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{node.label}</p>
                      {node.type === 'trigger' && (
                        <span className={`px-1.5 py-0.5 ${colors.badge} rounded text-[10px] text-white font-bold`}>T</span>
                      )}
                      {node.type === 'action' && (
                        <span className={`px-1.5 py-0.5 ${colors.badge} rounded text-[10px] text-white font-bold`}>{actions.findIndex(a => a.id === node.id) + 2}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{node.sublabel}</p>
                  </div>
                </div>

                {/* Hover edit indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No workflow yet</h3>
                <p className="text-sm text-slate-400">Configure your trigger to see the workflow flow</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Map */}
      {showMiniMap && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="text-xs text-slate-400 mb-2 font-medium">Overview</div>
          <div 
            className="relative bg-slate-800 rounded-lg overflow-hidden"
            style={{ width: 150, height: 100 }}
          >
            {/* Mini nodes */}
            <div 
              className="absolute w-3 h-2 bg-emerald-500/60 rounded-sm"
              style={{ left: 10, top: 10 }}
            />
            <div 
              className="absolute w-3 h-2 bg-blue-500/60 rounded-sm"
              style={{ left: 80, top: 30 }}
            />
            <div 
              className="absolute w-3 h-2 bg-blue-500/60 rounded-sm"
              style={{ left: 80, top: 60 }}
            />
            
            {/* Viewport indicator */}
            <div 
              className="absolute border border-white/30 bg-white/5"
              style={{
                left: `${Math.max(0, (pan.x / 800) * 100)}%`,
                top: `${Math.max(0, (pan.y / 600) * 100)}%`,
                width: `${(100 / zoom)}%`,
                height: `${(100 / zoom)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add Node Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30">
          <Plus className="w-4 h-4" />
          Add Node
        </button>
      </div>

      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
        .animate-flow {
          animation: flow 1s linear infinite;
        }
      `}</style>
    </div>
  );
}