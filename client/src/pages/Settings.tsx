import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, CreditCard, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const plans = [
  { id: 'starter', name: 'Starter', price: 12, features: ['5 Active Workflows', '1,000 Runs/Month', 'Email Support'] },
  { id: 'pro', name: 'Pro', price: 29, features: ['Unlimited Workflows', '10,000 Runs/Month', 'Priority Support'], popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integrations'] },
];

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || 'Demo User', email: user?.email || '' });
  const [notifications, setNotifications] = useState({ email: true, slack: false, runs: true });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-xl w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-slate-800/30 border border-white/10 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Save Changes
              </button>
              {saveSuccess && <span className="text-emerald-400 text-sm">Saved!</span>}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h2>
            <p className="text-slate-400 mb-4">Add an extra layer of security to your account</p>
            <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all">
              Enable 2FA
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive updates via email</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`w-12 h-6 rounded-full transition-all ${notifications.email ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">Slack Notifications</p>
                <p className="text-sm text-slate-400">Get notified in Slack</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, slack: !notifications.slack })}
                className={`w-12 h-6 rounded-full transition-all ${notifications.slack ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.slack ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">Run Failures Only</p>
                <p className="text-sm text-slate-400">Only notify on failed runs</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, runs: !notifications.runs })}
                className={`w-12 h-6 rounded-full transition-all ${notifications.runs ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.runs ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'billing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
            <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 p-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white capitalize">{user?.plan || 'Pro'}</p>
                <p className="text-slate-400">${user?.plan === 'pro' ? 29 : 12}/month</p>
              </div>
              <button className="px-4 py-2 border border-emerald-500 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all">
                Upgrade Plan
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">All Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-slate-900/50 backdrop-blur rounded-2xl border p-6 ${plan.popular ? 'border-emerald-500/50 relative' : 'border-white/5'}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-semibold rounded-full">
                      Popular
                    </span>
                  )}
                  <p className="text-xl font-bold text-white">{plan.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    ${plan.price}<span className="text-lg text-slate-400">/mo</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${
                      plan.id === user?.plan ? 'border border-emerald-500 text-emerald-400 bg-emerald-500/10' : plan.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'border border-white/20 text-white hover:bg-white/5'
                    }`}
                  >
                    {plan.id === user?.plan ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}