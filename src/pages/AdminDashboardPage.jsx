import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import axios from 'axios';
import {
  School,
  CheckCircle,
  Event as EventIcon,
  EmojiEvents,
  TrendingUp,
  LocalLibrary,
  AssignmentTurnedIn,
  Edit as EditIcon,
  Group,
  Dashboard as DashboardIcon,
  BarChart as RechartsBarChart,
  ChevronLeft,
  ChevronRight,
  MoreHoriz,
  Visibility,
  Search,
  Support,
} from '@mui/icons-material';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useNavigate } from 'react-router-dom';
import dashboardPreloader from '../services/DashboardPreloader';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const cardGradients = [
  'from-purple-400/30 to-purple-700/30', // Courses
  'from-blue-400/30 to-blue-700/30',    // Events
  'from-green-400/30 to-green-600/30',  // Enrollments
  'from-yellow-400/30 to-orange-400/30',// Interns
];

const iconBgGradients = [
  'from-purple-400 to-purple-700', // Courses
  'from-blue-400 to-blue-700',     // Events
  'from-green-400 to-green-600',   // Enrollments
  'from-yellow-400 to-orange-400', // Interns
];

const userPieColors = ['#a78bfa', '#f472b6', '#4ade80', '#facc15'];
// const userPieColors = ['#a78bfa', '#f472b6', '#4ade80', '#10b981'];
const eventBarColors = ['#a78bfa', '#f472b6', '#818cf8'];
const enrollBarColors = ['#34d399', '#fbbf24'];
// Update enrollPieColors to match eventBarColors
const enrollPieColors = ['#a78bfa', '#f472b6', '#818cf8'];


const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  // All useState/useEffect hooks must be at the top, before any early returns
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [enrollStats, setEnrollStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchStats, setBatchStats] = useState(null);
  const [professorStats, setProfessorStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchesError, setBatchesError] = useState(null);
  const [batchSearch, setBatchSearch] = useState("");
  const [batchPage, setBatchPage] = useState(1);
  const [batchPageSize, setBatchPageSize] = useState(10);
  const currentYear = new Date().getFullYear();
  const defaultStart = dayjs(`${currentYear}-01-01`);
  const defaultEnd = dayjs(`${currentYear}-12-31`);
  const [batchStartDate, setBatchStartDate] = useState(defaultStart);
  const [batchEndDate, setBatchEndDate] = useState(defaultEnd);
  const [recentTickets, setRecentTickets] = useState([]);
  // Support dashboard hooks (always call at top level)
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [assignedError, setAssignedError] = useState(null);
  // Assigned tickets pagination (define at top level)
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedRowsPerPage, setAssignedRowsPerPage] = useState(10);
  const assignedTotalPages = Math.ceil(assignedTickets.length / assignedRowsPerPage) || 1;
  const paginatedAssignedTickets = assignedTickets.slice((assignedPage - 1) * assignedRowsPerPage, assignedPage * assignedRowsPerPage);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check for preloaded data first based on user role
        const cacheKey = user?.role === 'support' ? 'supportDashboard' : 'adminDashboard';
        const cachedData = dashboardPreloader.getCachedData(cacheKey);

        if (cachedData) {
          console.log(`🚀 Using preloaded ${cacheKey} data`);
          setUserStats(cachedData.userStats);
          setCourseStats(cachedData.courseStats);
          setEnrollStats(cachedData.enrollStats);
          setEventStats(cachedData.eventStats);
          setBatchStats(cachedData.batchStats);
          setProfessorStats(cachedData.professorStats);
          setTicketStats(cachedData.ticketStats);

          // For support users, also set assigned tickets and batches
          if (user?.role === 'support' && cachedData.assignedTickets) {
            setAssignedTickets(cachedData.assignedTickets);
            setAssignedLoading(false);
          }
          if (user?.role === 'support' && cachedData.batches) {
            setBatches(cachedData.batches);
            setBatchesLoading(false);
          }

          setLoading(false);
          return;
        }

        // Optimized loading: Load critical stats first, then others
        const token = localStorage.getItem('token');
        
        // Load critical stats first (user, course, enrollment)
        const criticalStats = await Promise.all([
          axios.get(`${BaseUrl}/users/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BaseUrl}/courses/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BaseUrl}/enrollments/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        // Set critical stats immediately
        setUserStats(criticalStats[0].data);
        setCourseStats(criticalStats[1].data);
        setEnrollStats(criticalStats[2].data);
        
        // Stop loading spinner after critical stats are loaded
        setLoading(false);
        
        // Load remaining stats in background
        try {
          const [eventRes, batchRes, profRes, ticketRes] = await Promise.all([
            axios.get(`${BaseUrl}/events/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BaseUrl}/batches/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BaseUrl}/professors/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BaseUrl}/tickets/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          
          setEventStats(eventRes.data);
          setBatchStats(batchRes.data);
          setProfessorStats(profRes.data);
          setTicketStats(ticketRes.data);
        } catch (err) {
          console.error('Error loading secondary stats:', err);
          // Don't set error for secondary stats to avoid breaking the UI
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAllStats();

    // Cleanup function to clear cache when component unmounts
    return () => {
      const cacheKey = user?.role === 'support' ? 'supportDashboard' : 'adminDashboard';
      dashboardPreloader.clearCacheEntry(cacheKey);
    };
  }, [user?.role]);



  useEffect(() => {
    const fetchBatches = async () => {
      // Skip if data is already loaded from preloader
      if (batches.length > 0) return;

      setBatchesLoading(true);
      setBatchesError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseUrl}/batches/`, { headers: { Authorization: `Bearer ${token}` } });
        setBatches(res.data.batches || []);
      } catch (err) {
        setBatchesError(err.message);
      } finally {
        setBatchesLoading(false);
      }
    };
    fetchBatches();
  }, [batches.length]);

  useEffect(() => {
    if (user && user.role === 'support') {
      const fetchAssignedTickets = async () => {
        // Skip if data is already loaded from preloader
        if (assignedTickets.length > 0) return;

        setAssignedLoading(true);
        setAssignedError(null);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${BaseUrl}/tickets/my-assigned-tickets`, { headers: { Authorization: `Bearer ${token}` } });
          setAssignedTickets(res.data.tickets || []);
        } catch (err) {
          setAssignedError('Failed to load assigned tickets');
          setAssignedTickets([]);
        } finally {
          setAssignedLoading(false);
        }
      };
      fetchAssignedTickets();
    }
  }, [user, assignedTickets.length]);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-400 font-bold py-10">{error}</div>;
  if (!user) return <div className="text-center text-red-400 font-bold py-10">Unauthorized</div>;

  if (user.role === 'support') {
    // Pie chart and bar chart data for assigned tickets
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
      value: assignedTickets.filter(t => t.status === status).length
    }));
    const assignedPriorityBar = priorityOrder.map(priority => ({
      name: priority,
      value: assignedTickets.filter(t => t.priority === priority).length
    }));
    // Metric cards data
    const metricCards = [
      {
        label: 'Total Assigned',
        value: assignedTickets.length,
        icon: <AssignmentTurnedIn fontSize="large" className="text-blue-300" />,
        gradient: 'from-blue-500/30 to-purple-500/30',
      },
      ...statusOrder.map(status => ({
        label: status,
        value: assignedTickets.filter(t => t.status === status).length,
        icon: <Support fontSize="large" className="" style={{ color: statusColors[status] }} />,
        gradient: `from-[${statusColors[status]}]/30 to-purple-500/20`,
      })),
    ];
    // Helper for priority badge
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
      <>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-10 pb-10 overflow-x-hidden">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 px-2 mt-4">
              {metricCards.map((card, idx) => (
                <div key={card.label} className={`group bg-gradient-to-br ${card.gradient} rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-white/10 to-transparent shadow-lg">
                    {card.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{card.value}</div>
                  <div className="text-xs md:text-sm font-medium text-purple-200 mt-1 text-center">{card.label}</div>
                </div>
              ))}
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pie Chart - decrease width */}
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
                    <Pie
                      data={assignedStatusPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        value > 0
                          ? (
                            <tspan>
                              <tspan fontWeight="bold">{name}</tspan>
                              <tspan>: {value}</tspan>
                              <tspan> ({(percent * 100).toFixed(0)}%)</tspan>
                            </tspan>
                          )
                          : ''
                      }
                      labelStyle={{
                        fontSize: 14,
                        fill: '#fff',
                        fontWeight: 600,
                        textShadow: '0 1px 2px #312e81'
                      }}
                    >
                      {assignedStatusPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#a78bfa'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} tickets`, name]} />
                    <Legend
                      align="center"
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        marginTop: 10,
                      }}
                      payload={assignedStatusPie.map((item, i) => ({
                        id: item.name,
                        type: "circle",
                        value: `${item.name}`,
                        color: statusColors[item.name] || '#a78bfa'
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Bar Chart - increase width */}
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
            {/* Assigned Tickets Table */}
            <div className="bg-gradient-to-br from-blue-900/80 via-purple-900/40 to-blue-900/80 rounded-2xl p-6 shadow-2xl border border-white/10 min-h-[320px] flex flex-col mt-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-white">My Assigned Tickets</h2>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 border border-white/10"
                  onClick={() => navigate('/tickets')}
                >
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
              ) : assignedTickets.length === 0 ? (
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
                        {assignedTickets.map(ticket => (
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
                              <div className="text-purple-200/70 text-xs truncate">{ticket.createdBy?.email}</div>
                            </td>
                            <td className="px-3 py-2 text-purple-200 text-xs md:text-sm">{new Date(ticket.createdAt).toLocaleString()}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:bg-purple-500 transition-all duration-200 h-7 w-7 flex items-center justify-center"
                                title="View Ticket"
                                onClick={() => navigate(`/tickets?ticketId=${ticket.ticketId}`)}
                              >
                                <Visibility fontSize="small" style={{ fontSize: 16 }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination below table */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 bg-transparent relative z-0 mt-4">
                    <div className="flex-1" />
                    <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                      {/* Rows per page dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-purple-200/80 text-sm">Rows per page:</span>
                        <select
                          value={assignedRowsPerPage}
                          onChange={e => { setAssignedRowsPerPage(Number(e.target.value)); }}
                          className="py-1 px-2 rounded bg-[#181a20] text-white border border-purple-700 text-sm"
                        >
                          {[5, 10, 25, 50, 100].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      {/* Showing text */}
                      <span className="text-purple-200/80 text-sm">
                        Showing {assignedTickets.length === 0 ? 0 : ((assignedPage - 1) * assignedRowsPerPage + 1)}-
                        {Math.min(assignedPage * assignedRowsPerPage, assignedTickets.length)} of {assignedTickets.length} tickets
                      </span>
                      {/* Pagination */}
                      <div className="flex items-center gap-2">
                        <button
                          className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                          onClick={() => setAssignedPage(p => Math.max(1, p - 1))}
                          disabled={assignedPage === 1}
                        >
                          <ChevronLeft />
                        </button>
                        <span className="text-purple-200/80 text-sm">{assignedPage} / {Math.ceil(assignedTickets.length / assignedRowsPerPage)}</span>
                        <button
                          className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                          onClick={() => setAssignedPage(p => Math.min(Math.ceil(assignedTickets.length / assignedRowsPerPage), p + 1))}
                          disabled={assignedPage === Math.ceil(assignedTickets.length / assignedRowsPerPage)}
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  if (!userStats || !courseStats || !enrollStats || !eventStats) return null;

  // Metric cards: Courses, Events, Enrollments, Interns
  const metricCards = [
    {
      label: 'Total Interns',
      value: userStats.counts.interns,
      icon: EmojiEvents,
      iconBg: 'from-yellow-400 to-orange-400',
      iconColor: 'text-yellow-100',
      card: 'from-yellow-400/30 to-orange-400/30',
    },
    {
      label: 'Total Courses',
      value: courseStats.totalCourses,
      icon: School,
      iconBg: 'from-purple-400 to-purple-700',
      iconColor: 'text-purple-100',
      card: 'from-purple-400/30 to-purple-700/30',
    },
    {
      label: 'Total Events',
      value: eventStats.total,
      icon: EventIcon,
      iconBg: 'from-blue-400 to-blue-700',
      iconColor: 'text-blue-100',
      card: 'from-blue-400/30 to-blue-700/30',
    },
    {
      label: 'Total Enrollments',
      value: enrollStats.totalEnrollments,
      icon: CheckCircle,
      iconBg: 'from-green-400 to-green-600',
      iconColor: 'text-green-100',
      card: 'from-green-400/30 to-green-600/30',
    },
  ];

  // Users Pie Chart data
  const userPieData = [
    { name: 'Interns', value: userStats.counts.interns },
    { name: 'Professors', value: professorStats?.totalProfessors || 0 },
    { name: 'Admins', value: userStats.counts.admins },
    { name: 'Support', value: userStats.counts.supports },
  ];

  // Events Bar Chart data
  const eventBarData = [
    { name: 'Total', value: eventStats.total },
    { name: 'Upcoming', value: eventStats.upcoming },
    { name: 'Completed', value: eventStats.completed },
  ];

  // Enrollments Pie Chart data
  const enrollPieData = [
    { name: 'Enrollments', value: enrollStats.totalEnrollments },
    { name: 'Revenue', value: enrollStats.totalRevenue },
  ];



  // Filtered and paginated batches
  const filteredBatches = batches.filter(batch => {
    const s = batchSearch.trim().toLowerCase();
    if (!s) return true;
    return (
      batch.batchName?.toLowerCase().includes(s) ||
      batch.course?.title?.toLowerCase().includes(s) ||
      batch.professor?.name?.toLowerCase().includes(s) ||
      batch.professor?.email?.toLowerCase().includes(s)
    );
  });
  const totalBatchPages = Math.ceil(filteredBatches.length / batchPageSize) || 1;
  const paginatedBatches = filteredBatches.slice((batchPage - 1) * batchPageSize, batchPage * batchPageSize);

  // Prepare filtered batch monthly data based on selected date range
  let batchMonthlyData = [];
  if (batchStartDate && batchEndDate) {
    // Generate all months between start and end
    let months = [];
    let cursor = batchStartDate.startOf('month');
    const end = batchEndDate.endOf('month');
    while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
      months.push(cursor.format('YYYY-MM'));
      cursor = cursor.add(1, 'month');
    }
    const dataMap = (batchStats && batchStats.graphData && batchStats.graphData.batchesCreatedMonthly) ? batchStats.graphData.batchesCreatedMonthly : {};
    batchMonthlyData = months.map(month => ({
      month,
      count: dataMap[month] || 0,
      date: dayjs(`${month}-01`)
    }));
  }

  return (
    <div className="space-y-10 pb-10 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
          <DashboardIcon className="text-white text-4xl drop-shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Dashboard Overview</h1>
          <p className="text-lg text-purple-100/80 mt-2">All your platform stats at a glance!</p>
        </div>
      </div>

      {/* New Metric Cards Section - full width, responsive, gap below */}
      <div className="flex flex-col w-full mb-8 px-2 sm:px-2 lg:px-2 xl:px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 w-full">
          {/* Total Users Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-6 shadow-2xl bg-gradient-to-br from-blue-400/30 to-blue-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[160px] sm:min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-b-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <Group className="text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-5 sm:mt-6 lg:mt-8 xl:mt-10">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{userStats?.totalUsers ?? 0}</div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold mt-1 tracking-wide uppercase text-blue-100/90 text-center">Total Users</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-purple-100/90 font-semibold">Interns</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-yellow-300">{userStats?.counts?.interns ?? 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-purple-100/90 font-semibold">Admins</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-pink-300">{userStats?.counts?.admins ?? 0}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-purple-100/90 font-semibold">Support</span>
                    <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-green-300">
                      {userStats?.counts?.supports ?? '-'}
                    </span>
                  </div>
              </div>
            </div>
          </div>
          {/* Professors Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-6 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[160px] sm:min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <School className="text-base sm:text-lg lg:text-xl xl:text-2xl text-purple-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-5 sm:mt-6 lg:mt-8 xl:mt-10">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{professorStats?.totalProfessors ?? '-'}</div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold mt-1 tracking-wide uppercase text-purple-100/90 text-center">Professors</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Active</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-green-300">{professorStats?.activeProfessors ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-yellow-100/90 font-semibold">Inactive</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-yellow-300">{professorStats?.inactiveProfessors ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Events Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-6 shadow-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[160px] sm:min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-b-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <EventIcon className="text-base sm:text-lg lg:text-xl xl:text-2xl text-yellow-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-5 sm:mt-6 lg:mt-8 xl:mt-10">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{eventStats?.total ?? '-'}</div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold mt-1 tracking-wide uppercase text-green-100/90 text-center">Events</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Upcoming</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-green-300">{eventStats?.upcoming ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Completed</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-green-300">{eventStats?.completed ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Batches Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-6 shadow-2xl bg-gradient-to-br from-pink-400/30 to-pink-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[160px] sm:min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-b-lg bg-gradient-to-br from-pink-400 to-pink-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <TrendingUp className="text-base sm:text-lg lg:text-xl xl:text-2xl text-pink-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-5 sm:mt-6 lg:mt-8 xl:mt-10">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{batchStats?.summary?.totalBatches ?? '-'}</div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold mt-1 tracking-wide uppercase text-pink-100/90 text-center">Batches</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 xl:gap-4 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-blue-100/90 font-semibold">Active</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-blue-300">{batchStats?.summary?.activeBatches ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Completed</span>
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold text-green-300">{batchStats?.summary?.completedBatches ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Total Registrations Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <CheckCircle className="text-lg sm:text-xl lg:text-2xl text-green-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-6 sm:mt-8 lg:mt-10">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{(userStats?.counts?.approvedUsers ?? 0) + (userStats?.counts?.pendingApprovals ?? 0) + (userStats?.counts?.rejectedUsers ?? 0)}</div>
              <div className="text-xs sm:text-sm lg:text-lg font-bold mt-1 tracking-wide uppercase text-green-100/90 text-center">Registrations</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Approved</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-green-300">{userStats?.counts?.approvedUsers ?? 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-yellow-100/90 font-semibold">Pending</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-yellow-300">{userStats?.counts?.pendingApprovals ?? 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-red-100/90 font-semibold">Rejected</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-red-300">{userStats?.counts?.rejectedUsers ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tickets Card */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl bg-gradient-to-br from-red-400/30 to-red-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden min-h-[180px]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-b-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
              <Support className="text-lg sm:text-xl lg:text-2xl text-red-100 drop-shadow-lg" />
            </div>
            <div className="z-10 flex flex-col items-center mt-6 sm:mt-8 lg:mt-10">
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{ticketStats?.total ?? '-'}</div>
              <div className="text-xs sm:text-sm lg:text-lg font-bold mt-1 tracking-wide uppercase text-red-100/90 text-center">Tickets</div>
              <div className="flex gap-1 sm:gap-2 lg:gap-3 mt-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-red-100/90 font-semibold">Pending</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-red-300">{ticketStats?.pending ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-yellow-100/90 font-semibold">Open</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-yellow-300">{ticketStats?.open ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-green-100/90 font-semibold">Breached</span>
                  <span className="text-sm sm:text-lg lg:text-xl font-extrabold text-green-300">{ticketStats?.breached ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch and Professor Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-10">
        {/* Users Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 relative">
          {/* View Button */}
          <button
            onClick={() => navigate('/users')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 z-20 backdrop-blur-sm border border-white/20 hover:scale-110"
            title="View Users"
          >
            <Visibility className="text-lg" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4 w-full mb-4 sm:mb-6 -mt-4 sm:-mt-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
              <LocalLibrary className="text-white text-xl sm:text-2xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1 sm:mb-2">User Roles Distribution</div>
              <div className="text-xs sm:text-sm text-purple-100/80 mt-1">Breakdown of user roles</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280} className="min-h-[200px]">
            <PieChart className="w-full h-full ">
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {userPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={userPieColors[index % userPieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-base rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-base font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-lg font-bold text-gray-200">{value} users</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Batch Stats Bar Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full mb-4 sm:mb-6 mt-0 pt-0 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-blue-400 shadow-lg">
                <TrendingUp className="text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-lg" />
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1 sm:mb-2">Batches Created Monthly</div>
                <div className="text-xs sm:text-sm text-blue-100/80 mt-1">Number of batches created per month</div>
              </div>
            </div>
            {/* Date Range Picker - right aligned */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-end lg:ml-8">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start"
                  value={batchStartDate}
                  onChange={v => setBatchStartDate(v)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      sx: {
                        minWidth: { xs: 120, sm: 150 },
                        width: { xs: 100, sm: 120 },
                        bgcolor: 'rgba(49,17,136,0.85)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          color: '#fff !important',
                          fontWeight: 700,
                          fontSize: { xs: 11, sm: 13 },
                          borderColor: '#a78bfa',
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#fff !important',
                          fontWeight: 700,
                          fontSize: { xs: 11, sm: 13 },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a78bfa',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ec4899',
                        },
                        '& .MuiInputLabel-root': {
                          color: '#a78bfa',
                          fontWeight: 700,
                          fontSize: { xs: 10, sm: 12 },
                        },
                        '& .MuiInputLabel-shrink': {
                          color: '#ec4899',
                        },
                        '& .MuiOutlinedInput-input::placeholder': {
                          color: '#fff !important',
                          opacity: 1,
                        },
                      },
                      InputLabelProps: { style: { color: '#a78bfa', fontWeight: 700, fontSize: 12 } },
                      inputProps: { style: { color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' } },
                      placeholder: 'Start',
                      InputProps: {
                        sx: {
                          '& .MuiSvgIcon-root': { color: '#fff' }
                        }
                      },
                    }
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End"
                  value={batchEndDate}
                  onChange={v => setBatchEndDate(v)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      sx: {
                        minWidth: { xs: 120, sm: 150 },
                        width: { xs: 100, sm: 120 },
                        bgcolor: 'rgba(49,17,136,0.85)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          color: '#fff !important',
                          fontWeight: 700,
                          fontSize: { xs: 11, sm: 13 },
                          borderColor: '#a78bfa',
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#fff !important',
                          fontWeight: 700,
                          fontSize: { xs: 11, sm: 13 },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a78bfa',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#38bdf8',
                        },
                        '& .MuiInputLabel-root': {
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: { xs: 10, sm: 12 },
                        },
                        '& .MuiInputLabel-shrink': {
                          color: '#a78bfa',
                        },
                        '& .MuiOutlinedInput-input::placeholder': {
                          color: '#fff !important',
                          opacity: 1,
                        },
                      },
                      InputLabelProps: { style: { color: '#38bdf8', fontWeight: 700, fontSize: 12 } },
                      inputProps: { style: { color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' } },
                      placeholder: 'End',
                      InputProps: {
                        sx: {
                          '& .MuiSvgIcon-root': { color: '#fff' }
                        }
                      },
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260} className="min-h-[250px]">
            {batchMonthlyData.length > 0 ? (
              <BarChart data={batchMonthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }} barSize={40}>
                <defs>
                  <linearGradient id="batchBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa55" />
                <XAxis dataKey="month" stroke="#a78bfa" interval={0} angle={-20} textAnchor="end" height={50} tick={{ fontSize: 13, fill: '#fff', fontWeight: 600 }} />
                <YAxis stroke="#a78bfa" allowDecimals={false} tick={{ fontSize: 13 }} width={40} />
                <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #a78bfa55' }} formatter={(value) => [value, 'Batches']} cursor={{ fill: '#a78bfa22' }} />
                <Legend wrapperStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }} iconType="circle" />
                <Bar dataKey="count" fill="url(#batchBarGradient)" radius={[16, 16, 0, 0]} label={{ position: 'top', fill: '#fff', fontWeight: 700, fontSize: 14 }} />
              </BarChart>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 w-full text-white text-lg font-semibold opacity-60">No batch data available</div>
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        {/* Professor Stats Bar Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl relative">
          {/* View Button */}
          <button
            onClick={() => navigate('/professors')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 z-20 backdrop-blur-sm border border-white/20 hover:scale-110"
            title="View Professors"
          >
            <Visibility className="text-lg" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4 w-full mb-4 sm:mb-6 mt-0 pt-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
              <School className="text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1 sm:mb-2">Courses per Professor</div>
              <div className="text-xs sm:text-sm text-purple-100/80 mt-1">Number of courses handled by each professor</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260} className="min-h-[250px]">
            {professorStats && professorStats.allProfessorDetails && professorStats.allProfessorDetails.length > 0 ? (
              <BarChart data={professorStats.allProfessorDetails.map((prof) => ({ name: prof.name, Courses: prof.courseCount }))} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa55" />
                <XAxis dataKey="name" stroke="#a78bfa" interval={0} height={40} tick={{ fontSize: 13, fill: '#fff', fontWeight: 600 }} />
                <YAxis stroke="#a78bfa" allowDecimals={false} tick={{ fontSize: 13 }} width={40} />
                <Tooltip contentStyle={{ background: '#a78bfa', border: 'none', color: '#fff' }} formatter={(value) => [value, 'Courses']} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="Courses" fill="#a78bfa" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fff', fontWeight: 700 }} />
              </BarChart>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 w-full text-white text-lg font-semibold opacity-60">No professor data available</div>
            )}
          </ResponsiveContainer>
        </div>
        {/* Events Bar Chart */}
        <div className="bg-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 relative">
          {/* View Button */}
          <button
            onClick={() => navigate('/events')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 z-20 backdrop-blur-sm border border-white/20 hover:scale-110"
            title="View Events"
          >
            <Visibility className="text-lg" />
          </button>
          <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 w-full">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 shadow-lg">
              <EventIcon className="text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1 sm:mb-2">Event Stats</div>
              <div className="text-xs sm:text-sm text-blue-100/80 mt-1">Total, Upcoming, Completed</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200} className="min-h-[200px]">
            <BarChart data={eventBarData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa33" />
              <XAxis dataKey="name" stroke="#c4b5fd" height={20} />
              <YAxis stroke="#c4b5fd" allowDecimals={false} width={20} />
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }} />
              <Bar dataKey="value" label={{ position: 'top', fill: '#fff', fontWeight: 700 }}>
                {eventBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={eventBarColors[index % eventBarColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between w-full mt-4 px-2">
            <span className="text-xs font-bold text-purple-200">Total</span>
            <span className="text-xs font-bold text-blue-300">Upcoming</span>
            <span className="text-xs font-bold text-green-300">Completed</span>
          </div>
        </div>
      </div>



      {/* Batch Details Table Section */}
      <div className="rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-white/10 bg-gradient-to-br from-blue-900/80 via-purple-900/40 to-blue-900/80 mt-10 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-blue-400 shadow-lg">
              <TrendingUp className="text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Batch Details</div>
              <div className="text-xs sm:text-sm text-blue-100/80 mt-1">All batches in the system</div>
            </div>
          </div>
          {/* Search and View Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {/* Search Bar */}
            <div className="flex items-center bg-[#1a1536]/80 rounded-xl px-3 py-2 border border-[#312e81]/40 shadow-inner w-full sm:w-80">
              <Search className="text-purple-300 mr-2 text-lg" />
              <input
                type="text"
                placeholder="Search batches..."
                value={batchSearch}
                onChange={e => { setBatchSearch(e.target.value); setBatchPage(1); }}
                className="bg-transparent outline-none text-white placeholder-purple-200 w-full text-sm sm:text-base"
              />
            </div>
            {/* View Button */}
            <button
              onClick={() => navigate('/batch')}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
              title="View Batches"
            >
              <Visibility className="text-lg" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[500px] sm:min-w-[600px] lg:min-w-[700px] text-xs sm:text-sm text-left text-blue-100 table-auto bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#312e81]/80 via-[#a78bfa33] to-[#0ea5e9]/30 text-purple-100 text-xs sm:text-sm lg:text-base border-b border-[#312e81]/40">
              <tr>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-blue-200">Batch Name</th>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-purple-200">Course</th>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-blue-200">Professor</th>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-purple-100">Dates</th>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-blue-200">Users</th>
                <th className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-bold uppercase tracking-wider text-blue-200">Progress</th>
                {/* <th className="px-4 py-3 font-bold uppercase tracking-wider text-blue-200 text-center">Action</th> */}
              </tr>
            </thead>
            {batchesLoading ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                      <span className="ml-3 text-purple-200">Loading batches...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <>
                <tbody>
                  {batchesError ? (
                    <tr><td colSpan={6} className="text-center text-red-400 font-bold py-10">{batchesError}</td></tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#312e81]/30 flex items-center justify-center">
                        <TrendingUp className="text-4xl text-purple-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Batches Found</h3>
                      <p className="text-purple-200/80">No batch data available.</p>
                    </td></tr>
                  ) : (
                    paginatedBatches.map((batch) => (
                      <tr key={batch._id} className="hover:bg-gradient-to-r hover:from-pink-400/10 hover:to-blue-400/10 transition-all duration-200 border-b border-[#312e81]/40 last:border-b-0">
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 font-semibold text-white tracking-wide truncate" title={batch.batchName}>{batch.batchName}</td>
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-purple-100 truncate" title={batch.course?.title}>{batch.course?.title}</td>
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-blue-100 truncate" title={batch.professor?.name}>
                          <div className="font-semibold text-blue-100 text-xs sm:text-sm">{batch.professor?.name}</div>
                          <div className="text-xs text-blue-300 mt-1 truncate" title={batch.professor?.email}>{batch.professor?.email}</div>
                        </td>
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-purple-100 truncate text-xs sm:text-sm" title={`Start: ${batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'} | End: ${batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}`}>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}</td>
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-blue-200 font-bold text-center">{batch.users?.length || 0}</td>
                        <td className="px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-12 sm:w-16 lg:w-20 h-2 bg-[#312e81]/40 rounded-full overflow-hidden shadow-inner">
                              <div className="h-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 transition-all duration-700" style={{ width: `${batch.batchProgress?.percentage || 0}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-purple-100">{batch.batchProgress?.percentage || 0}%</span>
                          </div>
                        </td>
                        {/* <td className="px-4 py-3 text-center">
                          <button className="p-2 rounded-full bg-blue-800 hover:bg-blue-600 text-blue-200 hover:text-white shadow transition disabled:opacity-40 disabled:cursor-not-allowed">
                            <EditIcon />
                          </button>
                        </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
            {/* Table footer with pagination */}
            <tfoot>
              <tr>
                <td colSpan={8} className="px-4 py-2 bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20">
                  {filteredBatches.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 bg-transparent relative z-0 mt-4">
                      <div className="flex-1" />
                      <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                        {/* Rows per page dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-purple-200/80 text-sm">Rows per page:</span>
                          <select
                            value={batchPageSize}
                            onChange={e => { setBatchPageSize(Number(e.target.value)); setBatchPage(1); }}
                            className="py-1 px-2 rounded bg-[#181a20] text-white border border-purple-700 text-sm"
                          >
                            {[5, 10, 25, 50, 100].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        {/* Showing text */}
                        <span className="text-purple-200/80 text-sm">
                          Showing {filteredBatches.length === 0 ? 0 : ((batchPage - 1) * batchPageSize + 1)}-
                          {Math.min(batchPage * batchPageSize, filteredBatches.length)} of {filteredBatches.length} batches
                        </span>
                        {/* Pagination */}
                        <div className="flex items-center gap-2">
                          <button
                            className="p-0.5 rounded-full hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                            onClick={() => setBatchPage(p => Math.max(1, p - 1))}
                            disabled={batchPage === 1}
                          >
                            <ChevronLeft />
                          </button>
                          <span className="text-purple-200/80 text-sm">{batchPage} / {totalBatchPages}</span>
                          <button
                            className="p-0.5 rounded-full hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                            onClick={() => setBatchPage(p => Math.min(totalBatchPages, p + 1))}
                            disabled={batchPage === totalBatchPages}
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {/* Remove Batch Table Section */}
      {/* Remove Batch Stats Section - only keep metric cards and initial charts */}
      {/* Remove Professor Stats Section - only keep metric cards and initial charts */}
    </div>
  );
};

export default DashboardPage;