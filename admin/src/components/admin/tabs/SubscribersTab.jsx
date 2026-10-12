import React, { useState } from 'react';
import { Mail, Download, Search, Trash2, RefreshCw, Calendar, Globe, Sparkles } from 'lucide-react';

export default function SubscribersTab({
  subscribers = [],
  setSubscribers,
  fetchSubscribers,
  adminFetch,
  showToast,
  askConfirmation
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const filteredSubscribers = (subscribers || []).filter(sub => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (sub.email && sub.email.toLowerCase().includes(q));
    const matchesSource = sourceFilter === 'ALL' || (sub.source || 'website').toLowerCase() === sourceFilter.toLowerCase();
    return matchesQuery && matchesSource;
  });

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      if (showToast) showToast('info', 'No Subscribers', 'No subscribers available to export.');
      return;
    }
    setIsExporting(true);
    try {
      const headers = ['ID', 'Email', 'Source', 'Subscribed Date'];
      const rows = subscribers.map(s => [
        s.id,
        `"${s.email}"`,
        `"${s.source || 'website'}"`,
        `"${s.created_at ? new Date(s.created_at).toLocaleString('en-IN') : 'N/A'}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `valuelife_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (showToast) showToast('success', 'CSV Exported', `Exported ${subscribers.length} subscriber emails successfully!`);
    } catch (err) {
      if (showToast) showToast('error', 'Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteSubscriber = (subscriber) => {
    if (!askConfirmation) return;
    askConfirmation({
      title: 'Remove Subscriber?',
      message: `Are you sure you want to remove "${subscriber.email}" from the newsletter list?`,
      confirmText: 'Remove',
      danger: true,
      onConfirm: async () => {
        try {
          const fetcher = adminFetch || fetch;
          const res = await fetcher(`/api/admin/newsletter/subscribers/${subscriber.id}`, { method: 'DELETE' });
          if (res.ok) {
            if (setSubscribers) setSubscribers(prev => prev.filter(s => s.id !== subscriber.id));
            if (showToast) showToast('info', 'Subscriber Removed', subscriber.email);
          } else {
            // Local fallback
            if (setSubscribers) setSubscribers(prev => prev.filter(s => s.id !== subscriber.id));
            if (showToast) showToast('info', 'Removed', subscriber.email);
          }
        } catch (err) {
          if (setSubscribers) setSubscribers(prev => prev.filter(s => s.id !== subscriber.id));
        }
      }
    });
  };

  return (
    <div className="space-y-6 w-full max-w-6xl" data-reticle-target="admin-subscribers-tab">
      {/* HEADER BAR */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            MARKETING & AUDIENCE
          </span>
          <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Mail size={22} className="text-amber-400" /> Newsletter Subscribers Hub ({subscribers.length})
          </h3>
          <p className="text-xs text-slate-400">
            View verified customer emails collected from the homepage & footer newsletter opt-in banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {fetchSubscribers && (
            <button
              type="button"
              onClick={fetchSubscribers}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Subscribers"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || subscribers.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            data-reticle-target="admin-export-subscribers-btn"
          >
            <Download size={16} />
            <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* STATS & SUMMARY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-amber-400">
            <Mail size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Subscribers</span>
            <span className="text-xl font-black text-white">{subscribers.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400">
            <Globe size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website Opt-Ins</span>
            <span className="text-xl font-black text-white">
              {subscribers.filter(s => (s.source || 'website').toLowerCase() === 'website').length}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-purple-400">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marketing Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              ● Ready for Campaigns
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search subscriber by email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Sources</option>
            <option value="website">Website Footer</option>
            <option value="checkout">Checkout Opt-in</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        {filteredSubscribers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Mail size={36} className="mx-auto text-slate-600" />
            <h4 className="text-base font-bold text-white">No Subscribers Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'No subscriber emails matched your search criteria.' : 'No customer emails have opted into the newsletter yet. They will appear here automatically when users subscribe.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Opt-In Source</th>
                  <th className="p-3.5">Subscribed At</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSubscribers.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      #{idx + 1}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-slate-800 text-amber-400 rounded-lg">
                          <Mail size={13} />
                        </span>
                        <span className="font-bold text-white font-mono text-xs selection:bg-emerald-500">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {sub.source || 'website'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>
                          {sub.created_at ? new Date(sub.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubscriber(sub)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
