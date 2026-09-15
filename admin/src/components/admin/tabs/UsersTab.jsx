import React from 'react';
import { Search, Download, Eye, Trash2 } from 'lucide-react';

export default function UsersTab({
  users = [],
  userSearchQuery,
  setUserSearchQuery,
  userRoleFilter,
  setUserRoleFilter,
  userPage,
  setUserPage,
  userItemsPerPage = 10,
  handleDownloadUsersCSV,
  handleViewUserDetails,
  handleDeleteUser
}) {
  const filteredUsers = users.filter(u => {
    const query = userSearchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phone && u.phone.toLowerCase().includes(query));

    const userRole = (u.role || 'CUSTOMER').toUpperCase();
    const matchesRole = userRoleFilter === 'ALL' || userRole === userRoleFilter || (userRoleFilter === 'USER' && (userRole === 'CUSTOMER' || userRole === 'USER'));

    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / userItemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * userItemsPerPage, userPage * userItemsPerPage);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-users-tab">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-white">User Directory & Customer Management</h3>
          <p className="text-xs text-slate-400">View customer profile details, order counts, and total spending.</p>
        </div>

        <button 
          onClick={handleDownloadUsersCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          data-reticle-target="admin-download-users-csv-btn"
        >
          <Download size={16} /> Download Users CSV Data
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3" data-reticle-target="admin-users-filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Customer Name, Email, Phone..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
              data-reticle-target="admin-user-search-input"
            />
          </div>

          {/* ROLE FILTER */}
          <div>
            <select 
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
              data-reticle-target="admin-user-role-select"
            >
              <option value="ALL">All Customer Roles ({users.length})</option>
              <option value="CUSTOMER">Customer (CUSTOMER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>
        </div>

        {(userSearchQuery || userRoleFilter !== 'ALL') && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-emerald-400 font-bold">
              Filtered {filteredUsers.length} customer{filteredUsers.length !== 1 ? 's' : ''} matching criteria
            </span>
            <button 
              onClick={() => {
                setUserSearchQuery('');
                setUserRoleFilter('ALL');
              }}
              className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              data-reticle-target="admin-reset-user-filters"
            >
              Reset All Filters ✕
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar" data-reticle-target="admin-users-table-container">
        <table className="w-full text-left text-xs min-w-[840px]">
          <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">User / Customer Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Role</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-slate-400">
                  No users or customers match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(u => {
                const isAdmin = (u.role || 'CUSTOMER').toUpperCase() === 'ADMIN' || (u.role || 'CUSTOMER').toUpperCase() === 'SUPER_ADMIN';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/50" data-reticle-target={`admin-user-row-${u.id}`}>
                    <td className="p-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                        isAdmin ? 'bg-amber-500 text-slate-950 font-black' : 'bg-emerald-800 text-emerald-200'
                      }`}>
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name || 'Customer Account'}</span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{u.email}</td>
                    <td className="p-3 text-slate-300 font-mono">{u.phone || 'N/A'}</td>
                    <td className="p-3">
                      {isAdmin ? (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                          👑 ADMIN
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-blue-300 border border-slate-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                          CUSTOMER
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-white">{u.total_orders || 0} Orders</td>
                    <td className="p-3 font-black text-emerald-400">₹{(u.total_spent || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-400">{new Date(u.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => handleViewUserDetails(u)}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          data-reticle-target={`admin-view-user-btn-${u.id}`}
                        >
                          <Eye size={13} /> View Details
                        </button>
                        {!isAdmin && handleDeleteUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold p-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Delete Customer Account"
                            data-reticle-target={`admin-delete-user-btn-${u.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800 text-xs font-medium text-slate-400" data-reticle-target="admin-users-pagination">
          <div>
            Showing <strong className="text-white">{(userPage - 1) * userItemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(userPage * userItemsPerPage, filteredUsers.length)}</strong> of <strong className="text-emerald-400">{filteredUsers.length}</strong> customers
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
              disabled={userPage === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-user-prev-page"
            >
              Previous
            </button>

            {Array.from({ length: totalUserPages }).map((_, i) => {
              const pg = i + 1;
              return (
                <button 
                  key={pg}
                  onClick={() => setUserPage(pg)}
                  className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    userPage === pg 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  data-reticle-target={`admin-user-page-${pg}`}
                >
                  {pg}
                </button>
              );
            })}

            <button 
              onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
              disabled={userPage >= totalUserPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl font-bold border border-slate-700 cursor-pointer"
              data-reticle-target="admin-user-next-page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
