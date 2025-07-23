import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { TrendingUp, Group, School, Person, CalendarToday, Quiz, Add, Search, Visibility, Edit, Delete, BarChart } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import BaseUrl from '../Api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';
// Add MUI DatePicker imports at the top
import * as dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
// Add new imports for certificate icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// Helper to ensure an array (avoids undefined/null errors)
const safeArray = (arr) => Array.isArray(arr) ? arr : [];

const getToken = () => localStorage.getItem('token');

function getBatchStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-500/80', text: 'text-blue-100' };
    if (now > end) return { label: 'Completed', color: 'bg-green-500/80', text: 'text-green-100' };
    return { label: 'Active', color: 'bg-pink-500/80', text: 'text-pink-100' };
}

const initialForm = {
    batchName: '',
    course: '',
    users: [],
    professor: '',
    startDate: '',
    endDate: '',
    quizzes: [],
    events: [],
    completedModules: [],
    completedLessons: [],
    completedTopics: [],
    markAsCompleted: false,
};

const BatchAdmin = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    // Add state for view modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewBatch, setViewBatch] = useState(null);
    // New state for fetched data
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [fetchingDropdowns, setFetchingDropdowns] = useState(true);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableUsersLoading, setAvailableUsersLoading] = useState(false);
    // Add state for selected course details
    const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [formErrors, setFormErrors] = useState({});

    // Rows per page state
    const [rowsPerPage, setRowsPerPage] = useState(10); // default 10
    const [viewUsersPage, setViewUsersPage] = useState(1); // for user pagination in view modal
    const USERS_PER_PAGE = 5;
    // --- Add state for certificate stats for all batches ---
    const [batchCertificateStats, setBatchCertificateStats] = useState({}); // { [batchId]: { issuedCount, totalUsers, ... } }
    const [batchCertificateStatsLoading, setBatchCertificateStatsLoading] = useState(true);
    const [batchCertificateStatsError, setBatchCertificateStatsError] = useState('');
    const [sendingCertificateBatchId, setSendingCertificateBatchId] = useState(null);
    const [certificatesSentBatches, setCertificatesSentBatches] = useState([]);
    useEffect(() => {
        const fetchBatchCertStats = async () => {
            setBatchCertificateStatsLoading(true);
            setBatchCertificateStatsError('');
            try {
                const token = getToken();
                const res = await axios.get(`${BaseUrl}/batches/batch-certificates/stats/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Map by batchId for easy lookup
                const statsMap = {};
                (res.data.data || []).forEach(batch => {
                    statsMap[batch.batchId] = batch;
                });
                setBatchCertificateStats(statsMap);
            } catch (err) {
                setBatchCertificateStatsError(err.response?.data?.message || 'Failed to fetch certificate stats');
            } finally {
                setBatchCertificateStatsLoading(false);
            }
        };
        fetchBatchCertStats();
    }, []);
    // --- Add handler for sending certificates ---
    const handleSendCertificates = async (batchId) => {
        setSendingCertificateBatchId(batchId);
        try {
            const token = getToken();
            const res = await axios.post(`${BaseUrl}/batches/send-certificates/`, { batchId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(res.data.message || 'Certificates sent!');
            setCertificatesSentBatches((prev) => [...prev, batchId]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send certificates');
        } finally {
            setSendingCertificateBatchId(null);
        }
    };
    // Reset page when opening new batch
    useEffect(() => { setViewUsersPage(1); }, [viewBatch]);

    // Filtered batches
    const filteredBatches = batches.filter(batch => {
        const s = search.trim().toLowerCase();
        if (!s) return true;
        let batchName = (batch.batchName || '').toLowerCase();
        let courseTitle = '';
        if (batch.course && batch.course.title) {
            courseTitle = batch.course.title.toLowerCase();
        }
        let professorName = '';
        if (batch.professor && batch.professor.name) {
            professorName = batch.professor.name.toLowerCase();
        }
        return (
            batchName.includes(s) ||
            courseTitle.includes(s) ||
            professorName.includes(s)
        );
    });

    const totalPages = Math.ceil(filteredBatches.length / rowsPerPage);
    const paginatedBatches = filteredBatches.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Fetch all batches (new API structure)
    const fetchBatches = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const res = await axios.get(`${BaseUrl}/batches/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBatches(res.data.batches || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    // Fetch dropdown data on mount
    useEffect(() => {
        const fetchDropdowns = async () => {
            setFetchingDropdowns(true);
            try {
                const token = getToken();
                const [coursesRes, usersRes, profsRes] = await Promise.all([
                    axios.get(`${BaseUrl}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BaseUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BaseUrl}/professors`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setCourses(coursesRes.data);
                setUsers(usersRes.data.filter(u => u.role === 'intern'));
                setProfessors(profsRes.data);
            } catch (err) {
                toast.error('Failed to fetch dropdown data');
            } finally {
                setFetchingDropdowns(false);
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchBatches();
    }, []);

    // Fetch available users for selected course (create) or user breakdown (edit)
    useEffect(() => {
        if (!form.course) {
            setAvailableUsers([]);
            return;
        }
        const fetchUsers = async () => {
            setAvailableUsersLoading(true);
            try {
                const token = getToken();
                const res = await axios.get(
                    `${BaseUrl}/batches/available-users/${form.course}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAvailableUsers(res.data.users || []);
            } catch (err) {
                setAvailableUsers([]);
                toast.error('Failed to fetch users for this course');
            } finally {
                setAvailableUsersLoading(false);
            }
        };
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.course]);

    // Fetch course details when course changes in edit modal
    useEffect(() => {
        if (form.course && courses.length > 0) {
            const course = courses.find(c => c._id === form.course || c.id === form.course);
            setSelectedCourseDetails(course || null);
        } else {
            setSelectedCourseDetails(null);
        }
    }, [form.course, courses]);

    // Modal close on ESC or background click
    useEffect(() => {
        if (!modalOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') setModalOpen(false); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [modalOpen]);

    // Open modal for create
    const openCreateModal = () => {
        setForm(initialForm);
        setModalOpen(true);
        setSelectedBatchId(null);
    };

    // Handler to open view modal (updated to fetch full details with new API response)
    const [viewModalLoading, setViewModalLoading] = useState(false); // Add loading state for view modal
    const openViewModal = async (batch) => {
        setViewModalLoading(true);
        setViewModalOpen(true);
        setViewBatchCertificateStats(null);
        setViewBatchCertificateStatsLoading(true);
        setViewBatchCertificateStatsError('');
        try {
            const token = getToken();
            const res = await axios.get(`${BaseUrl}/batches/${batch._id || batch.batchId || batch.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setViewBatch({
                ...res.data.batch,
                _apiMessage: res.data.message,
                _progress: res.data.progress,
            });
            // Fetch certificate stats for this batch
            const certRes = await axios.get(`${BaseUrl}/batches/batch-certificates/stats/${batch._id || batch.batchId || batch.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setViewBatchCertificateStats(certRes.data);
        } catch (err) {
            toast.error('Failed to fetch batch details');
            setViewModalOpen(false);
            setViewBatchCertificateStatsError(err.response?.data?.message || 'Failed to fetch certificate stats');
        } finally {
            setViewModalLoading(false);
            setViewBatchCertificateStatsLoading(false);
        }
    };
    // Handler to close view modal
    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewBatch(null);
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle users (comma separated for demo)
    const handleUsersChange = (e) => {
        setForm((prev) => ({ ...prev, users: e.target.value.split(',').map(u => u.trim()) }));
    };

    // Create batch
    const handleCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const token = getToken();
            // Only send required fields
            const payload = {
                batchName: form.batchName,
                course: form.course,
                users: (form.users || []).map(u => typeof u === 'object' && u._id ? u._id : u),
                professor: form.professor,
                startDate: form.startDate,
                endDate: form.endDate,
            };
            await axios.post(`${BaseUrl}/batches/`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Batch created successfully!');
            setModalOpen(false);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        } finally {
            setModalLoading(false);
        }
    };

    // Delete batch
    const handleDelete = async (batchId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (!result.isConfirmed) return;
        setDeleteLoading(true);
        try {
            const token = getToken();
            await axios.delete(`${BaseUrl}/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire('Deleted!', 'Batch has been deleted.', 'success');
            fetchBatches();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to delete batch', 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Metrics
    const totalBatches = batches.length;
    const totalUsers = batches.reduce((acc, b) => acc + (b.users?.length || 0), 0);
    const totalProfessors = new Set(batches.map(b => b.professor?._id)).size;
    const totalCourses = new Set(batches.map(b => b.course?._id)).size;

    // Helper: Calculate batch progress (for demo, percent of users with quizzes or just users count)
    function getBatchProgress(batch) {
        // Example: percent of users who have at least one quiz (or just users count for now)
        if (!batch.users || batch.users.length === 0) return 0;
        // If you have per-user progress, use it here. For now, fake as 100% if quizzes exist, else 50% if users exist
        if (batch.quizzes && batch.quizzes.length > 0) return 100;
        return 50;
    }

    // New state for batch stats
    const [batchStats, setBatchStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');
    // New state for monthly batch counts (date-range API)
    const [monthlyBatchCounts, setMonthlyBatchCounts] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(true);
    const [monthlyError, setMonthlyError] = useState('');
    // Default to current year Jan 1 and Dec 31
    const currentYear = new Date().getFullYear();
    const pad = n => n.toString().padStart(2, '0');
    const defaultStart = `${currentYear}-01-01`;
    const defaultEnd = `${currentYear}-12-31`;
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);

    // Fetch /batches/stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            setStatsError('');
            try {
                const token = getToken();
                const res = await axios.get(`${BaseUrl}/batches/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBatchStats(res.data);
            } catch (err) {
                setStatsError(err.response?.data?.message || err.message || 'Failed to fetch stats');
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Fetch /batches/date-range for monthly batch counts
    useEffect(() => {
        const fetchMonthly = async () => {
            setMonthlyLoading(true);
            setMonthlyError('');
            try {
                const token = getToken();
                const res = await axios.get(`${BaseUrl}/batches/date-range?startDate=${startDate}&endDate=${endDate}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMonthlyBatchCounts(res.data.data || []);
            } catch (err) {
                setMonthlyError(err.response?.data?.message || err.message || 'Failed to fetch monthly batch counts');
            } finally {
                setMonthlyLoading(false);
            }
        };
        fetchMonthly();
    }, [startDate, endDate]);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editModalLoading, setEditModalLoading] = useState(false);
    const [editForm, setEditForm] = useState(initialForm);
    const [editFormErrors, setEditFormErrors] = useState({});
    const [editBatchId, setEditBatchId] = useState(null);
    const [editUserBreakdown, setEditUserBreakdown] = useState({ assigned: [], available: [] });
    const [editSelectedCourseDetails, setEditSelectedCourseDetails] = useState(null);

    // Open edit modal and fetch batch details and user breakdown
    const openEditModal = useCallback(async (batchId, courseId) => {
        setEditModalLoading(true);
        setEditModalOpen(true);
        setEditBatchId(batchId);
        try {
            const token = getToken();
            // Fetch batch details
            const batchRes = await axios.get(`${BaseUrl}/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const batch = batchRes.data.batch;
            // Pre-select completed modules, lessons, topics by ID
            let completedModules = [];
            let completedLessons = [];
            let completedTopics = [];
            if (batch.batchProgress?.completedModules) {
                completedModules = batch.batchProgress.completedModules.map(m => m._id || m);
                batch.batchProgress.completedModules.forEach(m => {
                    if (Array.isArray(m.completedLessons)) {
                        m.completedLessons.forEach(l => {
                            if (l._id) completedLessons.push(l._id);
                            if (Array.isArray(l.completedTopics)) {
                                l.completedTopics.forEach(t => { if (t._id) completedTopics.push(t._id); });
                            }
                        });
                    }
                });
            }
            if (batch.batchProgress?.completedLessons) {
                completedLessons = [
                    ...completedLessons,
                    ...batch.batchProgress.completedLessons.map(l => typeof l === 'object' && l._id ? l._id : l)
                ];
            }
            if (batch.batchProgress?.completedTopics) {
                completedTopics = [
                    ...completedTopics,
                    ...batch.batchProgress.completedTopics.map(t => typeof t === 'object' && t._id ? t._id : t)
                ];
            }
            // Pre-select users by ID
            const users = batch.users?.map(u => u._id || u.userId || u) || [];
            setEditForm({
                batchName: batch.batchName || '',
                course: batch.course?._id || batch.course || '',
                users,
                professor: batch.professor?._id || batch.professor || '',
                startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
                endDate: batch.endDate ? batch.endDate.slice(0, 10) : '',
                quizzes: batch.quizzes || [],
                events: batch.events || [],
                completedModules: Array.from(new Set(completedModules)),
                completedLessons: Array.from(new Set(completedLessons)),
                completedTopics: Array.from(new Set(completedTopics)),
                markAsCompleted: batch.courseCompleted === true || batch.courseCompleted === 'true' || batch.isCourseCompleted === true || batch.isCourseCompleted === 'true',
            });
            // Fetch user breakdown
            const userBreakdownRes = await axios.get(`${BaseUrl}/batches/user-breakdown/${batch.course?._id || batch.course}/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const assigned = userBreakdownRes.data.breakdown.assignedToThisBatch.users || [];
            const available = userBreakdownRes.data.breakdown.availableUsers.users || [];
            setEditUserBreakdown({ assigned, available });
            // Set course details for modules/lessons/topics
            const course = courses.find(c => c._id === (batch.course?._id || batch.course));
            setEditSelectedCourseDetails(course || null);
        } catch (err) {
            toast.error('Failed to fetch batch details');
            setEditModalOpen(false);
        } finally {
            setEditModalLoading(false);
        }
    }, [courses]);

    // Handle edit form change
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle edit modal save
    const handleEditSave = async (e) => {
        e.preventDefault();
        // Validation
        const errors = {};
        if (!editForm.batchName.trim()) errors.batchName = 'Batch name is required.';
        if (!editForm.course) errors.course = 'Course is required.';
        if (!editForm.professor) errors.professor = 'Professor is required.';
        if (!editForm.startDate) errors.startDate = 'Start date is required.';
        if (!editForm.endDate) errors.endDate = 'End date is required.';
        if (!editForm.users || editForm.users.length === 0) errors.users = 'At least one user must be selected.';
        setEditFormErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setEditModalLoading(true);
        try {
            const token = getToken();
            // Ensure only IDs are sent
            const completedModules = (editForm.completedModules || []).map(m => typeof m === 'object' && m._id ? m._id : m);
            const completedLessons = (editForm.completedLessons || []).map(l => typeof l === 'object' && l._id ? l._id : l);
            const completedTopics = (editForm.completedTopics || []).map(t => typeof t === 'object' && t._id ? t._id : t);
            const users = (editForm.users || []).map(u => typeof u === 'object' && u._id ? u._id : u);
            const payload = {
                batchName: editForm.batchName,
                course: editForm.course,
                users,
                professor: editForm.professor,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                quizzes: editForm.quizzes,
                events: editForm.events,
                completedModules,
                completedLessons,
                completedTopics,
                markAsCompleted: Boolean(editForm.markAsCompleted),
            };
            await axios.put(`${BaseUrl}/batches/${editBatchId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Batch updated successfully!');
            setEditModalOpen(false);
            fetchBatches();
            fetchBatchCertStats(); // <-- Add this line to refresh certificate stats
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update batch');
        } finally {
            setEditModalLoading(false);
        }
    };

    // Expose fetchBatchCertStats for use after edit
    const fetchBatchCertStats = async () => {
        setBatchCertificateStatsLoading(true);
        setBatchCertificateStatsError('');
        try {
            const token = getToken();
            const res = await axios.get(`${BaseUrl}/batches/batch-certificates/stats/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Map by batchId for easy lookup
            const statsMap = {};
            (res.data.data || []).forEach(batch => {
                statsMap[batch.batchId] = batch;
            });
            setBatchCertificateStats(statsMap);
        } catch (err) {
            setBatchCertificateStatsError(err.response?.data?.message || 'Failed to fetch certificate stats');
        } finally {
            setBatchCertificateStatsLoading(false);
        }
    };

    // Modal content (portal)
    const modalContent = modalOpen && (
        <div
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn"
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
            <div className="relative w-full max-w-lg mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[90vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
                {/* Accent Header Bar */}
                <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                {/* Close Button */}
                <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setModalOpen(false)}>
                    <CloseIcon className="text-lg font-bold" />
                </button>
                {modalLoading ? (
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-4"></div>
                        <div className="text-lg text-purple-200 font-bold">Saving batch details...</div>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                        <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-glow text-center">{'Create Batch'}</h2>
                        <div className="space-y-4">
                            {/* Validation errors */}
                            {Object.keys(formErrors).length > 0 && (
                                <div className="bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                                    {Object.values(formErrors).map((err, i) => (
                                        <div key={i}>{err}</div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <label className="block text-purple-200 mb-1">Batch Name</label>
                                <input name="batchName" value={form.batchName} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                            </div>
                            <div>
                                <label className="block text-purple-200 mb-1">Course</label>
                                <Select
                                    isDisabled={fetchingDropdowns}
                                    options={courses.map(c => ({ value: c._id, label: c.title }))}
                                    value={courses.find(c => c._id === form.course) ? { value: form.course, label: courses.find(c => c._id === form.course)?.title } : null}
                                    onChange={opt => setForm(f => ({ ...f, course: opt?.value || '', users: [] }))}
                                    classNamePrefix="react-select"
                                    placeholder="Select course..."
                                    styles={{
                                        control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                        menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                        singleValue: (base) => ({ ...base, color: 'white' }),
                                        option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-purple-200 mb-1">Professor</label>
                                <Select
                                    isDisabled={fetchingDropdowns}
                                    options={professors.map(p => ({ value: p._id, label: p.name }))}
                                    value={professors.find(p => p._id === form.professor) ? { value: form.professor, label: professors.find(p => p._id === form.professor)?.name } : null}
                                    onChange={opt => setForm(f => ({ ...f, professor: opt?.value || '' }))}
                                    classNamePrefix="react-select"
                                    placeholder="Select professor..."
                                    styles={{
                                        control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                        menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                        singleValue: (base) => ({ ...base, color: 'white' }),
                                        option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-purple-200 mb-1">Users</label>
                                <Select
                                    isMulti
                                    isSearchable
                                    isDisabled={fetchingDropdowns || availableUsersLoading || !form.course}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    options={
                                        availableUsers.map(u => ({ value: u._id, label: u.name, email: u.email }))
                                    }
                                    value={
                                        availableUsers
                                            .filter(u => form.users.includes(u._id))
                                            .map(u => ({ value: u._id, label: u.name, email: u.email }))
                                    }
                                    onChange={opts => setForm(f => ({ ...f, users: opts.map(o => typeof o.value === 'object' && o.value._id ? o.value._id : o.value) }))}
                                    classNamePrefix="react-select"
                                    placeholder={form.course ? (availableUsersLoading ? "Loading users..." : "Select users...") : "Select a course first"}
                                    styles={{
                                        control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                        menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                        multiValue: (base) => ({ ...base, background: '#a78bfa', color: 'white' }),
                                        option: (base, state) => ({
                                            ...base,
                                            background: state.isFocused ? '#a78bfa' : 'transparent',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            opacity: state.data.isAssigned ? 1 : 1,
                                        }),
                                        input: (base) => ({ ...base, color: 'white' }),
                                        singleValue: (base) => ({ ...base, color: 'white' })
                                    }}
                                    components={{
                                        Option: (props) => (
                                            <div
                                                {...props.innerProps}
                                                className={props.className}
                                                style={{ ...props.style, cursor: 'pointer' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={props.isSelected}
                                                    onChange={() => null}
                                                    style={{ marginRight: 8, cursor: 'pointer' }}
                                                />
                                                <span>{props.label}</span>
                                                <span className="ml-2 text-xs text-pink-200/80">({props.data.email})</span>
                                                {props.data.isAssigned && <span className="ml-2 text-xs text-green-300/80">(Already assigned)</span>}
                                            </div>
                                        )
                                    }}
                                />
                                <div className="text-xs text-purple-200 mt-1">You can select multiple users. Only users enrolled in the selected course and not already assigned to the batch are shown.</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-purple-200 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-purple-200 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                </div>
                            </div>
                            {/* Additional fields for edit mode only */}
                            {selectedCourseDetails && (
                                <div className="space-y-4">
                                    <label className="block text-purple-200 mb-1 font-bold">Mark Completed Modules, Lessons, Topics</label>
                                    {/* Modules */}
                                    <div className="space-y-2">
                                        {selectedCourseDetails.modules?.map(module => (
                                            <div key={module._id} className="bg-[#312e81]/30 rounded-xl p-3 mb-2 border border-purple-400/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.completedModules.includes(module._id)}
                                                        onChange={e => {
                                                            setForm(f => {
                                                                const arr = f.completedModules.includes(module._id)
                                                                    ? f.completedModules.filter(id => id !== module._id)
                                                                    : [...f.completedModules, module._id];
                                                                return { ...f, completedModules: arr };
                                                            });
                                                        }}
                                                    />
                                                    <span className="font-bold text-pink-200">{module.moduleTitle}</span>
                                                </div>
                                                {/* Lessons */}
                                                <div className="ml-6 space-y-1">
                                                    {module.lessons?.map(lesson => (
                                                        <div key={lesson._id} className="flex items-center gap-2 mb-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={form.completedLessons.includes(lesson._id)}
                                                                onChange={e => {
                                                                    setForm(f => {
                                                                        const arr = f.completedLessons.includes(lesson._id)
                                                                            ? f.completedLessons.filter(id => id !== lesson._id)
                                                                            : [...f.completedLessons, lesson._id];
                                                                        return { ...f, completedLessons: arr };
                                                                    });
                                                                }}
                                                            />
                                                            <span className="text-blue-200">{lesson.title}</span>
                                                            {/* Topics */}
                                                            {lesson.topics && lesson.topics.length > 0 && (
                                                                <div className="ml-4 flex flex-wrap gap-2">
                                                                    {lesson.topics.map(topic => (
                                                                        <label key={topic._id} className="flex items-center gap-1 text-xs">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={form.completedTopics.includes(topic._id)}
                                                                                onChange={e => {
                                                                                    setForm(f => {
                                                                                        const arr = f.completedTopics.includes(topic._id)
                                                                                            ? f.completedTopics.filter(id => id !== topic._id)
                                                                                            : [...f.completedTopics, topic._id];
                                                                                        return { ...f, completedTopics: arr };
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className="text-pink-200">{topic.title}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center mt-6">
                            <button type="submit" disabled={modalLoading} className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg">
                                {modalLoading ? 'Saving...' : 'Create'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes modalPop { 0% { transform: scale(0.95) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-modalPop { animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a78bfa55; border-radius: 8px; }
      `}</style>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg mb-4 md:mb-0">
                    <TrendingUp className="text-white text-4xl drop-shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Batch Management</h1>
                    <p className="text-lg text-purple-100/80 mt-2">Admin view of all batches, users, and courses</p>
                </div>
                <div className="flex flex-col gap-2 md:ml-auto items-center">
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg mb-2">
                        <Add /> Create Batch
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Batches */}
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-purple-400/60 to-purple-700/80 backdrop-blur-xl border border-white/10 group overflow-hidden transition-transform hover:scale-105 hover:shadow-3xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg mt-3 animate-bounce-slow">
                        <School className="text-3xl text-purple-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-12">
                        <div className="text-4xl font-extrabold drop-shadow-lg text-white tracking-wider">
                            {statsLoading ? <span className="animate-pulse">...</span> : batchStats?.summary?.totalBatches ?? '--'}
                        </div>
                        <div className="text-base font-medium mt-1 tracking-wide uppercase text-purple-100/90">Total Batches</div>
                    </div>
                </div>
                {/* Active Batches */}
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-blue-400/60 to-blue-700/80 backdrop-blur-xl border border-white/10 group overflow-hidden transition-transform hover:scale-105 hover:shadow-3xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-b-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg mt-3 animate-bounce-slow">
                        <TrendingUp className="text-3xl text-blue-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-12">
                        <div className="text-4xl font-extrabold drop-shadow-lg text-white tracking-wider">
                            {statsLoading ? <span className="animate-pulse">...</span> : batchStats?.summary?.activeBatches ?? '--'}
                        </div>
                        <div className="text-base font-medium mt-1 tracking-wide uppercase text-blue-100/90">Active Batches</div>
                    </div>
                </div>
                {/* Completed Batches */}
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-400/60 to-green-700/80 backdrop-blur-xl border border-white/10 group overflow-hidden transition-transform hover:scale-105 hover:shadow-3xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-b-lg bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shadow-lg mt-3 animate-bounce-slow">
                        <BarChart className="text-3xl text-green-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-12">
                        <div className="text-4xl font-extrabold drop-shadow-lg text-white tracking-wider">
                            {statsLoading ? <span className="animate-pulse">...</span> : batchStats?.summary?.completedBatches ?? '--'}
                        </div>
                        <div className="text-base font-medium mt-1 tracking-wide uppercase text-green-100/90">Completed Batches</div>
                    </div>
                </div>
                {/* Total Users (from topBatches sum) */}
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-pink-400/60 to-pink-700/80 backdrop-blur-xl border border-white/10 group overflow-hidden transition-transform hover:scale-105 hover:shadow-3xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-b-lg bg-gradient-to-br from-pink-400 to-pink-700 flex items-center justify-center shadow-lg mt-3 animate-bounce-slow">
                        <Group className="text-3xl text-pink-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-12">
                        <div className="text-4xl font-extrabold drop-shadow-lg text-white tracking-wider">
                            {statsLoading ? <span className="animate-pulse">...</span> : (batchStats?.topBatches?.reduce((acc, b) => acc + (b.userCount || 0), 0) ?? '--')}
                        </div>
                        <div className="text-base font-medium mt-1 tracking-wide uppercase text-pink-100/90">Total Users</div>
                    </div>
                </div>
            </div>
            {/* End Metrics */}

            {/* Enhanced Charts Section */}
            <div className="w-full flex flex-col gap-10 mt-8">
                {/* First row: Bar and Donut charts side by side */}
                <div className="w-full flex flex-col md:flex-row gap-8">
                    {/* 1. Top Batches by Progress Bar Chart (larger width) */}
                    <div className="bg-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[220px] w-full md:w-2/3 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 w-full mb-4 mt-0 pt-0">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg">
                                <TrendingUp className="text-white text-3xl drop-shadow-lg" />
                            </div>
                            <div>
                                <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">Top Batches by Progress</div>
                                <div className="text-sm text-purple-100/80 mt-1">Highest progress rates</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <RechartsBarChart data={batchStats?.topBatches || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa33" />
                                <XAxis
                                    dataKey="batchName"
                                    stroke="#c4b5fd"
                                    interval={0}
                                    textAnchor="middle"
                                    height={40}
                                    tick={{ fontSize: 14, fill: '#fff', fontWeight: 600, wordBreak: 'break-word' }}
                                    tickLine={false}
                                />
                                <YAxis stroke="#c4b5fd" allowDecimals={false} tick={{ fontSize: 13 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const { batchName, progress, courseTitle, userCount } = payload[0].payload;
                                            return (
                                                <div className="bg-black/80 text-gray-100 text-base rounded-xl shadow-lg px-4 py-3 border border-pink-400/40 min-w-[200px]">
                                                    <div className="text-lg font-bold text-pink-300 mb-1">{batchName}</div>
                                                    <div className="text-sm text-purple-200 mb-1">Course: <span className="font-semibold text-blue-200">{courseTitle}</span></div>
                                                    <div className="text-base font-bold text-green-300 mb-1">Users: {userCount}</div>
                                                    <div className="text-base font-bold text-blue-300">Progress: {progress}%</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: 0, marginTop: 0 }} />
                                <Bar
                                    dataKey="progress"
                                    fill="#f472b6"
                                    label={({ x, y, width, value }) => {
                                        // Center label above the bar, avoid cutoff
                                        return (
                                            <text
                                                x={x + width / 2}
                                                y={y - 8}
                                                textAnchor="middle"
                                                fill="#fff"
                                                fontWeight="bold"
                                                fontSize="14"
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {value}%
                                            </text>
                                        );
                                    }}
                                />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* 2. Top Batches by User Count Pie Chart (large, centered, no cutoff) */}
                    <div className="bg-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 w-full md:w-1/3 max-w-lg mx-auto overflow-visible">
                        <div className="flex items-center gap-4 w-full mb-4 mt-0 pt-0 justify-center">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-blue-400 shadow-lg mb-2">
                                <Group className="text-white text-3xl drop-shadow-lg" />
                            </div>
                            <div>
                                <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-1">Batches User</div>
                                <div className="text-sm text-purple-100/80 mb-2">Most popular batches</div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height={340} minWidth={260} minHeight={260}>
                                <PieChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                    <Pie
                                        data={batchStats?.topBatches || []}
                                        dataKey="userCount"
                                        nameKey="batchName"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {batchStats?.topBatches?.map((entry, idx) => (
                                            <Cell key={idx} fill={["#38bdf8", "#f472b6", "#22c55e", "#a78bfa", "#fbbf24"][idx % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const { batchName, userCount, courseTitle, progress } = payload[0].payload;
                                            return (
                                                <div className="bg-black/80 text-gray-100 text-base rounded-xl shadow-lg px-4 py-3 border border-pink-400/40 min-w-[220px]">
                                                    <div className="text-lg font-bold text-pink-300 mb-1">{batchName}</div>
                                                    <div className="text-sm text-purple-200 mb-1">Course: <span className="font-semibold text-blue-200">{courseTitle}</span></div>
                                                    <div className="text-base font-bold text-green-300 mb-1">Users: {userCount}</div>
                                                    <div className="text-base font-bold text-blue-300">Progress: {progress}%</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        wrapperStyle={{
                                            paddingTop: 12,
                                            color: "#fff",
                                            fontWeight: 600,
                                            fontSize: 14,
                                            textAlign: "center",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Second row: Batches Created (Monthly) Bar Chart with date pickers, full width */}
                <div className="bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center border border-white/10 w-full max-w-none mx-auto relative overflow-visible">

                    {/* Chart header and date pickers at top right */}
                    <div className="flex flex-row justify-between items-center w-full mb-4 gap-4">
                        <div className="flex items-center gap-3">
                            <BarChart className="text-pink-400 text-3xl drop-shadow-lg" style={{ fontSize: 32 }} />
                            <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-0">Batches Created <span className="text-pink-400">(Monthly)</span></span>
                        </div>
                        <div className="flex flex-row gap-3 items-end">
                            {/* Start Date */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start"
                                    value={dayjs.default(startDate)}
                                    onChange={v => setStartDate(v ? v.format('YYYY-MM-DD') : '')}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            variant: 'outlined',
                                            sx: {
                                                minWidth: 150,
                                                width: 80,
                                                bgcolor: 'rgba(49,17,136,0.85)',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    color: '#fff !important',
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    borderColor: '#a78bfa',
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#fff !important',
                                                    fontWeight: 700,
                                                    fontSize: 13,
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
                                                    fontSize: 12,
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
                            {/* End Date */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End"
                                    value={dayjs.default(endDate)}
                                    onChange={v => setEndDate(v ? v.format('YYYY-MM-DD') : '')}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            variant: 'outlined',
                                            sx: {
                                                minWidth: 150,
                                                width: 80,
                                                bgcolor: 'rgba(49,17,136,0.85)',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    color: '#fff !important',
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    borderColor: '#a78bfa',
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#fff !important',
                                                    fontWeight: 700,
                                                    fontSize: 13,
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
                                                    fontSize: 12,
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
                    {/* Spinner overlay while loading */}
                    {monthlyLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 rounded-2xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-400"></div>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height={260}>
                        <RechartsBarChart data={monthlyBatchCounts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa33" />
                            <XAxis dataKey="month" stroke="#c4b5fd" interval={0} angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="#c4b5fd" allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }} formatter={(value, name) => [value, 'Batches']} />
                            <Legend />
                            <Bar dataKey="count" label={{ position: 'top', fill: '#fff', fontWeight: 700 }} fill="#a78bfa" radius={[8, 8, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                    {monthlyError && <div className="text-red-400 text-center mt-2">{monthlyError}</div>}
                </div>
            </div>

            {/* Batch Table - Creative, Professional, Responsive */}
            <div className="w-full mt-10 rounded-2xl shadow-xl bg-gradient-to-b from-[#311188] to-[#0A081E] border border-[#312e81]/60 p-0 backdrop-blur-md bg-opacity-80">
                {/* Custom Table Header: Heading + Searchbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 pt-6 pb-3 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-white  tracking-wide">Batch details</h2>
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search batches..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1536]/80 text-white placeholder-purple-200 border border-[#312e81]/40 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full backdrop-blur-md"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-200" />
                    </div>
                </div>
                <table className="w-full rounded-2xl table-fixed border-separate border-spacing-0 bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20 text-white">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#312e81]/80 via-[#a78bfa33] to-[#0ea5e9]/30 text-purple-100 text-base border-b border-[#312e81]/40">
                        <tr>
                            <th className="py-3 px-2 text-left font-bold w-[16%] max-w-[180px] truncate">Batch Name</th>
                            <th className="py-3 px-2 text-left font-bold w-[18%] max-w-[200px] truncate">Course</th>
                            <th className="py-3 px-2 text-left font-bold w-[16%] max-w-[180px] truncate">Professor</th>
                            <th className="py-3 px-2 text-left font-bold w-[11%] max-w-[120px] truncate">Dates</th>
                            <th className="py-3 px-2 text-left font-bold w-[10%] max-w-[80px] truncate">Users</th>
                            <th className="py-3 px-2 text-left font-bold w-[18%] max-w-[160px] truncate">Progress</th>
                            <th className="py-3 px-4 text-left font-bold w-[13%] max-w-[180px] min-w-[120px] truncate">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-400 mx-auto"></div></td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} className="text-center text-red-400 font-bold py-10">{error}</td></tr>
                        ) : filteredBatches.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#312e81]/30 flex items-center justify-center">
                                    <School className="text-4xl text-purple-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Batches Found</h3>
                                <p className="text-purple-200/80">Create a new batch to get started!</p>
                            </td></tr>
                        ) : (
                            paginatedBatches.map((batch) => {
                                return (
                                    <tr key={batch._id} className="group border-b border-[#312e81]/40 hover:bg-gradient-to-r hover:from-pink-400/10 hover:to-blue-400/10 transition-all duration-200 rounded-xl shadow-sm hover:shadow-lg">
                                        {/* Batch Name */}
                                        <td className="py-3 px-2 align-top max-w-[180px] overflow-hidden text-ellipsis" title={batch.batchName}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 mr-2"></span>
                                                <span className="text-lg font-semibold truncate text-white drop-shadow-glow" title={batch.batchName}>{batch.batchName}</span>
                                                <span className="ml-2 px-2 py-0.5 rounded bg-purple-700/40 text-xs text-purple-100 font-bold truncate" title={batch._id}>{batch._id?.slice(-5)}</span>
                                            </div>
                                        </td>
                                        {/* Course Info */}
                                        <td className="py-3 px-2 align-top max-w-[200px] overflow-hidden text-ellipsis" title={batch.course?.title}>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="font-bold text-purple-100 truncate" title={batch.course?.title}>{batch.course?.title}</span>
                                                <span className="text-xs text-purple-300 flex items-center gap-2">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold shadow" title={batch.course?.category}>{batch.course?.category}</span>
                                                    <span
                                                        className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow whitespace-nowrap overflow-hidden text-ellipsis"
                                                        title={batch.course?.level}
                                                        style={{ maxWidth: 90, display: 'inline-block' }}
                                                    >
                                                        {batch.course?.level}
                                                    </span>
                                                </span>
                                                <span className="text-xs text-blue-200 truncate" title={batch.course?.duration}>{batch.course?.duration}</span>
                                            </div>
                                        </td>
                                        {/* Professor Info */}
                                        <td className="py-3 px-2 align-top max-w-[180px] overflow-hidden text-ellipsis" title={batch.professor?.name}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                {batch.professor?.profileImage ? (
                                                    <img src={batch.professor.profileImage} alt="prof" className="w-8 h-8 rounded-full object-cover border-2 border-pink-400 shadow" />
                                                ) : (
                                                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">{batch.professor?.name?.[0]}</span>
                                                )}
                                                <div className="min-w-0">
                                                    <span className="font-bold text-blue-100 truncate block" title={batch.professor?.name}>{batch.professor?.name}</span>
                                                    <span className="block text-xs text-blue-200 truncate" title={batch.professor?.email}>{batch.professor?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Dates */}
                                        <td className="py-3 px-2 align-top min-w-[120px] max-w-[160px] overflow-hidden text-ellipsis" title={`Start: ${batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'} | End: ${batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}`}>
                                            <div className="flex flex-col gap-1 items-start min-w-0">
                                                <span className="text-[11px] text-purple-300 font-semibold uppercase tracking-wide">Start</span>
                                                <span className="text-xs text-purple-100 font-bold" title={batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}</span>
                                                <span className="text-[11px] text-pink-300 font-semibold uppercase tracking-wide">End</span>
                                                <span className="text-xs text-pink-100 font-bold" title={batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}>{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        {/* Users */}
                                        <td className="py-3 px-2 align-top max-w-[80px] text-left overflow-hidden text-ellipsis" title={`Total users: ${batch.users?.length || 0}`}>
                                            <span className="font-bold text-pink-100 text-lg">{batch.users?.length || 0}</span>
                                        </td>
                                        {/* Progress */}
                                        <td className="py-3 px-2 align-top max-w-[160px] overflow-hidden text-ellipsis" title={`Progress: ${batch.batchProgress?.percentage || 0}%`}>
                                            <div className="flex flex-col items-start gap-2 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-[#312e81]/40 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 transition-all duration-700"
                                                            style={{ width: `${batch.batchProgress?.percentage || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-purple-100">{batch.batchProgress?.percentage || 0}%</span>
                                                </div>
                                                {/* Certificate count display */}
                                                {(() => {
                                                    const certStats = batchCertificateStats[batch._id];
                                                    if (
                                                        (batch.courseCompleted === true || batch.courseCompleted === 'true' || batch.isCourseCompleted === true || batch.isCourseCompleted === 'true') &&
                                                        batch.users && batch.users.length > 0 && certStats
                                                    ) {
                                                        return (
                                                            <span className="text-xs font-semibold text-green-200">
                                                                Certificates: {certStats.issuedCount || 0}/{certStats.totalUsers || batch.users.length} sent
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                                {/* --- CERTIFICATE BUTTON (now in Progress column) --- */}
                                                {(() => {
                                                    const certStats = batchCertificateStats[batch._id];
                                                    if (
                                                        (batch.courseCompleted === true || batch.courseCompleted === 'true' || batch.isCourseCompleted === true || batch.isCourseCompleted === 'true') &&
                                                        batch.users && batch.users.length > 0 && certStats
                                                    ) {
                                                        if (certStats.issuedCount === certStats.totalUsers && certStats.totalUsers > 0) {
                                                            return (
                                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold shadow animate-pulse">
                                                                    <CheckCircleIcon style={{ fontSize: 14, color: '#fff' }} />
                                                                    Certificates
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <button
                                                                    onClick={() => handleSendCertificates(batch._id)}
                                                                    disabled={sendingCertificateBatchId === batch._id}
                                                                    className={`px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1 bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform duration-200 border-2 border-white/10 ${sendingCertificateBatchId === batch._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                                    title="Send Certificates to all users in this batch"
                                                                >
                                                                    {sendingCertificateBatchId === batch._id ? (
                                                                        <span className="flex items-center gap-1"><span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span> Sending...</span>
                                                                    ) : (
                                                                        <><MailOutlineIcon style={{ fontSize: 18, color: '#fff' }} /> Send Certificates</>
                                                                    )}
                                                                </button>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="py-3 px-4 align-top max-w-[180px] min-w-[120px]">
                                            <div className="flex flex-wrap gap-2 min-w-[120px]">
                                                <button onClick={() => openViewModal(batch)} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="View Batch">
                                                    <Visibility fontSize="small" />
                                                </button>
                                                <button onClick={() => openEditModal(batch._id, batch.course?._id || batch.course)} className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="Edit Batch">
                                                    <Edit fontSize="small" />
                                                </button>
                                                <button disabled={deleteLoading} onClick={() => handleDelete(batch._id)} className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-md hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="Delete Batch">
                                                    <Delete fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={7} className='p-2'>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 py-2">

                                    <div className="text-purple-200 text-sm mt-2 sm:mt-0">
                                        {filteredBatches.length === 0
                                            ? 'Showing 0 of 0'
                                            : `Showing ${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredBatches.length)} of ${filteredBatches.length}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="rowsPerPage" className="text-purple-200 text-sm">Rows per page:</label>
                                        <select
                                            id="rowsPerPage"
                                            value={rowsPerPage}
                                            onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                            className="rounded bg-[#1a1536]/80 text-white border border-[#312e81]/40 px-2 py-1"
                                        >
                                            {[5, 10, 20, 50].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-6">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`px-3 py-1 rounded-lg font-bold mx-1 ${currentPage === idx + 1 ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-[#1a1536]/60 text-purple-200 hover:bg-purple-700/60'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* View Modal (portal) */}
            {viewModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn" onClick={e => { if (e.target === e.currentTarget) closeViewModal(); }}>
                    <div className="relative w-full max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/98 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[90vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
                        {/* Accent Header Bar */}
                        <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                        {/* Close Button */}
                        <button
                            className="absolute top-5 right-5 text-purple-200 m-0 p-0 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full shadow-lg backdrop-blur-md flex items-center justify-center"
                            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={closeViewModal}
                        >
                            <CloseIcon className="text-xl flex items-center justify-center w-full h-full" />
                        </button>
                        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
                            {viewModalLoading ? (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-4"></div>
                                    <div className="text-lg text-purple-200 font-bold">Loading batch details...</div>
                                </div>
                            ) : viewBatch && (
                                <div className="space-y-8">
                                    {/* Batch Info Section */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-purple-400/20 pb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg">
                                                <TrendingUp className="text-white text-3xl" />
                                            </span>
                                            <div>
                                                <h2 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
                                                    {viewBatch.batchName}
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-purple-700/40 text-xs text-purple-100 font-bold truncate" title={viewBatch._id}>{viewBatch._id?.slice(-5)}</span>
                                                </h2>
                                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-purple-200">
                                                    <span className="flex items-center gap-1"><CalendarToday fontSize="small" className="text-pink-300" /> {viewBatch.startDate ? new Date(viewBatch.startDate).toLocaleDateString() : '-'} <span className="mx-1">→</span> {viewBatch.endDate ? new Date(viewBatch.endDate).toLocaleDateString() : '-'}</span>
                                                    <span className="flex items-center gap-1"><BarChart fontSize="small" className="text-blue-300" /> Status: <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getBatchStatus(viewBatch.startDate, viewBatch.endDate).color} ${getBatchStatus(viewBatch.startDate, viewBatch.endDate).text}`}>{getBatchStatus(viewBatch.startDate, viewBatch.endDate).label}</span></span>
                                                </div>
                                                <div className="mt-1 text-xs text-purple-400">Batch ID: {viewBatch._id}</div>
                                                <div className="mt-1 text-xs text-purple-400">API Message: {viewBatch._apiMessage}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Professor & Course Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-purple-400/20 pb-4">
                                        {/* Professor */}
                                        <div className="flex flex-col gap-3 bg-gradient-to-br from-blue-900/40 to-purple-900/10 rounded-2xl p-6 shadow-lg border border-blue-400/20 min-h-[260px]">
                                            <div className="flex items-center gap-4 mb-2">
                                                {viewBatch.professor?.profileImage ? (
                                                    <img src={viewBatch.professor.profileImage} alt="prof" className="w-20 h-20 rounded-full object-cover border-4 border-pink-400 shadow-xl" />
                                                ) : (
                                                    <img src="https://ui-avatars.com/api/?name=Professor&background=6d28d9&color=fff&size=128" alt="prof" className="w-20 h-20 rounded-full object-cover border-4 border-pink-400 shadow-xl" />
                                                )}
                                                <div>
                                                    <div className="text-2xl font-bold text-blue-100 flex items-center gap-2">{viewBatch.professor?.name} <span className="text-xs text-purple-300">({viewBatch.professor?.designation})</span></div>
                                                    <div className="text-xs text-purple-300 mt-1">{viewBatch.professor?.currentOrganization}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-purple-200 mt-2">
                                                <span className="flex items-center gap-1"><Person fontSize="small" /> <span className="font-semibold">ID:</span> {viewBatch.professor?._id}</span>
                                                <span className="flex items-center gap-1"><Group fontSize="small" /> <span className="font-semibold">Exp:</span> {viewBatch.professor?.yearsOfExperience} yrs</span>
                                                <span className="flex items-center gap-1"><School fontSize="small" /> <span className="font-semibold">Courses:</span> {viewBatch.professor?.courses?.length}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-purple-200 mt-2">
                                                <span className="flex items-center gap-1"><span className="material-icons text-pink-300">mail</span> {viewBatch.professor?.email}</span>
                                                <span className="flex items-center gap-1"><span className="material-icons text-blue-300">phone</span> {viewBatch.professor?.phone}</span>
                                                {viewBatch.professor?.linkedIn && <span className="flex items-center gap-1"><span className="material-icons text-blue-400">link</span> <a href={viewBatch.professor?.linkedIn} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">LinkedIn</a></span>}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="font-bold text-pink-200 text-xs">Expertise:</span>
                                                {viewBatch.professor?.expertise?.map((exp, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow mr-1">{exp}</span>)}
                                            </div>
                                            <div className="mt-2 text-xs text-purple-200"><span className="font-bold text-pink-200">Bio:</span> {viewBatch.professor?.bio}</div>
                                            <div className="mt-2 text-xs text-purple-200"><span className="font-bold text-pink-200">Joined:</span> {viewBatch.professor?.createdAt ? new Date(viewBatch.professor.createdAt).toLocaleDateString() : '-'}</div>
                                        </div>
                                        {/* Course */}
                                        <div className="flex flex-col gap-3 bg-gradient-to-br from-purple-900/40 to-blue-900/10 rounded-2xl p-6 shadow-lg border border-purple-400/20 min-h-[260px]">
                                            <div className="flex items-center gap-4 mb-2">
                                                {viewBatch.course?.coverImage ? (
                                                    <img src={viewBatch.course.coverImage} alt="cover" className="w-20 h-20 rounded-lg object-cover border-4 border-blue-400 shadow-xl" />
                                                ) : (
                                                    <img src="https://ui-avatars.com/api/?name=Course&background=0ea5e9&color=fff&size=128" alt="cover" className="w-20 h-20 rounded-lg object-cover border-4 border-blue-400 shadow-xl" />
                                                )}
                                                <div>
                                                    <div className="text-2xl font-bold text-purple-100">{viewBatch.course?.title}</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold shadow" title={viewBatch.course?.category}>{viewBatch.course?.category}</span>
                                                        <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow" title={viewBatch.course?.level}>{viewBatch.course?.level}</span>
                                                    </div>
                                                    <div className="text-xs text-purple-300 mt-1">Course ID: {viewBatch.course?._id}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-purple-200 mt-2">
                                                <span className="flex items-center gap-1"><Quiz fontSize="small" /> <span className="font-semibold">Duration:</span> {viewBatch.course?.duration}</span>
                                                <span className="flex items-center gap-1"><Group fontSize="small" /> <span className="font-semibold">Modules:</span> {viewBatch.course?.modules?.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Users Section */}
                                    <div className="border-b border-purple-400/20 pb-4">
                                        <div className="text-lg font-bold text-pink-200 mb-2 flex items-center gap-2"><Group className="text-pink-400" /> Users ({viewBatch.users?.length || 0})</div>
                                        {/* --- Certificate Stats Section --- */}
                                        {viewBatchCertificateStatsLoading ? (
                                            <div className="flex items-center gap-2 text-purple-200 text-sm my-2"><span className="animate-spin h-5 w-5 border-b-2 border-pink-400 rounded-full"></span> Loading certificate stats...</div>
                                        ) : viewBatchCertificateStatsError ? (
                                            <div className="text-red-400 text-sm my-2">{viewBatchCertificateStatsError}</div>
                                        ) : viewBatchCertificateStats ? (
                                            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#1a1536]/80 via-[#a78bfa22] to-[#0ea5e9]/20 border border-pink-400/20 shadow-lg">
                                                <div className="flex flex-wrap gap-6 items-center mb-2">
                                                    <span className="text-base font-bold text-pink-200 flex items-center gap-2"><MailOutlineIcon style={{ fontSize: 20, color: '#f472b6' }} /> Certificate Stats</span>
                                                    <span className="text-xs text-purple-200 bg-purple-900/40 px-2 py-1 rounded-full">Total Users: <b>{viewBatchCertificateStats.totalUsers}</b></span>
                                                    <span className="text-xs text-green-200 bg-green-900/40 px-2 py-1 rounded-full">Issued: <b>{viewBatchCertificateStats.issuedCount}</b></span>
                                                    <span className="text-xs text-pink-200 bg-pink-900/40 px-2 py-1 rounded-full">Not Issued: <b>{viewBatchCertificateStats.notIssuedCount}</b></span>
                                                </div>
                                                <div className="flex flex-col md:flex-row gap-6 mt-2">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-green-300 mb-1 flex items-center gap-1"><CheckCircleIcon style={{ fontSize: 16, color: '#22c55e' }} /> Issued To:</div>
                                                        {viewBatchCertificateStats.issuedTo.length === 0 ? (
                                                            <div className="text-xs text-purple-300">No certificates issued yet.</div>
                                                        ) : (
                                                            <ul className="text-xs text-green-100 space-y-1">
                                                                {viewBatchCertificateStats.issuedTo.map(u => (
                                                                    <li key={u._id} className="flex items-center gap-2 bg-green-900/20 rounded px-2 py-1">
                                                                        <span className="font-bold">{u.name}</span>
                                                                        <span className="text-green-200">{u.email}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-pink-300 mb-1 flex items-center gap-1"><MailOutlineIcon style={{ fontSize: 16, color: '#f472b6' }} /> Not Issued To:</div>
                                                        {viewBatchCertificateStats.notIssuedTo.length === 0 ? (
                                                            <div className="text-xs text-purple-300">All users have received certificates.</div>
                                                        ) : (
                                                            <ul className="text-xs text-pink-100 space-y-1">
                                                                {viewBatchCertificateStats.notIssuedTo.map(u => (
                                                                    <li key={u._id} className="flex items-center gap-2 bg-pink-900/20 rounded px-2 py-1">
                                                                        <span className="font-bold">{u.name}</span>
                                                                        <span className="text-pink-200">{u.email}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-xs md:text-sm text-left text-purple-100">
                                                <thead>
                                                    <tr className="border-b border-purple-400/10">
                                                        <th className="py-2 px-2">Name</th>
                                                        <th className="py-2 px-2">Email</th>
                                                        <th className="py-2 px-2">User ID</th>
                                                        <th className="py-2 px-2">Role</th>
                                                        <th className="py-2 px-2">Approved</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {viewBatch.users?.length ? (
                                                        viewBatch.users.slice((viewUsersPage - 1) * USERS_PER_PAGE, viewUsersPage * USERS_PER_PAGE).map((u, idx) => (
                                                            <tr key={u._id || idx} className="border-b border-purple-400/10 hover:bg-[#312e81]/40 transition">
                                                                <td className="py-2 px-2 font-bold text-pink-100">{u.name}</td>
                                                                <td className="py-2 px-2">{u.email}</td>
                                                                <td className="py-2 px-2">{u._id}</td>
                                                                <td className="py-2 px-2">{u.role}</td>
                                                                <td className="py-2 px-2">
                                                                    {u.isApproved ? <span className="px-2 py-0.5 rounded-full bg-green-500/30 text-green-100 font-bold">Yes</span> : <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-100 font-bold">No</span>}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan={5} className="text-center text-purple-300 py-4">No users</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination Controls for Users Table */}
                                        {viewBatch.users && viewBatch.users.length > USERS_PER_PAGE && (
                                            <div className="flex justify-center items-center gap-2 py-4">
                                                <button
                                                    onClick={() => setViewUsersPage((p) => Math.max(1, p - 1))}
                                                    disabled={viewUsersPage === 1}
                                                    className="px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Prev
                                                </button>
                                                {[...Array(Math.ceil(viewBatch.users.length / USERS_PER_PAGE))].map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setViewUsersPage(idx + 1)}
                                                        className={`px-3 py-1 rounded-lg font-bold mx-1 ${viewUsersPage === idx + 1 ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-[#1a1536]/60 text-purple-200 hover:bg-purple-700/60'}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setViewUsersPage((p) => Math.min(Math.ceil(viewBatch.users.length / USERS_PER_PAGE), p + 1))}
                                                    disabled={viewUsersPage === Math.ceil(viewBatch.users.length / USERS_PER_PAGE)}
                                                    className="px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Batch Progress Section (creative, with bar graph and detailed accordion) */}
                                    <div className="pt-4">
                                        <div className="text-lg font-bold text-pink-200 mb-4 flex items-center gap-2">
                                            <BarChart className="text-pink-400" /> Batch Progress
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch w-full">
                                            {/* Main Progress Bar */}
                                            <div className="flex-1 flex flex-col gap-6 w-full max-w-md">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-purple-200 font-semibold text-sm flex items-center gap-1"><Quiz fontSize="small" /> Lessons</span>
                                                        <span className="text-blue-200 font-bold text-sm">{viewBatch.batchProgress?.percentage || 0}%</span>
                                                    </div>
                                                    <div className="w-full h-5 bg-[#312e81]/40 rounded-full overflow-hidden shadow-inner relative">
                                                        <div className="h-5 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-700" style={{ width: `${viewBatch.batchProgress?.percentage || 0}%` }}></div>
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white font-bold">
                                                            {viewBatch._progress?.completedLessons} / {viewBatch._progress?.totalLessons} Lessons,
                                                            {viewBatch._progress?.completedTopics} / {viewBatch._progress?.totalTopics} Topics
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Donut Chart for Progress */}
                                            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
                                                <div className="relative w-32 h-32">
                                                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="44" stroke="#a78bfa33" strokeWidth="10" fill="none" />
                                                        <circle
                                                            cx="50" cy="50" r="44"
                                                            stroke="url(#overallGradient)"
                                                            strokeWidth="10"
                                                            fill="none"
                                                            strokeDasharray={276.46}
                                                            strokeDashoffset={276.46 - ((viewBatch.batchProgress?.percentage || 0) / 100 * 276.46)}
                                                            style={{ transition: 'stroke-dashoffset 1s' }}
                                                        />
                                                        <defs>
                                                            <linearGradient id="overallGradient" x1="0" y1="0" x2="100" y2="100">
                                                                <stop offset="0%" stopColor="#ec4899" />
                                                                <stop offset="100%" stopColor="#38bdf8" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-bold text-purple-100">{Math.round(viewBatch.batchProgress?.percentage || 0)}%</span>
                                                        <span className="text-xs text-purple-200">Overall Progress</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Detailed Progress Accordion */}
                                        {safeArray(viewBatch._progress?.completedModules).length > 0 && (
                                            <div className="mt-8">
                                                <div className="text-xs text-pink-200 font-bold mb-4 flex items-center gap-2"><BarChart className="text-pink-400" /> Detailed Progress</div>
                                                <div className="flex flex-col gap-4">
                                                    {viewBatch._progress.completedModules.map((mod, i) => (
                                                        <details key={mod._id || i} className="rounded-xl bg-[#1a1536]/80 border border-purple-400/30 p-4 group shadow-md">
                                                            <summary className="cursor-pointer flex items-center gap-3 font-semibold text-purple-100 text-base group-open:text-pink-400 transition mb-2">
                                                                <span className="transition-transform duration-200 mr-1 group-open:rotate-90">
                                                                    <ExpandMoreIcon style={{ fontSize: 22, color: '#a78bfa', verticalAlign: 'middle' }} />
                                                                </span>
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-blue-400"><School fontSize="small" className="text-white" /></span>
                                                                <span>Module:</span> <span className="ml-1 text-pink-200 font-bold">{mod.title}</span>
                                                                <span className="ml-2 text-xs text-purple-300">Lessons: {safeArray(mod.completedLessons).length}</span>
                                                            </summary>
                                                            <div className="mt-2 ml-4 flex flex-col gap-3">
                                                                {safeArray(mod.completedLessons).length > 0 ? (
                                                                    mod.completedLessons.map((lesson, j) => (
                                                                        <div key={lesson._id || j} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 pl-2 border-l-4 border-blue-400/30 bg-blue-900/10 rounded-lg py-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"><Quiz fontSize="small" className="text-white" /></span>
                                                                                <span className="text-blue-200 font-bold">Lesson:</span>
                                                                                <span className="text-blue-100">{lesson.title}</span>
                                                                            </div>
                                                                            {safeArray(lesson.completedTopics).length > 0 && (
                                                                                <div className="flex flex-wrap gap-2 items-center mt-1 md:mt-0 pl-6">
                                                                                    <span className="text-pink-200 text-xs font-semibold flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-400"><BarChart fontSize="inherit" className="text-white" /></span> Topics:</span>
                                                                                    {lesson.completedTopics.map((topic, k) => (
                                                                                        <span key={topic._id || k} className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow flex items-center gap-1">
                                                                                            <span className="material-icons text-xs align-middle">check_circle</span> {topic.title}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-purple-300 ml-2">No lessons completed in this module.</span>
                                                                )}
                                                            </div>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1); }
              @keyframes modalPop { 0% { transform: scale(0.95) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
              .animate-modalPop { animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1); }
              .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #a78bfa55; border-radius: 8px; }
              .material-icons { font-family: 'Material Icons'; font-style: normal; font-weight: normal; font-size: 18px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
            `}</style>
                    </div>
                </div>, document.getElementById('modal-root')
            )}

            {modalOpen && ReactDOM.createPortal(modalContent, document.getElementById('modal-root'))}

            {/* Edit Modal */}
            {editModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn" onClick={e => { if (e.target === e.currentTarget) setEditModalOpen(false); }}>
                    <div className="relative w-full max-w-lg mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[90vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
                        <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                        <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setEditModalOpen(false)}>
                            <CloseIcon className="text-lg font-bold" />
                        </button>
                        {editModalLoading ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mb-4"></div>
                                <div className="text-lg text-purple-200 font-bold">Loading batch details...</div>
                            </div>
                        ) : (
                            <form onSubmit={handleEditSave} className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                                <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-glow text-center">Edit Batch</h2>
                                <div className="space-y-4">
                                    {/* Validation errors */}
                                    {Object.keys(editFormErrors).length > 0 && (
                                        <div className="bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-2 text-sm">
                                            {Object.values(editFormErrors).map((err, i) => (
                                                <div key={i}>{err}</div>
                                            ))}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-purple-200 mb-1">Batch Name</label>
                                        <input name="batchName" value={editForm.batchName} onChange={handleEditFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                    </div>
                                    <div>
                                        <label className="block text-purple-200 mb-1">Course</label>
                                        <Select
                                            isDisabled={fetchingDropdowns}
                                            options={courses.map(c => ({ value: c._id, label: c.title }))}
                                            value={courses.find(c => c._id === editForm.course) ? { value: editForm.course, label: courses.find(c => c._id === editForm.course)?.title } : null}
                                            onChange={opt => setEditForm(f => ({ ...f, course: opt?.value || '', users: [] }))}
                                            classNamePrefix="react-select"
                                            placeholder="Select course..."
                                            styles={{
                                                control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                                menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                                singleValue: (base) => ({ ...base, color: 'white' }),
                                                option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-purple-200 mb-1">Professor</label>
                                        <Select
                                            isDisabled={fetchingDropdowns}
                                            options={professors.map(p => ({ value: p._id, label: p.name }))}
                                            value={professors.find(p => p._id === editForm.professor) ? { value: editForm.professor, label: professors.find(p => p._id === editForm.professor)?.name } : null}
                                            onChange={opt => setEditForm(f => ({ ...f, professor: opt?.value || '' }))}
                                            classNamePrefix="react-select"
                                            placeholder="Select professor..."
                                            styles={{
                                                control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                                menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                                singleValue: (base) => ({ ...base, color: 'white' }),
                                                option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-purple-200 mb-1">Users</label>
                                        <Select
                                            isMulti
                                            isSearchable
                                            isDisabled={fetchingDropdowns || availableUsersLoading || !editForm.course}
                                            closeMenuOnSelect={false}
                                            hideSelectedOptions={false}
                                            options={[
                                                ...editUserBreakdown.assigned.map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: true })),
                                                ...editUserBreakdown.available.map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: false })),
                                            ]}
                                            value={[
                                                ...editUserBreakdown.assigned,
                                                ...editUserBreakdown.available
                                            ]
                                                .filter(u => editForm.users.includes(u._id))
                                                .map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: !!editUserBreakdown.assigned.find(a => a._id === u._id) }))}
                                            onChange={opts => setEditForm(f => ({ ...f, users: opts.map(o => typeof o.value === 'object' && o.value._id ? o.value._id : o.value) }))}
                                            classNamePrefix="react-select"
                                            placeholder={editForm.course ? (availableUsersLoading ? "Loading users..." : "Select users...") : "Select a course first"}
                                            styles={{
                                                control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                                menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                                multiValue: (base) => ({ ...base, background: '#a78bfa', color: 'white' }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    background: state.isFocused ? '#a78bfa' : 'transparent',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    opacity: state.data.isAssigned ? 1 : 1,
                                                    cursor: 'pointer',
                                                }),
                                                input: (base) => ({ ...base, color: 'white' }),
                                                singleValue: (base) => ({ ...base, color: 'white' })
                                            }}
                                            components={{
                                                Option: (props) => (
                                                    <div {...props.innerProps} className={props.className} style={{ ...props.style, cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={props.isSelected}
                                                            onChange={() => null}
                                                            style={{ marginRight: 8, cursor: 'pointer' }}
                                                        />
                                                        <span>{props.label}</span>
                                                        <span className="ml-2 text-xs text-pink-200/80">({props.data.email})</span>
                                                        {props.data.isAssigned && <span className="ml-2 text-xs text-green-300/80">(Already assigned)</span>}
                                                    </div>
                                                )
                                            }}
                                        />
                                        <div className="text-xs text-purple-200 mt-1">You can select multiple users. Already assigned users are pre-selected.</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-purple-200 mb-1">Start Date</label>
                                            <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-purple-200 mb-1">End Date</label>
                                            <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                        </div>
                                    </div>
                                    {/* Mark completed modules, lessons, topics */}
                                    {editSelectedCourseDetails && (
                                        <div className="space-y-4">
                                            <label className="block text-purple-200 mb-1 font-bold">Mark Completed Modules, Lessons, Topics</label>
                                            <div className="space-y-2">
                                                {editSelectedCourseDetails.modules?.map(module => (
                                                    <div key={module._id} className="bg-[#312e81]/30 rounded-xl p-3 mb-2 border border-purple-400/20">
                                                        <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={editForm.completedModules.includes(module._id)}
                                                                onChange={e => {
                                                                    setEditForm(f => {
                                                                        const arr = f.completedModules.includes(module._id)
                                                                            ? f.completedModules.filter(id => id !== module._id)
                                                                            : [...f.completedModules, module._id];
                                                                        return { ...f, completedModules: arr };
                                                                    });
                                                                }}
                                                            />
                                                            <span className="font-bold text-pink-200">{module.moduleTitle}</span>
                                                        </label>
                                                        <div className="ml-6 space-y-1">
                                                            {module.lessons?.map(lesson => (
                                                                <label key={lesson._id} className="flex items-center gap-2 mb-1 cursor-pointer select-none">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editForm.completedLessons.includes(lesson._id)}
                                                                        onChange={e => {
                                                                            setEditForm(f => {
                                                                                const arr = f.completedLessons.includes(lesson._id)
                                                                                    ? f.completedLessons.filter(id => id !== lesson._id)
                                                                                    : [...f.completedLessons, lesson._id];
                                                                                return { ...f, completedLessons: arr };
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span className="text-blue-200">{lesson.title}</span>
                                                                    {lesson.topics && lesson.topics.length > 0 && (
                                                                        <div className="ml-4 flex flex-wrap gap-2">
                                                                            {lesson.topics.map(topic => (
                                                                                <label key={topic._id} className="flex items-center gap-1 text-xs cursor-pointer select-none">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={editForm.completedTopics.includes(topic._id)}
                                                                                        onChange={e => {
                                                                                            setEditForm(f => {
                                                                                                const arr = f.completedTopics.includes(topic._id)
                                                                                                    ? f.completedTopics.filter(id => id !== topic._id)
                                                                                                    : [...f.completedTopics, topic._id];
                                                                                                return { ...f, completedTopics: arr };
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                    <span className="text-pink-200">{topic.title}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        <label className="block text-purple-200 mb-1 flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={!!editForm.markAsCompleted}
                                                onChange={e => setEditForm(f => ({ ...f, markAsCompleted: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            Course Completed
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-6">
                                    <button type="submit" disabled={editModalLoading} className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg">
                                        {editModalLoading ? 'Saving...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
                , document.getElementById('modal-root'))}
        </div>
    );
};

export default BatchAdmin; <style>{`
  /* Force all MUI DatePicker input text to white */
  input.MuiInputBase-input, 
  .MuiOutlinedInput-input, 
  .MuiInputBase-input {
    color: #fff !important;
    font-weight: 700;
  }
  /* Also target autofill */
  input.MuiInputBase-input:-webkit-autofill,
  .MuiOutlinedInput-input:-webkit-autofill,
  .MuiInputBase-input:-webkit-autofill {
    -webkit-text-fill-color: #fff !important;
    transition: background-color 9999s ease-in-out 0s;
  }
`}</style>

