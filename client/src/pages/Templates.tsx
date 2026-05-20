import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Loader2, Clock, Zap, CheckCircle2, Star,
  ArrowRight, Sparkles, ChevronRight, Bookmark, BookmarkCheck,
  Layers, GitBranch, BarChart3, Mail, Code, ShoppingCart, Calendar
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  popularity: number;
  isVerified: boolean;
  isNew: boolean;
  estimatedTime: string;
  trigger: any;
  actions: any[];
}

const categoryIcons: Record<string, any> = {
  Operations: Layers,
  Development: Code,
  Sales: BarChart3,
  Communication: Mail,
  Marketing: Star,
  Productivity: Zap,
  Social: Layers,
  Payment: BarChart3,
  Personal: Calendar,
};

const categoryColors: Record<string, string> = {
  Operations: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  Development: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  Sales: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
  Communication: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
  Marketing: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
  Productivity: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  Social: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
  Payment: 'from-green-500/20 to-green-600/5 border-green-500/20',
  Personal: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
};

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', categoryFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery) params.set('search', searchQuery);
      const response = await fetch(`/api/index?resource=templates&${params}`);
      return response.json();
    },
  });

  const templates: Template[] = data?.data?.templates || [];

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const toggleBookmark = (templateId: string) => {
    setBookmarkedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const useTemplate = (template: Template) => {
    navigate('/app/workflows/new', {
      state: {
        template: {
          name: template.name,
          description: template.description,
          trigger: template.trigger,
          actions: template.actions,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Templates</h1>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-slate-400">
            Start fast with pre-built workflows. {templates.length} templates available.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          {templates.filter(t => t.isVerified).length} verified templates
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Template */}
      {!searchQuery && categoryFilter === 'all' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 rounded-3xl border border-emerald-500/20 p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
              🚀
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">Featured</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">New Email to Notion Task</h2>
              <p className="text-slate-400 text-sm mb-4 max-w-xl">
                Create a Notion task whenever you receive an email from a specific sender. 
                Perfect for turning important emails into actionable tasks.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => useTemplate(templates[0])}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  Use Template
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 2 min
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" /> 2 steps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 animate-pulse">
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
      ) : templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5"
        >
          <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => {
            const CategoryIcon = categoryIcons[template.category] || Layers;
            const colorClass = categoryColors[template.category] || categoryColors.Operations;
            const isBookmarked = bookmarkedTemplates.includes(template.id);

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-gradient-to-br ${colorClass} rounded-2xl border p-6 hover:border-emerald-500/30 transition-all cursor-pointer`}
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {template.isNew && (
                    <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-semibold rounded-full">
                      NEW
                    </span>
                  )}
                  {template.isVerified && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800/80 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate pr-16">{template.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CategoryIcon className="w-3 h-3" />
                      {template.category}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{template.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {template.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {template.trigger ? 1 + template.actions.length : 0} steps
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    {template.popularity}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); useTemplate(template); }}
                    className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(template.id); }}
                    className={`p-2.5 rounded-xl transition-all ${
                      isBookmarked
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {selectedTemplate.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedTemplate.isVerified && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {selectedTemplate.isNew && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-semibold rounded-full">NEW</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedTemplate.name}</h2>
                    <p className="text-slate-400">{selectedTemplate.description}</p>
                  </div>
                </div>

                {/* Flow Preview */}
                <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4">WORKFLOW FLOW</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Trigger */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center text-lg">
                        {selectedTemplate.trigger?.integrationId?.includes('gmail') ? '📧' :
                         selectedTemplate.trigger?.integrationId?.includes('github') ? '🐙' :
                         selectedTemplate.trigger?.integrationId?.includes('hubspot') ? '🔷' :
                         selectedTemplate.trigger?.integrationId?.includes('schedule') ? '⏰' : '⚡'}
                      </div>
                      <div className="text-sm">
                        <div className="text-emerald-400 font-medium capitalize">{selectedTemplate.trigger?.integrationId?.replace('_', ' ')}</div>
                        <div className="text-slate-400 text-xs">{selectedTemplate.trigger?.triggerId?.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-slate-600" />

                    {/* Actions */}
                    {selectedTemplate.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/30 rounded-xl">
                        <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center text-lg">
                          {action?.integrationId?.includes('slack') ? '💬' :
                           action?.integrationId?.includes('notion') ? '📝' :
                           action?.integrationId?.includes('gmail') ? '📧' :
                           action?.integrationId?.includes('google_sheets') ? '📊' :
                           action?.integrationId?.includes('google_calendar') ? '📅' : '⚡'}
                        </div>
                        <div className="text-sm">
                          <div className="text-white font-medium capitalize">{action?.integrationId?.replace('_', ' ')}</div>
                          <div className="text-slate-400 text-xs">{action?.actionId?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{selectedTemplate.estimatedTime}</div>
                    <div className="text-xs text-slate-400">Setup Time</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      {selectedTemplate.popularity}
                    </div>
                    <div className="text-xs text-slate-400">Popularity</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{selectedTemplate.trigger ? 1 + selectedTemplate.actions.length : 0}</div>
                    <div className="text-xs text-slate-400">Steps</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { useTemplate(selectedTemplate); setSelectedTemplate(null); }}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Use This Template
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}