import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
    Support as SupportIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    BugReport as BugIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    KeyboardArrowUp as PriorityHighIcon,
    KeyboardArrowDown as PriorityLowIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Forward as ForwardIcon,
    Update as UpdateIcon,
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    AttachFile as AttachFileIcon,
    Description as DescriptionIcon,
    Title as TitleIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import ReactDOM from 'react-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const statusOptions = ['Open', 'Pending', 'Solved', 'Closed', 'Breached'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, solved: 0, breached: 0, closed: 0, open: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ status: '', priority: '' });
    const [viewModal, setViewModal] = useState({ open: false, ticket: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, ticket: null });
    const [forwardModal, setForwardModal] = useState({ open: false, ticket: null, supportUserId: '' });
    const [updateModal, setUpdateModal] = useState({ open: false, ticket: null, status: '' });
    const [createModal, setCreateModal] = useState({ open: false, loading: false });
    const [supportMembers, setSupportMembers] = useState([]);
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const isAdmin = user && user.role === 'admin';
    const isSupport = user && user.role === 'support';
    const isUser = user && user.role === 'intern';

    // Create ticket form state
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        file: null
    });

    // Edit ticket modal state for intern
    const [editModal, setEditModal] = useState({ open: false, loading: false, ticket: null, form: { title: '', description: '', file: null } });

    // Open edit modal for intern
    const handleEditTicket = (ticket) => {
        setEditModal({
            open: true,
            loading: false,
            ticket,
            form: {
                title: ticket.title || '',
                description: ticket.description || '',
                file: null
            }
        });
    };

    // Handle file change for edit modal
    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size must be less than 10MB', 'error');
                return;
            }
            setEditModal(prev => ({ ...prev, form: { ...prev.form, file } }));
        }
    };

    // Remove file in edit modal
    const removeEditFile = () => {
        setEditModal(prev => ({ ...prev, form: { ...prev.form, file: null } }));
    };

    // Handle update ticket by intern
    const handleUpdateTicketByUser = async (e) => {
        e.preventDefault();
        setEditModal(prev => ({ ...prev, loading: true }));
        try {
            const token = validateToken();
            if (!token) {
                setEditModal(prev => ({ ...prev, loading: false }));
                return;
            }
            const formData = new FormData();
            formData.append('title', editModal.form.title);
            formData.append('description', editModal.form.description);
            if (editModal.form.file) {
                formData.append('file', editModal.form.file);
            }
            const response = await axios.put(
                `${BaseUrl}/tickets/${editModal.ticket._id}/update-by-user`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            if (response.data && response.data.ticket) {
                showToast(response.data.message || 'Ticket updated successfully!', 'success');
                setEditModal({ open: false, loading: false, ticket: null, form: { title: '', description: '', file: null } });
                setTickets(prev => prev.map(t => t._id === response.data.ticket._id ? response.data.ticket : t));
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update ticket', 'error');
        } finally {
            setEditModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Token validation helper
    const validateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Authentication required. Please login again.', 'error');
            // Optionally redirect to login page
            // window.location.href = '/login';
            return false;
        }
        return token;
    };

    // Handle create ticket
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setCreateModal(prev => ({ ...prev, loading: true }));

        try {
            const token = validateToken();
            if (!token) {
                setCreateModal(prev => ({ ...prev, loading: false }));
                return;
            }

            const formData = new FormData();
            formData.append('title', createForm.title);
            formData.append('description', createForm.description);
            formData.append('priority', 'Low'); // Default to Low for new tickets
            if (createForm.file) {
                formData.append('file', createForm.file);
            }

            const response = await axios.post(`${BaseUrl}/tickets/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success && response.data.ticket) {
                showToast('Ticket created successfully!', 'success');
                setCreateModal({ open: false, loading: false });
                setCreateForm({ title: '', description: '', file: null });
                setTickets(prev => [response.data.ticket, ...prev]);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to create ticket', 'error');
            }
        } finally {
            setCreateModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size must be less than 10MB', 'error');
                return;
            }
            setCreateForm(prev => ({ ...prev, file }));
        }
    };

    // Remove selected file
    const removeFile = () => {
        setCreateForm(prev => ({ ...prev, file: null }));
    };

    // Fetch tickets and stats
    const fetchTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = validateToken();
            if (!token) {
                setLoading(false);
                return;
            }

            if (isUser) {
                // For regular users, fetch their individual tickets and stats
                const [ticketsRes, statsRes] = await Promise.all([
                    axios.get(`${BaseUrl}/tickets/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${BaseUrl}/tickets/my-ticket-stats`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setTickets(ticketsRes.data);
                // Handle the different response format for individual stats
                if (statsRes.data.success && statsRes.data.data) {
                    setStats(statsRes.data.data);
                } else {
                    setStats({ total: 0, pending: 0, solved: 0, breached: 0, closed: 0, open: 0 });
                }
            } else {
                // For admin/support users, fetch all tickets and stats
                const [ticketsRes, statsRes] = await Promise.all([
                    axios.get(`${BaseUrl}/tickets/`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${BaseUrl}/tickets/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setTickets(ticketsRes.data);
                setStats(statsRes.data);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                showToast('Session expired. Please login again.', 'error');
            } else {
                setError(err.response?.data?.message || err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch support members for admin
    const fetchSupportMembers = async () => {
        if (!isAdmin) return;
        try {
            const token = validateToken();
            if (!token) return;

            const res = await axios.get(`${BaseUrl}/users/`, { headers: { 'Authorization': `Bearer ${token}` } });
            const supportUsers = res.data.filter(user => user.role === 'support' && user.isApproved);
            setSupportMembers(supportUsers);
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                console.error('Failed to fetch support members:', err);
            }
        }
    };

    // Handle forward ticket (admin only)
    const handleForwardTicket = async (e) => {
        e.preventDefault();
        try {
            const token = validateToken();
            if (!token) return;

            await axios.put(`${BaseUrl}/tickets/forward/${forwardModal.ticket._id}`,
                { supportUserId: forwardModal.supportUserId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            showToast('Ticket forwarded successfully!', 'success');
            setTimeout(() => {
                setForwardModal({ open: false, ticket: null, supportUserId: '' });
                setTickets(prev =>
                    prev.map(t =>
                        t._id === forwardModal.ticket._id
                            ? { ...t, forwardedTo: supportMembers.find(s => s._id === forwardModal.supportUserId) }
                            : t
                    )
                );
            }, 500);
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to forward ticket', 'error');
            }
        }
    };

    // Handle update ticket status (support only)
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            const token = validateToken();
            if (!token) return;
            const res = await axios.put(
                `${BaseUrl}/tickets/${updateModal.ticket._id}`,
                { status: updateModal.status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            showToast(res.data.message || 'Status updated successfully!', 'success');
            setUpdateModal({ open: false, ticket: null, status: '' });
            fetchTickets();
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to update status', 'error');
            }
        }
    };

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [barStats, setBarStats] = useState(null);
    const [barLoading, setBarLoading] = useState(false);
    const [donutStats, setDonutStats] = useState(null);
    const [donutLoading, setDonutLoading] = useState(false);

    // Fetch bar chart stats by month
    const fetchBarStats = async (month) => {
        setBarLoading(true);
        try {
            const token = validateToken();
            if (!token) return;
            const res = await axios.get(`${BaseUrl}/tickets/stats-by-month?month=${month}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.data.success) {
                setBarStats(res.data.data[month]);
            } else {
                setBarStats(null);
            }
        } catch (err) {
            setBarStats(null);
        } finally {
            setBarLoading(false);
        }
    };

    // Fetch donut chart stats (overall, same as metric cards)
    const fetchDonutStats = async () => {
        setDonutLoading(true);
        try {
            const token = validateToken();
            if (!token) return;
            let statsRes;
            if (isUser) {
                statsRes = await axios.get(`${BaseUrl}/tickets/my-ticket-stats`, { headers: { 'Authorization': `Bearer ${token}` } });
                setDonutStats(statsRes.data.data);
            } else {
                statsRes = await axios.get(`${BaseUrl}/tickets/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
                setDonutStats(statsRes.data);
            }
        } catch (err) {
            setDonutStats(null);
        } finally {
            setDonutLoading(false);
        }
    };

    // Fetch on mount and when selectedMonth changes
    useEffect(() => {
        if (isAdmin || isSupport) {
            fetchBarStats(selectedMonth);
        }
        // eslint-disable-next-line
    }, [selectedMonth, isAdmin, isSupport]);

    // Fetch donut stats only on mount or when user role changes
    useEffect(() => {
        if (isAdmin || isSupport) {
            fetchDonutStats();
        }
        // eslint-disable-next-line
    }, [isAdmin, isSupport]);

    useEffect(() => {
        fetchTickets();
        if (isAdmin) {
            fetchSupportMembers();
        }
    }, [isAdmin]);

    // Sort tickets by createdAt descending (newest first)
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter tickets
    const filteredTickets = sortedTickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
            ticket.description.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticketId.toLowerCase().includes(search.toLowerCase()) ||
            (ticket.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                (typeof ticket.createdBy === 'string' && ticket.createdBy.toLowerCase().includes(search.toLowerCase())));
        const matchesStatus = !filter.status || ticket.status === filter.status;
        const matchesPriority = !filter.priority || ticket.priority === filter.priority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Paginated tickets
    const paginatedTickets = filteredTickets.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.ceil(filteredTickets.length / rowsPerPage) || 1;

    const handleViewTicket = async (ticket) => {
        try {
            const token = validateToken();
            if (!token) return;
            const res = await axios.get(`${BaseUrl}/tickets/${ticket._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setViewModal({ open: true, ticket: res.data });
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                showToast('Failed to fetch ticket details', 'error');
            }
        }
    };

    const handleDeleteTicket = (ticket) => setDeleteConfirm({ open: true, ticket });
    const confirmDeleteTicket = async () => {
        try {
            const token = validateToken();
            if (!token) return;
            await axios.delete(`${BaseUrl}/tickets/${deleteConfirm.ticket._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            showToast('Ticket deleted successfully', 'success');
            setDeleteConfirm({ open: false, ticket: null });
            setTickets(prev => prev.filter(t => t._id !== deleteConfirm.ticket._id));
        } catch (err) {
            if (err.response?.status === 401) {
                showToast('Session expired. Please login again.', 'error');
            } else {
                showToast(err.response?.data?.message || 'Failed to delete ticket', 'error');
            }
        }
    };

    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message, { position: 'top-right', autoClose: 4000 });
        else if (type === 'error') toast.error(message, { position: 'top-right', autoClose: 4000 });
        else toast.info(message, { position: 'top-right', autoClose: 3000 });
    };

    // Icon/color helpers
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

    // Main render
    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                </div>
            ) : (
            <>
            {typeof document !== 'undefined' && ReactDOM.createPortal(
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 20000, position: 'fixed', top: 16, right: 16 }} />, document.body
            )}
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
                                    {isUser ? 'My Support Tickets' : 'Support Tickets'}
                                </h1>
                                <p className="text-sm md:text-lg text-purple-100/80 mt-1 md:mt-2">
                                    {isUser
                                        ? 'Track and manage your support requests efficiently!'
                                        : 'Manage and track support requests efficiently!'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Create Ticket Button - Show for all authenticated users */}
                        {user && (
                            <button
                                onClick={() => setCreateModal({ open: true, loading: false })}
                                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <AddIcon className="relative z-10 text-xl" />
                                <span className="relative z-10">Create Ticket</span>
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </button>
                        )}
                    </div>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-3 px-2">
                    <div className="group bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-purple-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Total' : 'Total'}</p>
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
                                <p className="text-cyan-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Open' : 'Open'}</p>
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
                                <p className="text-yellow-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Pending' : 'Pending'}</p>
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
                                <p className="text-green-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Solved' : 'Solved'}</p>
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
                                <p className="text-gray-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Closed' : 'Closed'}</p>
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
                                <p className="text-red-200 text-xs md:text-sm font-medium mb-1">{isUser ? 'My Breached' : 'Breached'}</p>
                                <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-300 transition-colors">{stats.breached}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110">
                                <BugIcon className="text-white text-lg md:text-xl" />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Charts for Admin/Support */}
                {(isAdmin || isSupport) && (
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 overflow-x-hidden">
                        {/* Bar Chart Card */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col items-center  relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center w-full justify-between gap-4">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Monthly Ticket Stats</h3>
                                    <p className="text-purple-200/80 text-sm">Bar chart for selected month</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="month"
                                        className="bg-purple-900/60 text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                                        value={selectedMonth}
                                        max={new Date().toISOString().slice(0, 7)}
                                        onChange={e => setSelectedMonth(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 w-full flex items-center justify-center  relative">
                                {barLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-2xl">
                                        <CircularProgress size={48} style={{ color: '#a78bfa' }} />
                                    </div>
                                ) : barStats ? (
                                    <Bar
                                        data={{
                                            labels: ['Total', 'Pending', 'Open', 'Solved', 'Closed', 'Breached'],
                                            datasets: [
                                                {
                                                    label: 'Tickets',
                                                    data: [
                                                        barStats.total || 0,
                                                        barStats.pending || 0,
                                                        barStats.open || 0,
                                                        barStats.solved || 0,
                                                        barStats.closed || 0,
                                                        barStats.breached || 0,
                                                    ],
                                                    backgroundColor: [
                                                        '#a78bfa', '#facc15', '#38bdf8', '#4ade80', '#a3a3a3', '#f87171',
                                                    ],
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: { enabled: true },
                                            },
                                            scales: {
                                                x: {
                                                    grid: { color: 'rgba(168,139,250,0.1)' },
                                                    ticks: { color: '#c4b5fd', font: { size: 14 } },
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: 'rgba(168,139,250,0.1)' },
                                                    ticks: { color: '#c4b5fd', font: { size: 14 } },
                                                },
                                            },
                                        }}
                                        height={220}
                                    />
                                ) : (
                                    <div className="text-purple-200/80 text-center w-full">No data for this month.</div>
                                )}
                            </div>
                        </div>
                        {/* Donut Chart Card */}
                        <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col items-center min-h-[340px] relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center w-full justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Overall Ticket Stats</h3>
                                    <p className="text-purple-200/80 text-sm">Donut chart for all tickets</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full flex items-center justify-center min-h-[220px] relative">
                                {donutLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-2xl">
                                        <CircularProgress size={48} style={{ color: '#f472b6' }} />
                                    </div>
                                ) : donutStats ? (
                                    <Doughnut
                                        data={{
                                            labels: ['Pending', 'Open', 'Solved', 'Closed', 'Breached'],
                                            datasets: [
                                                {
                                                    label: 'Tickets',
                                                    data: [
                                                        donutStats.pending || 0,
                                                        donutStats.open || 0,
                                                        donutStats.solved || 0,
                                                        donutStats.closed || 0,
                                                        donutStats.breached || 0,
                                                    ],
                                                    backgroundColor: [
                                                        '#facc15', '#38bdf8', '#4ade80', '#a3a3a3', '#f87171',
                                                    ],
                                                    borderWidth: 2,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: 'bottom',
                                                    labels: { color: '#c4b5fd', font: { size: 14 } },
                                                },
                                                tooltip: { enabled: true },
                                            },
                                        }}
                                        height={220}
                                    />
                                ) : (
                                    <div className="text-purple-200/80 text-center w-full">No data available.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Card Layer (like Users page) */}
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-10 overflow-x-hidden">
                    {/* Search & Filter */}
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 overflow-x-hidden">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={isUser ? "Search your tickets, titles, descriptions..." : "Search tickets, titles, descriptions..."}
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
                                    {!isUser && <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Created By</th>}
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Handled By</th>
                                    {/* <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Forwarded To</th> */}
                                    <th className="px-3 md:px-4 py-3 text-left text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal max-w-xs">Created At</th>
                                    <th className="px-3 md:px-4 py-3 text-center text-purple-200 font-bold text-xs md:text-sm break-words whitespace-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-800/30 overflow-x-hidden">
                                {loading ? (
                                    <tr>
                                        <td colSpan={isUser ? "7" : "8"} className="px-4 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <CircularProgress size={40} style={{ color: '#a78bfa' }} />
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={isUser ? "7" : "8"} className="px-4 py-12 text-center text-red-400 font-bold">{error}</td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={isUser ? "7" : "8"} className="px-4 py-12 text-center">
                                            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                <SupportIcon className="text-3xl md:text-4xl text-purple-300" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                                {isUser ? 'No Tickets Found' : 'No Tickets Found'}
                                            </h3>
                                            <p className="text-purple-200/80 text-sm md:text-base">
                                                {isUser ? 'You haven\'t created any tickets yet.' : 'Try adjusting your search or filters.'}
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
                                            {!isUser && (
                                                <td className="px-3 md:px-4 py-3 max-w-xs break-words whitespace-normal">
                                                    <div className="max-w-[120px] md:max-w-32">
                                                        <p className="text-white font-medium text-xs md:text-sm line-clamp-1 truncate">{typeof ticket.createdBy === 'object' ? ticket.createdBy?.firstName : 'N/A'}</p>
                                                        <p className="text-purple-200/70 text-xs truncate">{typeof ticket.createdBy === 'object' ? ticket.createdBy?.email : 'N/A'}</p>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-3 md:px-4 py-3 max-w-xs break-words whitespace-normal">
                                                {ticket.handledBy ? (
                                                    <div className="max-w-[120px] md:max-w-32">
                                                        <p className="text-white font-medium text-xs md:text-sm line-clamp-1 truncate">{ticket.handledBy.firstName}</p>
                                                        <p className="text-purple-200/70 text-xs truncate">{ticket.handledBy.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-purple-200/50 text-xs md:text-sm">Unassigned</span>
                                                )}
                                            </td>
                                            {/* <td className="px-3 md:px-4 py-3 max-w-xs break-words whitespace-normal">
                                                {ticket.forwardedTo ? (
                                                    <div className="max-w-[120px] md:max-w-32">
                                                        <p className="text-white font-medium text-xs md:text-sm line-clamp-1 truncate">{ticket.forwardedTo.firstName}</p>
                                                        <p className="text-purple-200/70 text-xs truncate">{ticket.forwardedTo.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-purple-200/50 text-xs md:text-sm">Not forwarded</span>
                                                )}
                                            </td> */}
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

                                                    {/* Admin: Forward button */}
                                                    {isAdmin && (
                                                        <button className="p-1 rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg hover:scale-110 hover:bg-teal-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="Forward Ticket" onClick={() => setForwardModal({ open: true, ticket, supportUserId: '' })}>
                                                            <ForwardIcon fontSize="small" style={{ fontSize: 16 }} />
                                                        </button>
                                                    )}

                                                    {/* Support: Update Status button */}
                                                    {isSupport && (
                                                        <button className="p-1 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg hover:scale-110 hover:bg-yellow-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="Update Status" onClick={() => setUpdateModal({ open: true, ticket, status: ticket.status })}>
                                                            <UpdateIcon fontSize="small" style={{ fontSize: 16 }} />
                                                        </button>
                                                    )}

                                                    {/* User: Edit and Delete buttons */}
                                                    {isUser && (
                                                        <>
                                                            <button className="p-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 hover:bg-pink-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="Edit Ticket" onClick={() => handleEditTicket(ticket)}>
                                                                <EditIcon fontSize="small" style={{ fontSize: 16 }} />
                                                            </button>
                                                            <button className="p-1 rounded-full bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg hover:scale-110 hover:bg-red-500 transition-all duration-200 h-6 w-6 md:h-7 md:w-7 flex items-center justify-center" title="Delete Ticket" onClick={() => handleDeleteTicket(ticket)}>
                                                                <DeleteIcon fontSize="small" style={{ fontSize: 16 }} />
                                                            </button>
                                                        </>
                                                    )}
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

                {/* Create Ticket Modal */}
                {createModal.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4 overflow-x-hidden">
                        <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setCreateModal({ open: false, loading: false })}><CloseIcon fontSize="large" /></button>
                            <form className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleCreateTicket}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <AddIcon className="text-white text-2xl" />
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
                                            value={createForm.title}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
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
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
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
                                                    onChange={handleFileChange}
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-purple-900/40 text-white border-2 border-dashed border-purple-400/30 hover:border-pink-400/50 hover:bg-purple-900/60 transition-all duration-200 cursor-pointer"
                                                >
                                                    <CloudUploadIcon className="text-purple-300" />
                                                    <span className="text-sm">Click to upload file (Max 10MB)</span>
                                                </label>
                                            </div>

                                            {createForm.file && (
                                                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                                                    <div className="flex items-center gap-2">
                                                        <AttachFileIcon className="text-green-400" />
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{createForm.file.name}</p>
                                                            <p className="text-green-200 text-xs">{(createForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                        onClick={removeFile}
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
                                        onClick={() => setCreateModal({ open: false, loading: false })}
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
                                                <AddIcon />
                                                Create Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}

                {/* View Ticket Modal */}
                {viewModal.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4 overflow-x-hidden">
                        <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setViewModal({ open: false, ticket: null })}><CloseIcon fontSize="large" /></button>
                            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-2 custom-scrollbar">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <SupportIcon className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">Ticket Details</h2>
                                        <p className="text-purple-200/80 text-sm">Complete information about this support ticket</p>
                                    </div>
                                </div>

                                {viewModal.ticket && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left Column - Basic Information */}
                                        <div className="space-y-6">
                                            {/* Ticket ID & Status */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                            <SupportIcon className="text-white text-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">Ticket Information</h3>
                                                            <p className="text-purple-200/70 text-sm">Basic details</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-purple-200 text-sm font-medium">Ticket ID:</span>
                                                        <span className="text-white font-mono font-bold text-lg">{viewModal.ticket.ticketId}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-purple-200 text-sm font-medium">Status:</span>
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(viewModal.ticket.status)}`}>
                                                            {getStatusIcon(viewModal.ticket.status)}
                                                            {viewModal.ticket.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-purple-200 text-sm font-medium">Priority:</span>
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getPriorityColor(viewModal.ticket.priority)}`}>
                                                            {getPriorityIcon(viewModal.ticket.priority)}
                                                            {viewModal.ticket.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title & Description */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <TitleIcon className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Content</h3>
                                                        <p className="text-purple-200/70 text-sm">Title and description</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-purple-200 text-sm font-medium mb-2 block">Title</label>
                                                        <div className="p-3 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                            <p className="text-white font-semibold">{viewModal.ticket.title}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-purple-200 text-sm font-medium mb-2 block">Description</label>
                                                        <div className="p-3 bg-purple-900/40 rounded-lg border border-purple-800/30 min-h-[80px]">
                                                            <p className="text-white whitespace-pre-wrap">{viewModal.ticket.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* File Attachment */}
                                            {viewModal.ticket.fileUrl && (
                                                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                            <AttachFileIcon className="text-white text-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">Attachment</h3>
                                                            <p className="text-purple-200/70 text-sm">Uploaded file</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                                                            <div className="flex items-center gap-3">
                                                                <AttachFileIcon className="text-green-400 text-xl" />
                                                                <div className="flex-1">
                                                                    <p className="text-white font-medium text-sm">File Attached</p>
                                                                    <p className="text-green-200 text-xs">Click to view</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={viewModal.ticket.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
                                                        >
                                                            <CloudUploadIcon />
                                                            View File
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column - User Information & Timeline */}
                                        <div className="space-y-6">
                                            {/* Created By */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                                        <PersonIcon className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Created By</h3>
                                                        <p className="text-purple-200/70 text-sm">Ticket creator information</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                                        <PersonIcon className="text-white text-xl" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-lg">
                                                            {viewModal.ticket.createdBy?.firstName || 'N/A'}
                                                        </p>
                                                        <p className="text-purple-200 text-sm">
                                                            {viewModal.ticket.createdBy?.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Handled By */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                        <PersonIcon className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Handled By</h3>
                                                        <p className="text-purple-200/70 text-sm">Support team member</p>
                                                    </div>
                                                </div>
                                                {viewModal.ticket.handledBy ? (
                                                    <div className="flex items-center gap-4 p-4 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                            <PersonIcon className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-semibold text-lg">{viewModal.ticket.handledBy.firstName}</p>
                                                            <p className="text-purple-200 text-sm">{viewModal.ticket.handledBy.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 p-4 bg-gray-500/20 rounded-lg border border-gray-400/30">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                                                            <PersonIcon className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-300 font-semibold text-lg">Unassigned</p>
                                                            <p className="text-gray-400 text-sm">No support member assigned yet</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Forwarded To */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                        <PersonIcon className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Forwarded To</h3>
                                                        <p className="text-purple-200/70 text-sm">Support member ticket was forwarded to</p>
                                                    </div>
                                                </div>
                                                {viewModal.ticket.forwardedTo ? (
                                                    <div className="flex items-center gap-4 p-4 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                            <PersonIcon className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-semibold text-lg">{viewModal.ticket.forwardedTo.firstName}</p>
                                                            <p className="text-purple-200 text-sm">{viewModal.ticket.forwardedTo.email}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 p-4 bg-gray-500/20 rounded-lg border border-gray-400/30">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                                                            <PersonIcon className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-300 font-semibold text-lg">Not forwarded</p>
                                                            <p className="text-gray-400 text-sm">No support member forwarded to yet</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timeline */}
                                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-800/30 backdrop-blur-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                                                        <CalendarIcon className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Timeline</h3>
                                                        <p className="text-purple-200/70 text-sm">Important dates</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 p-3 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                        <CalendarIcon className="text-purple-300" />
                                                        <div>
                                                            <p className="text-white font-semibold text-sm">Created</p>
                                                            <p className="text-purple-200 text-xs">{new Date(viewModal.ticket.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    {viewModal.ticket.updatedAt && (
                                                        <div className="flex items-center gap-3 p-3 bg-purple-900/40 rounded-lg border border-purple-800/30">
                                                            <CalendarIcon className="text-purple-300" />
                                                            <div>
                                                                <p className="text-white font-semibold text-sm">Last Updated</p>
                                                                <p className="text-purple-200 text-xs">{new Date(viewModal.ticket.updatedAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end">
                                    <button
                                        className="px-6 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                        onClick={() => setViewModal({ open: false, ticket: null })}
                                    >
                                        <CloseIcon />
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
                        <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
                            <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
                            <p className="text-purple-200 mb-6">Are you sure you want to delete the ticket <span className="font-bold text-pink-300">{deleteConfirm.ticket?.title}</span>?</p>
                            <div className="flex justify-end gap-3">
                                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setDeleteConfirm({ open: false, ticket: null })}>Cancel</button>
                                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={confirmDeleteTicket}>Delete</button>
                            </div>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}

                {/* Forward Ticket Modal */}
                {forwardModal.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
                        <div className="relative w-full max-w-md mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                            <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setForwardModal({ open: false, ticket: null, supportUserId: '' })}><CloseIcon fontSize="large" /></button>
                            <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleForwardTicket}>
                                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-glow">Forward Ticket</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-purple-200 mb-1 font-semibold">Ticket</label>
                                        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/30">
                                            <p className="text-white font-semibold">{forwardModal.ticket?.title}</p>
                                            <p className="text-purple-200 text-sm">{forwardModal.ticket?.ticketId}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-purple-200 mb-1 font-semibold">Forward to Support Member</label>
                                        <select
                                            value={forwardModal.supportUserId}
                                            onChange={(e) => setForwardModal(prev => ({ ...prev, supportUserId: e.target.value }))}
                                            required
                                            className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                                        >
                                            <option value="">Select Support Member</option>
                                            {supportMembers.map(member => (
                                                <option key={member._id} value={member._id} className="text-black bg-white">
                                                    {member.firstName} {member.lastName} ({member.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setForwardModal({ open: false, ticket: null, supportUserId: '' })}>Cancel</button>
                                    <button type="submit" className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300">Forward Ticket</button>
                                </div>
                            </form>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}

                {/* Update Status Modal */}
                {updateModal.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
                        <div className="relative w-full max-w-md mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                            <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setUpdateModal({ open: false, ticket: null, status: '' })}><CloseIcon fontSize="large" /></button>
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
                                    <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setUpdateModal({ open: false, ticket: null, status: '' })}>Cancel</button>
                                    <button type="submit" className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300">Update Status</button>
                                </div>
                            </form>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}

                {/* Edit Ticket Modal */}
                {editModal.open && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4">
                        <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
                            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setEditModal({ open: false, loading: false, ticket: null, form: { title: '', description: '', file: null } })}><CloseIcon fontSize="large" /></button>
                            <form className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleUpdateTicketByUser}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <EditIcon className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">Edit Ticket</h2>
                                        <p className="text-purple-200/80 text-sm">Update your ticket details below</p>
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
                                            value={editModal.form.title}
                                            onChange={e => setEditModal(prev => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
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
                                            value={editModal.form.description}
                                            onChange={e => setEditModal(prev => ({ ...prev, form: { ...prev.form, description: e.target.value } }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-purple-200 mb-2 font-semibold flex items-center gap-2">
                                            <AttachFileIcon className="text-purple-300" />
                                            Attachment (Optional)
                                        </label>
                                        <div className="space-y-3">
                                            {/* Show already uploaded file if present and no new file is selected */}
                                            {editModal.ticket && editModal.ticket.fileUrl && !editModal.form.file && (
                                                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-400/30 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <AttachFileIcon className="text-green-400" />
                                                        <div>
                                                            <p className="text-white font-medium text-sm">Existing File</p>
                                                            <a href={editModal.ticket.fileUrl} target="_blank" rel="noopener noreferrer" className="text-green-200 text-xs underline hover:text-green-300">View</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                    className="hidden"
                                                    id="edit-file-upload"
                                                    onChange={handleEditFileChange}
                                                />
                                                <label
                                                    htmlFor="edit-file-upload"
                                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-purple-900/40 text-white border-2 border-dashed border-purple-400/30 hover:border-pink-400/50 hover:bg-purple-900/60 transition-all duration-200 cursor-pointer"
                                                >
                                                    <CloudUploadIcon className="text-purple-300" />
                                                    <span className="text-sm">Click to upload file (Max 10MB)</span>
                                                </label>
                                            </div>
                                            {editModal.form.file && (
                                                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                                                    <div className="flex items-center gap-2">
                                                        <AttachFileIcon className="text-green-400" />
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{editModal.form.file.name}</p>
                                                            <p className="text-green-200 text-xs">{(editModal.form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                        onClick={removeEditFile}
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
                                        onClick={() => setEditModal({ open: false, loading: false, ticket: null, form: { title: '', description: '', file: null } })}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        disabled={editModal.loading}
                                    >
                                        {editModal.loading ? (
                                            <>
                                                <CircularProgress size={20} style={{ color: 'white' }} />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <EditIcon />
                                                Update Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>, document.getElementById('modal-root')
                )}
            </div>
            </>
            )}
        </>
    );
};

export default Tickets; 
