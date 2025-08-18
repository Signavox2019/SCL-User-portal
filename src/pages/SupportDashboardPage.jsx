import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BaseUrl from '../Api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AssignmentTurnedIn, Support, Visibility, ChevronLeft, ChevronRight } from '@mui/icons-material';
import dashboardPreloader from '../services/DashboardPreloader';

const SupportDashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [assignedTickets, setAssignedTickets] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [assignedError, setAssignedError] = useState(null);
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedRowsPerPage, setAssignedRowsPerPage] = useState(10);

  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.tickets)) return value.tickets;
    if (value && Array.isArray(value.docs)) return value.docs;
    return [];
  };
  const safeAssignedTickets = toArray(assignedTickets);
  const assignedTotalPages = Math.ceil(safeAssignedTickets.length / assignedRowsPerPage) || 1;
  const paginatedAssignedTickets = safeAssignedTickets.slice((assignedPage - 1) * assignedRowsPerPage, assignedPage * assignedRowsPerPage);

  useEffect(() => {
    const cacheKey = 'supportDashboard';
    const cachedData = dashboardPreloader.getCachedData(cacheKey);
    if (cachedData?.assignedTickets) {
      setAssignedTickets(toArray(cachedData.assignedTickets));
      setAssignedLoading(false);
      return;
    }

    const fetchAssignedTickets = async () => {
      setAssignedLoading(true);
      setAssignedError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseUrl}/tickets/my-assigned-tickets`, { headers: { Authorization: `Bearer ${token}` } });
        setAssignedTickets(toArray(res.data.tickets));
      } catch (_err) {
        setAssignedError('Failed to load assigned tickets');
        setAssignedTickets([]);
      } finally {
        setAssignedLoading(false);
      }
    };
    fetchAssignedTickets();

    return () => {
      dashboardPreloader.clearCacheEntry(cacheKey);
    };
  }, []);

  if (!user || user.role !== 'support') {
    return null;
  }

  const statusColors = {
    Pending: '#facc15',
    Open: '#38bdf8',
    Solved: '#4ade80',
    Closed: '#a3a3a3',
    Breached: '#f87171',
  };
  const priorityColors = {
    Critical: '#ef4444',
    High: '#f59e42',
    Medium: '#fbbf24',
    Low: '#4ade80',
  };
  const statusOrder = ['Pending', 'Open', 'Solved', 'Closed', 'Breached'];
  const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];

  const assignedStatusPie = statusOrder.map(status => ({
    name: status,
    value: safeAssignedTickets.filter(t => t.status === status).length,
  }));

  const assignedPriorityBar = priorityOrder.map(priority => ({
    name: priority,
    value: safeAssignedTickets.filter(t => t.priority === priority).length,
  }));

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'Solved': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'Closed': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'Breached': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
    }
  };

  return (
    <div className="space-y-10 pb-10 overflow-x-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 px-2 mt-4">
        {[{ label: 'Total Assigned', value: safeAssignedTickets.length, icon: <AssignmentTurnedIn fontSize="large" className="text-blue-300" />, gradient: 'from-blue-500/30 to-purple-500/30' }, ...statusOrder.map(status => ({ label: status, value: safeAssignedTickets.filter(t => t.status === status).length, icon: <Support fontSize="large" className="" style={{ color: statusColors[status] }} />, gradient: `from-[${statusColors[status]}]/30 to-purple-500/20` }))].map(card => (
          <div key={card.label} className={`group bg-gradient-to-br ${card.gradient} rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-white/10 to-transparent shadow-lg">
              {card.icon}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{card.value}</div>
            <div className="text-xs md:text-sm font-medium text-purple-200 mt-1 text-center">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 relative min-h-[320px]">
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
              <Support className="text-white text-2xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Assigned Tickets by Status</div>
              <div className="text-sm text-purple-100/80 mt-1">Distribution of your assigned tickets</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260} className="min-h-[230px]">
            <PieChart>
              <Pie data={assignedStatusPie} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
                {assignedStatusPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#a78bfa'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} tickets`, name]} />
              <Legend align="center" verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-2 bg-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 relative min-h-[320px]">
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-yellow-400 to-green-400 shadow-lg">
              <AssignmentTurnedIn className="text-white text-2xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Assigned Tickets by Priority</div>
              <div className="text-sm text-purple-100/80 mt-1">Distribution of your assigned tickets</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={290} className="min-h-[230px]">
            <BarChart data={assignedPriorityBar} margin={{ top: 30, right: 30, left: 0, bottom: 0 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa55" />
              <XAxis dataKey="name" stroke="#c4b5fd" tick={{ fontSize: 14, fill: '#c4b5fd', fontWeight: 600 }} />
              <YAxis stroke="#c4b5fd" allowDecimals={false} tick={{ fontSize: 14 }} />
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #a78bfa55' }} formatter={(value) => [value, 'Tickets']} cursor={{ fill: '#a78bfa22' }} />
              <Legend wrapperStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }} iconType="circle" />
              <Bar dataKey="value" radius={[16, 16, 0, 0]} label={{ position: 'top', fill: '#fff', fontWeight: 700, fontSize: 14 }}>
                {assignedPriorityBar.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={priorityColors[entry.name] || '#a78bfa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/40 to-blue-900/80 rounded-2xl p-6 shadow-2xl border border-white/10 min-h-[320px] flex flex-col mt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-white">My Assigned Tickets</h2>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 border border-white/10" onClick={() => navigate('/tickets')}>
            View All Tickets
          </button>
        </div>
        {assignedLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-purple-200">Loading tickets...</span>
          </div>
        ) : assignedError ? (
          <div className="text-center text-red-400 font-bold py-10">{assignedError}</div>
        ) : safeAssignedTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-purple-200/80 text-lg">No tickets assigned to you.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-blue-100 table-auto bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20 rounded-2xl">
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#312e81]/80 via-[#a78bfa33] to-[#0ea5e9]/30 text-purple-100 text-sm border-b border-[#312e81]/40">
                  <tr>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Ticket ID</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Priority</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Created By</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Created At</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-800/30">
                  {paginatedAssignedTickets.map(ticket => (
                    <tr key={ticket._id} className="hover:bg-purple-900/20 transition-colors duration-200 group">
                      <td className="px-3 py-2 font-mono text-purple-300 font-bold text-xs md:text-sm">{ticket.ticketId}</td>
                      <td className="px-3 py-2 max-w-xs break-words whitespace-normal">
                        <div className="font-semibold text-white text-sm line-clamp-1 truncate">{ticket.title}</div>
                        <div className="text-purple-200/70 text-xs line-clamp-2 whitespace-normal break-words">{ticket.description}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-xs break-words whitespace-normal">
                        <div className="font-semibold text-white text-xs line-clamp-1 truncate">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</div>
                        <div className="text-purple-200/70 text-xs break-all">{ticket.createdBy?.email}</div>
                      </td>
                      <td className="px-3 py-2 text-purple-200 text-xs md:text-sm">{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <button className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:bg-purple-500 transition-all duration-200 h-7 w-7 flex items-center justify-center" title="View Ticket" onClick={() => navigate(`/tickets?ticketId=${ticket.ticketId}`)}>
                          <Visibility fontSize="small" style={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 bg-transparent relative z-0 mt-4">
              <div className="flex-1" />
              <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                <div className="flex items-center gap-2">
                  <span className="text-purple-200/80 text-sm">Rows per page:</span>
                  <select value={assignedRowsPerPage} onChange={e => { setAssignedRowsPerPage(Number(e.target.value)); setAssignedPage(1); }} className="py-1 px-2 rounded bg-[#181a20] text-white border border-purple-700 text-sm">
                    {[5, 10, 25, 50, 100].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <span className="text-purple-200/80 text-sm">
                  Showing {safeAssignedTickets.length === 0 ? 0 : ((assignedPage - 1) * assignedRowsPerPage + 1)}-
                  {Math.min(assignedPage * assignedRowsPerPage, safeAssignedTickets.length)} of {safeAssignedTickets.length} tickets
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40" onClick={() => setAssignedPage(p => Math.max(1, p - 1))} disabled={assignedPage === 1}>
                    <ChevronLeft />
                  </button>
                  <span className="text-purple-200/80 text-sm">{assignedPage} / {assignedTotalPages}</span>
                  <button className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40" onClick={() => setAssignedPage(p => Math.min(assignedTotalPages, p + 1))} disabled={assignedPage === assignedTotalPages}>
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportDashboardPage;


