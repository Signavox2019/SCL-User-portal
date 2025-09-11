import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
    Support as SupportIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    Update as UpdateIcon,
    BugReport as BugIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    KeyboardArrowUp as PriorityHighIcon,
    KeyboardArrowDown as PriorityLowIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    AttachFile as AttachFileIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Title as TitleIcon,
    Description as DescriptionIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import ReactDOM from 'react-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const statusOptions = ['Open', 'Pending', 'Solved', 'Closed', 'Breached'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, solved: 0, breached: 0, closed: 0, open: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ status: '', priority: '' });
    const [viewModal, setViewModal] = useState({ open: false, ticket: null });
    const [updateModal, setUpdateModal] = useState({ open: false, ticket: null, status: '', loading: false });
    const [createModal, setCreateModal] = useState({ open: false, title: '', description: '', file: null, loading: false });
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Token validation helper
    const validateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Authentication required. Please login again.', 'error');
            return false;
        }
        return token;
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message, { position: 'top-right', autoClose: 4000 });
        else if (type === 'error') toast.error(message, { position: 'top-right', autoClose: 4000 });
        else toast.info(message, { position: 'top-right', autoClose: 3000 });
    };

    // Fetch assigned tickets
    const fetchAssignedTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = validateToken();
            if (!token) {
                setLoading(false);
                return;
            }

            console.log('Fetching assigned tickets from:', `${BaseUrl}/tickets/my-assigned-tickets`);

            const response = await axios.get(`${BaseUrl}/tickets/my-assigned-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Fetch tickets response:', response.data);

            if (response.data.success && response.data.tickets) {
                setTickets(response.data.tickets);
                // Calculate stats from the tickets
                const ticketStats = {
                    total: response.data.total || response.data.tickets.length,
                    open: response.data.tickets.filter(t => t.status === 'Open').length,
                    pending: response.data.tickets.filter(t => t.status === 'Pending').length,
                    solved: response.data.tickets.filter(t => t.status === 'Solved').length,
                    closed: response.data.tickets.filter(t => t.status === 'Closed').length,
                    breached: response.data.tickets.filter(t => t.status === 'Breached').length,
                };
                setStats(ticketStats);
            }
        } catch (err) {
            console.error('Fetch tickets error:', err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                showToast('Session expired. Please login again.', 'error');
            } else {
                setError(err.response?.data?.message || err.message);
                showToast(err.response?.data?.message || 'Failed to fetch assigned tickets', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle create ticket
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setCreateModal(prev => ({ ...prev, loading: true }));
        try {
            const token = validateToken();
            if (!token) return;

            const formData = new FormData();
            formData.append('title', createModal.title);
            formData.append('description', createModal.description);
            if (createModal.file) {
                formData.append('file', createModal.file);
            }

            console.log('Creating ticket with data:', {
                title: createModal.title,
                description: createModal.description,
                hasFile: !!createModal.file,
                endpoint: `${BaseUrl}/tickets`
            });

            const response = await axios.post(
                `${BaseUrl}/tickets`,
                formData,
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );

            console.log('Create ticket response:', response.data);

            if (response.data.success) {
                console.log('Ticket created successfully, showing success toast');
                showToast('Ticket created successfully!', 'success');
                setCreateModal({ open: false, title: '', description: '', file: null, loading: false });
                // Refresh tickets
                fetchAssignedTickets();
            } else {
                console.log('Ticket creation failed, showing error toast');
                showToast(response.data.message || 'Failed to create ticket', 'error');
            }
        } catch (err) {
            console.error('Create ticket error:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                showToast(err.response.data?.message || `Failed to create ticket: ${err.response.status}`, 'error');
            } else if (err.request) {
                showToast('Network error: Unable to reach the server', 'error');
            } else {
                showToast(err.message || 'Failed to create ticket', 'error');
            }
        } finally {
            setCreateModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Handle update ticket status
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setUpdateModal(prev => ({ ...prev, loading: true }));
        try {
            const token = validateToken();
            if (!token) return;

            console.log('Updating ticket status:', {
                ticketId: updateModal.ticket._id,
                newStatus: updateModal.status,
                endpoint: `${BaseUrl}/tickets/${updateModal.ticket._id}`
            });

            const response = await axios.put(
                `${BaseUrl}/tickets/${updateModal.ticket._id}`,
                { status: updateModal.status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            console.log('Update status response:', response.data);

            // Treat any 2xx response as success to avoid backend flag inconsistencies
            if ((response.status >= 200 && response.status < 300) || response.data?.success) {
                console.log('Status updated successfully, showing success toast');
                showToast(response.data?.message || 'Status updated successfully!', 'success');
                setUpdateModal({ open: false, ticket: null, status: '', loading: false });
                // Update the ticket in the list
                setTickets(prev => prev.map(t => 
                    t._id === updateModal.ticket._id 
                        ? { ...t, status: updateModal.status, updatedAt: new Date().toISOString() }
                        : t
                ));
                // Refresh stats
                fetchAssignedTickets();
            } else {
                console.log('Status update failed, showing error toast');
                showToast(response.data?.message || 'Failed to update ticket status', 'error');
            }
        } catch (err) {
            console.error('Update status error:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                showToast(err.response.data?.message || `Failed to update ticket status: ${err.response.status}`, 'error');
            } else if (err.request) {
                showToast('Network error: Unable to reach the server', 'error');
            } else {
                showToast(err.message || 'Failed to update ticket status', 'error');
            }
        } finally {
            setUpdateModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Handle view ticket
    const handleViewTicket = (ticket) => {
        setViewModal({ open: true, ticket });
    };

    // Filter tickets based on search and filters
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = !search || 
            ticket.title.toLowerCase().includes(search.toLowerCase()) ||
            ticket.description.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticketId.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = !filter.status || ticket.status === filter.status;
        const matchesPriority = !filter.priority || ticket.priority === filter.priority;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);

    // Chart data preparation
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

    const statusPieData = statusOrder.map(status => ({
        name: status,
        value: tickets.filter(t => t.status === status).length,
    }));

    const priorityBarData = priorityOrder.map(priority => ({
        name: priority,
        value: tickets.filter(t => t.priority === priority).length,
    }));

    // Monthly trend data (last 6 months)
    const getMonthlyTrendData = () => {
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const ticketsInMonth = tickets.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                return ticketDate >= monthStart && ticketDate <= monthEnd;
            }).length;
            
            months.push({
                name: monthName,
                tickets: ticketsInMonth
            });
        }
        return months;
    };

    const monthlyTrendData = getMonthlyTrendData();

    // Enhanced chart data with percentages
    const statusPieDataWithPercentage = statusPieData.map(item => ({
        ...item,
        percentage: tickets.length > 0 ? ((item.value / tickets.length) * 100).toFixed(1) : 0
    }));

    const priorityBarDataWithPercentage = priorityBarData.map(item => ({
        ...item,
        percentage: tickets.length > 0 ? ((item.value / tickets.length) * 100).toFixed(1) : 0
    }));

    // Helper functions for styling
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <ScheduleIcon className="text-blue-400" />;
            case 'Pending': return <ScheduleIcon className="text-yellow-400" />;
            case 'Solved': return <CheckCircleIcon className="text-green-400" />;
            case 'Closed': return <ErrorIcon className="text-gray-400" />;
            case 'Breached': return <ErrorIcon className="text-red-400" />;
            default: return <BugIcon className="text-purple-400" />;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'High':
            case 'Critical': return <PriorityHighIcon className="text-red-400" />;
            case 'Medium': return <WarningIcon className="text-yellow-400" />;
            case 'Low': return <PriorityLowIcon className="text-green-400" />;
            default: return <PriorityLowIcon className="text-gray-400" />;
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-500/20 text-red-300 border-red-400/30';
            case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
            case 'Low': return 'bg-green-500/20 text-green-300 border-green-400/30';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
        }
    };

    useEffect(() => {
        fetchAssignedTickets();
    }, []);

    // Main render
    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                </div>
            ) : (
            <>
            {/* ToastContainer removed here; use global container in App.jsx */}
            <div className="space-y-10 pb-10 mt-5 py-8 overflow-x-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl border border-white/10 -mt-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
                                <SupportIcon className="text-white text-3xl md:text-4xl drop-shadow-lg" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
                                    My Assigned Tickets
                                </h1>
                                <p className="text-sm md:text-lg text-purple-100/80 mt-1 md:mt-2">
                                    Manage and track tickets assigned to you efficiently!
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setCreateModal({ open: true, title: '', description: '', file: null, loading: false })}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                            >
                                <SupportIcon className="text-lg" />
                                Create Ticket
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-3 px-2">
                    <div className="group bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-purple-200 text-xs md:text-sm font-medium mb-1">Total Assigned</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <SupportIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-cyan-200 text-xs md:text-sm font-medium mb-1">Open</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">{stats.open}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <ScheduleIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-yellow-200 text-xs md:text-sm font-medium mb-1">Pending</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors">{stats.pending}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <WarningIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-green-200 text-xs md:text-sm font-medium mb-1">Solved</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-green-300 transition-colors">{stats.solved}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <CheckCircleIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-gray-500/20 via-slate-500/20 to-zinc-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-gray-200 text-xs md:text-sm font-medium mb-1">Closed</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-gray-300 transition-colors">{stats.closed}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <ErrorIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-red-200 text-xs md:text-sm font-medium mb-1">Breached</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-300 transition-colors">{stats.breached}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <BugIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                    {loading ? (
                        <>
                            <div className="md:col-span-1 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 relative min-h-[320px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                            </div>
                            <div className="md:col-span-2 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 relative min-h-[320px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Status Pie Chart */}
                            <div className="md:col-span-1 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 relative min-h-[320px]">
                        <div className="flex items-center gap-3 w-full mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
                                <SupportIcon className="text-white text-2xl drop-shadow-lg" />
                            </div>
                            <div>
                                <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Tickets by Status</div>
                                <div className="text-sm text-purple-100/80 mt-1">Distribution of assigned tickets</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={260} className="min-h-[230px]">
                            <PieChart>
                                <Pie 
                                    data={statusPieData} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={false} 
                                    outerRadius={100} 
                                    fill="#8884d8" 
                                    dataKey="value"
                                    animationDuration={1000}
                                    animationBegin={0}
                                >
                                    {statusPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#a78bfa'} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => {
                                        const item = statusPieDataWithPercentage.find(d => d.name === name);
                                        return [`${value} tickets (${item?.percentage}%)`, name];
                                    }} 
                                    contentStyle={{ 
                                        background: '#312e81', 
                                        border: 'none', 
                                        color: '#fff', 
                                        borderRadius: 12, 
                                        boxShadow: '0 2px 12px #a78bfa55' 
                                    }}
                                    cursor={{ fill: '#a78bfa22' }}
                                />
                                <Legend 
                                    align="center" 
                                    verticalAlign="bottom" 
                                    iconType="circle"
                                    wrapperStyle={{ color: '#fff', fontWeight: 600, fontSize: 14 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Priority Bar Chart */}
                    <div className="md:col-span-2 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 relative min-h-[320px]">
                        <div className="flex items-center gap-3 w-full mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-yellow-400 to-green-400 shadow-lg">
                                <BugIcon className="text-white text-2xl drop-shadow-lg" />
                            </div>
                            <div>
                                <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Tickets by Priority</div>
                                <div className="text-sm text-purple-100/80 mt-1">Distribution of assigned tickets</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={290} className="min-h-[230px]">
                            <BarChart 
                                data={priorityBarData} 
                                margin={{ top: 30, right: 30, left: 0, bottom: 0 }} 
                                barSize={40}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa55" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#c4b5fd" 
                                    tick={{ fontSize: 14, fill: '#c4b5fd', fontWeight: 600 }} 
                                />
                                <YAxis 
                                    stroke="#c4b5fd" 
                                    allowDecimals={false} 
                                    tick={{ fontSize: 14, fill: '#c4b5fd' }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#312e81', 
                                        border: 'none', 
                                        color: '#fff', 
                                        borderRadius: 12, 
                                        boxShadow: '0 2px 12px #a78bfa55' 
                                    }} 
                                    formatter={(value, name) => {
                                        const item = priorityBarDataWithPercentage.find(d => d.name === name);
                                        return [`${value} tickets (${item?.percentage}%)`, 'Tickets'];
                                    }} 
                                    cursor={{ fill: '#a78bfa22' }} 
                                />
                                <Legend 
                                    wrapperStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }} 
                                    iconType="circle" 
                                />
                                <Bar 
                                    dataKey="value" 
                                    radius={[16, 16, 0, 0]} 
                                    label={{ position: 'top', fill: '#fff', fontWeight: 700, fontSize: 14 }}
                                    animationDuration={1000}
                                    animationBegin={0}
                                >
                                    {priorityBarData.map((entry, index) => (
                                        <Cell key={`cell-bar-${index}`} fill={priorityColors[entry.name] || '#a78bfa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                        </>
                    )}
                </div>

                {/* Monthly Trend Chart */}
                {loading ? (
                    <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-8 flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-8">
                    <div className="flex items-center gap-3 w-full mb-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 shadow-lg">
                            <CalendarIcon className="text-white text-2xl drop-shadow-lg" />
                        </div>
                        <div>
                            <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Monthly Ticket Trends</div>
                            <div className="text-sm text-purple-100/80 mt-1">Ticket creation trends over the last 6 months</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300} className="min-h-[250px]">
                        <LineChart 
                            data={monthlyTrendData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa55" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#c4b5fd" 
                                tick={{ fontSize: 14, fill: '#c4b5fd', fontWeight: 600 }} 
                            />
                            <YAxis 
                                stroke="#c4b5fd" 
                                allowDecimals={false} 
                                tick={{ fontSize: 14, fill: '#c4b5fd' }} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#312e81', 
                                    border: 'none', 
                                    color: '#fff', 
                                    borderRadius: 12, 
                                    boxShadow: '0 2px 12px #a78bfa55' 
                                }} 
                                formatter={(value) => [value, 'Tickets']} 
                                cursor={{ fill: '#a78bfa22' }} 
                            />
                            <Legend 
                                wrapperStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }} 
                                iconType="circle" 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="tickets" 
                                stroke="#8b5cf6" 
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2, fill: '#a78bfa' }}
                                animationDuration={1000}
                                animationBegin={0}
                            />
                        </LineChart>
                                            </ResponsiveContainer>
                    </div>
                )}

                {/* Key Insights Summary - Removed as requested */}

                {/* Search and Filter Controls */}
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-10 overflow-x-hidden">
                    {/* Search & Filter */}
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 overflow-x-hidden">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search tickets by title, description, or ID..."
                                    className="w-full py-3 pl-12 pr-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white placeholder-purple-200/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg backdrop-blur-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 sm:flex-none sm:min-w-[160px]">
                                <select
                                    className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select backdrop-blur-sm"
                                    value={filter.status}
                                    onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="">All Status</option>
                                    {statusOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
                                </select>
                                <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
                            </div>
                            <div className="relative flex-1 sm:flex-none sm:min-w-[160px]">
                                <select
                                    className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select backdrop-blur-sm"
                                    value={filter.priority}
                                    onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
                                >
                                    <option value="">All Priority</option>
                                    {priorityOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
                                </select>
                                <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <style>{`
                    select.custom-select option { color: #111 !important; background: #fff !important; }
                    select.custom-select option:hover, select.custom-select option:focus, select.custom-select:focus option { background: #f3e8ff !important; color: #111 !important; }
                  `}</style>

                    {/* Tickets Table - Enhanced Responsive Design */}
                    <div className="rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 w-full mt-6 overflow-x-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                                <tr>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal">Ticket ID</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Title</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal">Status</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal">Priority</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Created By</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Created At</th>
                                    <th className="px-3 md:px-4 py-3 text-center text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-800/30 overflow-x-hidden">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <CircularProgress size={40} style={{ color: '#a78bfa' }} />
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-red-400 font-bold">{error}</td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center">
                                            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                <SupportIcon className="text-3xl md:text-4xl text-purple-300" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                                No Assigned Tickets Found
                                            </h3>
                                            <p className="text-purple-200/80 text-sm md:text-base">
                                                You don't have any tickets assigned to you yet.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTickets.map(ticket => (
                                        <tr key={ticket._id} className="hover:bg-purple-900/20 transition-colors duration-200 group">
                                            <td className="px-3 md:px-3 py-3 max-w-xs break-words whitespace-normal overflow-x-hidden">
                                                <span className="font-mono text-purple-300 font-bold text-xs md:text-sm">{ticket.ticketId}</span>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 max-w-xs break-words whitespace-normal">
                                                <div className="max-w-[200px] md:max-w-xs">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-semibold text-xs md:text-sm mb-1 line-clamp-1 truncate">{ticket.title}</h4>
                                                            <p className="text-purple-200/70 text-xs line-clamp-2 whitespace-normal break-words">{ticket.description}</p>
                                                        </div>
                                                        {ticket.fileUrl && (
                                                            <div className="flex-shrink-0">
                                                                <a href={ticket.fileUrl} target="_blank" rel="noopener noreferrer" title="View Attachment">
                                                                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center hover:bg-green-500/40 transition-colors">
                                                                        <AttachFileIcon className="text-green-400 text-xs" />
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                                    {getStatusIcon(ticket.status)}
                                                    <span className="hidden sm:inline">{ticket.status}</span>
                                                    <span className="sm:hidden">{ticket.status.charAt(0)}</span>
                                                </span>
                                            </td>
                                            <td className="px-2 md:px-1 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                                                    {getPriorityIcon(ticket.priority)}
                                                    <span className="hidden sm:inline">{ticket.priority}</span>
                                                    <span className="sm:hidden">{ticket.priority.charAt(0)}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-3 max-w-xs break-words whitespace-normal">
                                                <div className="max-w-[120px] md:max-w-32">
                                                    <p className="text-white font-medium text-xs md:text-sm line-clamp-1 truncate">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</p>
                                                    <p className="text-purple-200/70 text-xs truncate">{ticket.createdBy?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-4 py-3">
                                                <span className="text-purple-200 text-xs md:text-sm">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-3 md:px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:bg-purple-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="View Ticket" onClick={() => handleViewTicket(ticket)}>
                                                        <ViewIcon fontSize="small" style={{ fontSize: 16 }} />
                                                    </button>
                                                    <button className="p-1 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg hover:scale-110 hover:bg-yellow-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="Update Status" onClick={() => setUpdateModal({ open: true, ticket, status: ticket.status, loading: false })}>
                                                        <UpdateIcon fontSize="small" style={{ fontSize: 16 }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination below table */}
                    {filteredTickets.length > 0 && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 bg-transparent relative z-0 mt-4">
                            <div className="flex-1" />
                            <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                                {/* Rows per page dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-purple-200/80 text-sm">Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                        className="py-1 px-2 rounded bg-[#181a20] text-white border border-purple-700 text-sm"
                                    >
                                        {[5, 10, 25, 50, 100].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Showing text */}
                                <span className="text-purple-200/80 text-sm">
                                    Showing {filteredTickets.length === 0 ? 0 : ((page - 1) * rowsPerPage + 1)}-
                                    {Math.min(page * rowsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
                                </span>
                                {/* Pagination */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeftIcon />
                                    </button>
                                    <span className="text-purple-200/80 text-sm">{page} / {totalPages}</span>
                                    <button
                                        className="p-0.5 rounded-full  hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRightIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </>
            )}

            {/* View Ticket Modal */}
            {viewModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Ticket Details</h2>
                            <button
                                onClick={() => setViewModal({ open: false, ticket: null })}
                                className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        {viewModal.ticket && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-purple-200 text-sm font-medium">Ticket ID</label>
                                        <p className="text-white font-mono text-lg">{viewModal.ticket.ticketId}</p>
                                    </div>
                                    <div>
                                        <label className="text-purple-200 text-sm font-medium">Status</label>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(viewModal.ticket.status)}`}>
                                            {getStatusIcon(viewModal.ticket.status)}
                                            {viewModal.ticket.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-purple-200 text-sm font-medium">Priority</label>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getPriorityColor(viewModal.ticket.priority)}`}>
                                            {getPriorityIcon(viewModal.ticket.priority)}
                                            {viewModal.ticket.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-purple-200 text-sm font-medium">Created At</label>
                                        <p className="text-white">{new Date(viewModal.ticket.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm font-medium">Title</label>
                                    <p className="text-white text-lg font-semibold">{viewModal.ticket.title}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm font-medium">Description</label>
                                    <p className="text-white bg-purple-800/30 p-4 rounded-lg">{viewModal.ticket.description}</p>
                                </div>
                                <div>
                                    <label className="text-purple-200 text-sm font-medium">Created By</label>
                                    <div className="bg-purple-800/30 p-4 rounded-lg">
                                        <p className="text-white font-semibold">{viewModal.ticket.createdBy?.firstName} {viewModal.ticket.createdBy?.lastName}</p>
                                        <p className="text-purple-200">{viewModal.ticket.createdBy?.email}</p>
                                    </div>
                                </div>
                                {viewModal.ticket.fileUrl && (
                                    <div>
                                        <label className="text-purple-200 text-sm font-medium">Attachment</label>
                                        <div className="bg-purple-800/30 p-4 rounded-lg">
                                            <a href={viewModal.ticket.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                                                View Attachment
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {updateModal.open && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
                    <div className="relative w-full max-w-md mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                        <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                        <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setUpdateModal({ open: false, ticket: null, status: '', loading: false })}><CloseIcon fontSize="large" /></button>
                        <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleUpdateStatus}>
                            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-glow">Update Ticket Status</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-purple-200 mb-1 font-semibold">Ticket</label>
                                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/30">
                                        <p className="text-white font-semibold">{updateModal.ticket?.title}</p>
                                        <p className="text-purple-200 text-sm">{updateModal.ticket?.ticketId}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-purple-200 mb-1 font-semibold">Status</label>
                                    <select
                                        value={updateModal.status}
                                        onChange={(e) => setUpdateModal(prev => ({ ...prev, status: e.target.value }))}
                                        required
                                        className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                                    >
                                        <option value="">Select Status</option>
                                        {['Pending', 'Solved', 'Breached', 'Closed', 'Open'].map(opt => (
                                            <option key={opt} value={opt} className="text-black bg-white">{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setUpdateModal({ open: false, ticket: null, status: '', loading: false })}>Cancel</button>
                                <button type="submit" className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center" disabled={updateModal.loading}>
                                    {updateModal.loading ? (
                                        <>
                                            <CircularProgress size={20} style={{ color: 'white' }} />
                                            Updating...
                                        </>
                                    ) : (
                                        <>Update Status</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>, document.getElementById('modal-root')
            )}

            {/* Create Ticket Modal */}
            {createModal.open && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4 overflow-x-hidden">
                    <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                        <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                        <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setCreateModal({ open: false, title: '', description: '', file: null, loading: false })}><CloseIcon fontSize="large" /></button>
                        <form className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleCreateTicket}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <SupportIcon className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white">Create New Ticket</h2>
                                    <p className="text-purple-200/80 text-sm">Fill in the details below to create your support ticket</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-purple-200 mb-2 font-semibold flex items-center gap-2">
                                        <TitleIcon className="text-purple-300" />
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter a descriptive title for your ticket..."
                                        className="w-full py-3 px-4 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400/50 transition-all duration-200"
                                        value={createModal.title}
                                        onChange={(e) => setCreateModal(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 mb-2 font-semibold flex items-center gap-2">
                                        <DescriptionIcon className="text-purple-300" />
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Provide detailed information about your issue or request..."
                                        rows={4}
                                        className="w-full py-3 px-4 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400/50 transition-all duration-200 resize-none"
                                        value={createModal.description}
                                        onChange={(e) => setCreateModal(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 mb-2 font-semibold flex items-center gap-2">
                                        <AttachFileIcon className="text-purple-300" />
                                        Attachment (Optional)
                                    </label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                className="hidden"
                                                id="file-upload"
                                                onChange={e => setCreateModal(prev => ({ ...prev, file: e.target.files[0] || null }))}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-purple-900/40 text-white border-2 border-dashed border-purple-400/30 hover:border-pink-400/50 hover:bg-purple-900/60 transition-all duration-200 cursor-pointer"
                                            >
                                                <CloudUploadIcon className="text-purple-300" />
                                                <span className="text-sm">Click to upload file (Max 10MB)</span>
                                            </label>
                                        </div>

                                        {createModal.file && (
                                            <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                                                <div className="flex items-center gap-2">
                                                    <AttachFileIcon className="text-green-400" />
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{createModal.file.name}</p>
                                                        <p className="text-green-200 text-xs">{(createModal.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    onClick={() => setCreateModal(prev => ({ ...prev, file: null }))}
                                                    title="Remove file"
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 border border-white/10"
                                    onClick={() => setCreateModal({ open: false, title: '', description: '', file: null, loading: false })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={createModal.loading}
                                >
                                    {createModal.loading ? (
                                        <>
                                            <CircularProgress size={20} style={{ color: 'white' }} />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <SupportIcon />
                                            Create Ticket
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>, document.getElementById('modal-root')
            )}
        </>
    );
};

export default SupportTickets;
