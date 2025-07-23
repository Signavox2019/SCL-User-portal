import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import BaseUrl from '../Api';
import axios from 'axios';
import {
  Group as GroupIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  EmojiEvents as EmojiEventsIcon,
  LocalLibrary as LocalLibraryIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  SupervisorAccount as SupervisorAccountIcon,
  HowToReg as HowToRegIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const filterOptions = {
  role: [
    { label: 'All Roles', value: '' },
    { label: 'Intern', value: 'intern' },
    { label: 'Admin', value: 'admin' }
  ],
  approveStatus: [
    { label: 'All Status', value: '' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Waiting', value: 'waiting' }
  ],
  currentYear: [
    { label: '1st Year', value: '1st Year' },
    { label: '2nd Year', value: '2nd Year' },
    { label: '3rd Year', value: '3rd Year' },
    { label: '4th Year', value: '4th Year' },
    { label: 'Graduated', value: 'Graduated' }
  ],
  degree: [
    { label: 'Bachelors', value: 'Bachelors' },
    { label: 'Masters', value: 'Masters' },
    { label: 'PhD', value: 'PhD' }
  ]
};

const userTableFields = [
  { key: 'name', label: 'Name', icon: <PersonIcon className="mr-1 text-pink-400" /> },
  { key: 'email', label: 'Email', icon: <EmailIcon className="mr-1 text-blue-400" /> },
  { key: 'phone', label: 'Phone', icon: <PhoneIcon className="mr-1 text-yellow-400" /> },
  { key: 'collegeName', label: 'College', icon: <SchoolIcon className="mr-1 text-purple-400" /> },
  { key: 'department', label: 'Department', icon: <BusinessIcon className="mr-1 text-pink-300" /> },
  { key: 'role', label: 'Role', icon: <StarIcon className="mr-1 text-yellow-400" /> },
  { key: 'isApproved', label: 'Status' },
];

const userRoleColors = ['#a78bfa', '#f472b6', '#818cf8'];
const approvalBarColors = ['#10b981', '#f59e0b'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    approveStatus: '',
    currentYear: '',
    degree: ''
  });
  const [viewModal, setViewModal] = useState({ open: false, user: null, loading: false, error: null });
  const [actionLoading, setActionLoading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, user: null });
  const [statusConfirm, setStatusConfirm] = useState({ open: false, user: null, action: null });
  const [userStats, setUserStats] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  const [userStatsError, setUserStatsError] = useState(null);
  // Add professor stats state
  const [professorStats, setProfessorStats] = useState(null);
  const [professorStatsLoading, setProfessorStatsLoading] = useState(true);
  const [professorStatsError, setProfessorStatsError] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, user: null, loading: false, error: null, newStatus: '' });
  const [addModal, setAddModal] = useState({ open: false, loading: false, error: null });
  const initialFormData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'intern',
    collegeName: '',
    department: '',
    university: '',
    degree: 'Bachelors',
    specialization: '',
    cgpa: '',
    currentYear: '1st Year',
    isGraduated: false,
    yearOfPassing: '',
    hasExperience: false,
    previousCompany: '',
    position: '',
    yearsOfExperience: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModal, setEditModal] = useState({ open: false, user: null, loading: false, error: null });
  const [editForm, setEditForm] = useState(initialFormData);

  // Toast helper
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message, { position: 'top-right', autoClose: 3000 });
    else if (type === 'error') toast.error(message, { position: 'top-right', autoClose: 4000 });
    else toast.info(message, { position: 'top-right', autoClose: 3000 });
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BaseUrl}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats/metrics
  useEffect(() => {
    const fetchUserStats = async () => {
      setUserStatsLoading(true);
      setUserStatsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseUrl}/users/stats/metrics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserStats(res.data);
      } catch (err) {
        setUserStatsError(err.response?.data?.message || err.message);
      } finally {
        setUserStatsLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  // Fetch professor stats/metrics
  useEffect(() => {
    const fetchProfessorStats = async () => {
      setProfessorStatsLoading(true);
      setProfessorStatsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseUrl}/professors/stats/metrics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfessorStats(res.data);
      } catch (err) {
        setProfessorStatsError(err.response?.data?.message || err.message);
      } finally {
        setProfessorStatsLoading(false);
      }
    };
    fetchProfessorStats();
  }, []);

  // Prepare chart data
  const userPieData = userStats ? [
    { name: 'Interns', value: userStats.counts?.interns || 0 },
    { name: 'Professors', value: userStats.counts?.professors || 0 },
    { name: 'Admins', value: userStats.counts?.admins || 0 },
  ] : [];

  const approvalBarData = userStats ? [
    { name: 'Approved', value: userStats.counts?.approvedUsers || 0 },
    { name: 'Pending', value: userStats.counts?.pendingApprovals || 0 },
    { name: 'Rejected', value: userStats.counts?.rejectedUsers || 0 }
  ].map(item => ({
    ...item,
    value: parseInt(item.value) || 0 // Ensure values are numbers
  })) : [];

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered and searched users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.collegeName && u.collegeName.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
  
    const matchesRole = filters.role ? u.role === filters.role : true;
    const matchesStatus = filters.approveStatus ? u.approveStatus === filters.approveStatus : true;
    const matchesYear = filters.currentYear ? u.currentYear === filters.currentYear : true;
    const matchesDegree = filters.degree ? u.degree === filters.degree : true;

    return matchesSearch && matchesRole && matchesStatus && matchesYear && matchesDegree;
  });

  // Approve/Reject user
  // const handleStatusChange = async (userId, isApproved) => {
  //   setActionLoading(l => ({ ...l, [userId]: true }));
  //   try {
  //     const token = localStorage.getItem('token');
  //     const res = await axios.put(
  //       `${BaseUrl}/users/status/${userId}`,
  //       { isApproved: isApproved ? "true" : "false" },
  //       { headers: { 'Authorization': `Bearer ${token}` } }
  //     );
  //     showToast(res.data.message || 'User status updated');
  //     // Update the user in the UI without refetching all users
  //     setUsers(users => users.map(u => u._id === userId ? { ...u, isApproved } : u));
  //   } catch (err) {
  //     showToast(err.response?.data?.message || err.message, 'error');
  //   } finally {
  //     setActionLoading(l => ({ ...l, [userId]: false }));
  //   }
  // };

  // View user details
  const handleViewUser = async (userId) => {
    setViewModal({ open: true, user: null, loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      // Use GET /users/:id endpoint
      const res = await axios.get(`${BaseUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setViewModal({ open: true, user: res.data, loading: false, error: null });
    } catch (err) {
      setViewModal({ open: true, user: null, loading: false, error: err.response?.data?.message || err.message });
    }
  };

  // Close view modal
  const closeViewModal = () => setViewModal({ open: false, user: null, loading: false, error: null });

  // Delete user
  const handleDeleteUser = async (userId) => {
    setDeleting(d => ({ ...d, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${BaseUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u._id !== userId));
      showToast(res.data.message || 'User deleted successfully');
      setDeleteConfirm({ open: false, user: null });
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setDeleting(d => ({ ...d, [userId]: false }));
    }
  };

  function getStatusColorClass(status) {
    if (status === 'approved') return 'bg-green-500/80 text-white';
    if (status === 'rejected') return 'bg-red-500/80 text-white';
    return 'bg-yellow-400/80 text-black';
  }

  const handleStatusModalSubmit = async () => {
    setStatusModal(s => ({ ...s, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${BaseUrl}/users/status/${statusModal.user._id}`,
        { approveStatus: statusModal.newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Update the user in the UI with the full user object from response
      setUsers(users => users.map(u => 
        u._id === statusModal.user._id ? res.data.user : u
      ));
      
      showToast(res.data.message || 'User status updated successfully');
      setStatusModal({ open: false, user: null, loading: false, error: null, newStatus: '' });
    } catch (err) {
      setStatusModal(s => ({ ...s, loading: false, error: err.response?.data?.message || err.message }));
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleAddUser = async () => {
    setAddModal(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      // Remove password from request body
      const {
        name, email, phone, role, collegeName, department, university, degree, specialization, cgpa, currentYear, isGraduated, yearOfPassing, hasExperience, previousCompany, position, yearsOfExperience
      } = formData;
      const reqBody = {
        name, email, phone, role, collegeName, department, university, degree, specialization, cgpa, currentYear, isGraduated, yearOfPassing, hasExperience, previousCompany, position, yearsOfExperience
      };
      const res = await axios.post(
        `${BaseUrl}/auth/register`,
        reqBody,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Add the new user to the list
      setUsers(prev => [res.data.user, ...prev]);
      // Reset form and close modal
      setFormData(initialFormData);
      setAddModal({ open: false, loading: false, error: null });
      // Show success message
      showToast(res.data.message || 'User added successfully');
      // Refresh user stats
      fetchUsers();
    } catch (err) {
      setAddModal(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || err.message
      }));
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  // Pagination logic
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;

  // Add this function to handle edit icon click
  const handleEditUserClick = (user) => {
    setEditForm({ ...user, password: '' }); // Don't prefill password
    setEditModal({ open: true, user, loading: false, error: null });
  };

  // Add this function to handle edit form submit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditModal((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      // Remove password from request body
      const {
        name, email, phone, role, collegeName, department, university, degree, specialization, cgpa, currentYear, isGraduated, yearOfPassing, hasExperience, previousCompany, position, yearsOfExperience
      } = editForm;
      const reqBody = {
        name, email, phone, role, collegeName, department, university, degree, specialization, cgpa, currentYear, isGraduated, yearOfPassing, hasExperience, previousCompany, position, yearsOfExperience
      };
      const res = await axios.put(
        `${BaseUrl}/users/admin/update-user/${editModal.user._id}`,
        reqBody,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Refetch all users to ensure UI is up to date
      await fetchUsers();
      setEditModal({ open: false, user: null, loading: false, error: null });
      showToast(res.data.message || 'User updated successfully');
    } catch (err) {
      setEditModal((prev) => ({ ...prev, loading: false, error: err.response?.data?.message || err.message }));
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <>
      <div className="space-y-10 pb-10 mt-5 py-5">
        {/* Loader (Dashboard style) */}
        {loading && (
          <div className="flex justify-center items-center h-96 w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          </div>
        )}
        {!loading && (
        <>
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 -mt-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
              <GroupIcon className="text-white text-4xl drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Users Directory</h1>
              <p className="text-lg text-purple-100/80 mt-2">Browse, search, and filter all users in style!</p>
            </div>
          </div>
          <button
            onClick={() => setAddModal({ open: true, loading: false, error: null })}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <AddIcon />
            Add User
          </button>
        </div>
        {/* Metric Cards & Charts */}
        <div className="flex flex-col gap-2 w-full mb-2">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full ">
            {/* Users: Total Users & Role Distribution */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-blue-400/30 to-blue-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
                <GroupIcon className="text-2xl text-blue-100 drop-shadow-lg" />
              </div>
              <div className="z-10 flex flex-col items-center mt-10">
                <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">
                  {userStatsLoading ? <div className="animate-spin rounded-full h-7 w-7 border-b-4 border-purple-400"></div> : userStats?.totalUsers || 0}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-blue-100/90">Total Users</div>
                <div className="flex gap-8 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-purple-100/90 font-semibold">Interns</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {userStatsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-4 border-yellow-400"></div> : userStats?.counts?.interns || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-purple-100/90 font-semibold">Admins</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-pink-300">
                      {userStatsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-4 border-pink-400"></div> : userStats?.counts?.admins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Approval Status: Approved, Pending & Rejected */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
                <HowToRegIcon className="text-2xl text-green-100 drop-shadow-lg" />
              </div>
              <div className="z-10 flex flex-col items-center mt-10">
                <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">
                  {userStatsLoading ? <div className="animate-spin rounded-full h-7 w-7 border-b-4 border-green-400"></div> : (userStats?.counts?.approvedUsers || 0) + (userStats?.counts?.pendingApprovals || 0) + (userStats?.counts?.rejectedUsers || 0)}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-green-100/90">Total Registrations</div>
                <div className="flex gap-4 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-100/90 font-semibold">Approved</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-green-300">
                      {userStatsLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-4 border-green-400"></div> : userStats?.counts?.approvedUsers || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-yellow-100/90 font-semibold">Pending</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {userStatsLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-4 border-yellow-400"></div> : userStats?.counts?.pendingApprovals || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-red-100/90 font-semibold">Rejected</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-red-300">
                      {userStatsLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-4 border-red-400"></div> : userStats?.counts?.rejectedUsers || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Professors: Total, Active, Inactive */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
                <SchoolIcon className="text-2xl text-purple-100 drop-shadow-lg" />
              </div>
              <div className="z-10 flex flex-col items-center mt-10">
                <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">
                  {professorStatsLoading ? <div className="animate-spin rounded-full h-7 w-7 border-b-4 border-purple-400"></div> : professorStats?.totalProfessors ?? '-'}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-purple-100/90">Total Professors</div>
                <div className="flex gap-8 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-100/90 font-semibold">Active</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-green-300">
                      {professorStatsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-4 border-green-400"></div> : professorStats?.activeProfessors ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-yellow-100/90 font-semibold">Inactive</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {professorStatsLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-4 border-yellow-400"></div> : professorStats?.inactiveProfessors ?? '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 mt-8 w-full">
            {/* User Roles Pie Chart */}
            <div className="bg-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[340px] max-w-[440px] w-full  transition-all duration-300">
              <div className="flex items-center gap-4 w-full mb-6 mt-0 pt-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-purple-400 shadow-lg">
                  <PieChartIcon className="text-white text-3xl drop-shadow-lg" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">User Roles Distribution</div>
                  <div className="text-sm text-purple-100/80 mt-1">Breakdown of user roles</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={userRoleColors[index % userRoleColors.length]} />
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

            {/* Approval Status Bar Chart */}
            <div className="bg-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[300px] max-w-[800px] w-full lg:col-span-2  transition-all duration-300">
              <div className="mb-6 flex items-center gap-4 w-full">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-purple-400 shadow-lg">
                  <BarChartIcon className="text-white text-3xl drop-shadow-lg" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">Approval Status</div>
                  <div className="text-sm text-green-100/80 mt-1">Approved vs Pending vs Rejected</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={approvalBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa33" />
                  <XAxis dataKey="name" stroke="#c4b5fd" />
                  <YAxis stroke="#c4b5fd" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }}
                    formatter={(value) => [parseInt(value) || 0, 'Users']}
                  />
                  <Bar dataKey="value" label={{ position: 'top', fill: '#fff', fontWeight: 700 }}>
                    {approvalBarData.map((entry, index) => (
                      <Cell 
                        key={`cell-bar-${index}`} 
                        fill={entry.name === 'Approved' ? '#10b981' : entry.name === 'Pending' ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pulse-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          .animate-pulse-slow { animation: pulse-slow 2.5s infinite; }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
          @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}</style>
        {/* Search & Filter Section + Users Table (Unified Card) */}
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative w-full lg:w-[480px] xl:w-[600px] max-w-full transition-all duration-300">
              <input
                type="text"
                placeholder="Search users by name, email, college..."
                className="w-full py-3 pl-12 pr-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white placeholder-purple-200/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg text-base md:text-lg"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {/* Role Filter */}
              <div className="relative min-w-[140px]">
                <select
                  className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
                  value={filters.role}
                  onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
                >
                  {filterOptions.role.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-black bg-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[140px]">
                <select
                  className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
                  value={filters.approveStatus}
                  onChange={e => setFilters(prev => ({ ...prev, approveStatus: e.target.value }))}
                >
                  {filterOptions.approveStatus.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-black bg-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Users Table (now inside the card) */}
          <div className="rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 w-full max-w-full mt-6 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CircularProgress size={60} thickness={5} style={{ color: '#a78bfa' }} />
              </div>
            ) : error ? (
              <div className="text-center text-red-400 font-bold py-10 flex flex-col items-center gap-2">
                <ErrorIcon className="text-4xl" />
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <GroupIcon className="text-4xl text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Users Found</h3>
                <p className="text-purple-200/80">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[900px] text-sm text-left text-purple-100 table-auto">
                  <thead className="sticky top-0 z-20 bg-gradient-to-r from-purple-900/90 to-blue-900/90">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">Name</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">Email</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">Phone</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">College</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">Department</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base">Status</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-base text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-blue-900/40 transition-all duration-200 border-b border-purple-900/40 last:border-b-0">
                        <td className="px-4 py-3 break-words whitespace-pre-line" title={u.name} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.name}</td>
                        <td className="px-4 py-3 break-words whitespace-pre-line" title={u.email} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.email}</td>
                        <td className="px-4 py-3 break-words whitespace-pre-line" title={u.phone} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.phone}</td>
                        <td className="px-4 py-3 break-words whitespace-pre-line" title={u.collegeName} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.collegeName}</td>
                        <td className="px-4 py-3 break-words whitespace-pre-line" title={u.department} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.department}</td>
                        <td className="px-4 py-3 text-left">
                          <button
                            className={`px-3 py-1 rounded-full font-bold capitalize ${getStatusColorClass(u.approveStatus)} hover:scale-105 transition`}
                            onClick={() => setStatusModal({ open: true, user: u, loading: false, error: null, newStatus: u.approveStatus })}
                          >
                            {u.approveStatus}
                          </button>
                        </td>
                        {/* Action column: View and Delete icons */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center items-center">
                            <button title="View" onClick={() => handleViewUser(u._id)} className="p-1.5 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white shadow-md transition-transform hover:scale-110">
                              <VisibilityIcon fontSize="small" />
                            </button>
                            <button title="Edit" onClick={() => handleEditUserClick(u)} className="p-1.5 rounded-full bg-purple-500/80 hover:bg-purple-600 text-white shadow-md transition-transform hover:scale-110">
                              <EditIcon fontSize="small" />
                            </button>
                            <button title="Delete" disabled={deleting[u._id]} onClick={() => setDeleteConfirm({ open: true, user: u })} className="p-1.5 rounded-full bg-pink-500/80 hover:bg-pink-600 text-white shadow-md transition-transform hover:scale-110">
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Pagination and Results Count (below table, inside card, outside table) */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 bg-transparent relative z-0 mt-4">
              <div className="flex-1" />
              <div className="flex flex-wrap items-center gap-6 justify-end w-full">
                {/* Rows per page dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-purple-200/80 text-sm">Rows per page:</span>
                  <Select
                    value={rowsPerPage}
                    onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    displayEmpty
                    size="small"
                    sx={{
                      minWidth: 70,
                      background: '#181a20',
                      color: 'white',
                      borderRadius: 1,
                      fontSize: 14,
                      boxShadow: '0 2px 8px #0002',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a78bfa' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f472b6' },
                      '& .MuiSvgIcon-root': { color: '#a78bfa' },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          background: '#181a20',
                          color: 'white',
                          borderRadius: 2,
                          mt: 0,
                          minWidth: 70,
                          boxShadow: '0 8px 24px #000a',
                          zIndex: 2000,
                        },
                        elevation: 8,
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    {[5,10, 25, 50, 100].map(opt => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                {/* Showing text */}
                <span className="text-purple-200/80 text-sm">
                  Showing {filteredUsers.length === 0 ? 0 : ((page - 1) * rowsPerPage + 1)}-
                  {Math.min(page * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Status Confirmation Modal */}
        {statusConfirm.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-green-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">{statusConfirm.action === 'accept' ? 'Approve User' : 'Reject User'}</h2>
              <p className="text-purple-200 mb-6">
                Are you sure you want to <span className="font-bold text-pink-300">{statusConfirm.action === 'accept' ? 'approve' : 'reject'}</span> the user <span className="font-bold text-pink-300">{statusConfirm.user?.name || statusConfirm.user?.email}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setStatusConfirm({ open: false, user: null, action: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={async () => { await handleStatusChange(statusConfirm.user._id, statusConfirm.action === 'accept'); setStatusConfirm({ open: false, user: null, action: null }); }} disabled={actionLoading[statusConfirm.user?._id]}>{actionLoading[statusConfirm.user?._id] ? (statusConfirm.action === 'accept' ? 'Approving...' : 'Rejecting...') : (statusConfirm.action === 'accept' ? 'Approve' : 'Reject')}</button>
              </div>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
        )}
        {/* Status Modal */}
        {statusModal.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-md mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop font-sans">
              {/* Accent Header Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
              {/* Close Button */}
              <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md"
                onClick={() => setStatusModal({ open: false, user: null, loading: false, error: null, newStatus: '' })}>
                <CloseIcon fontSize="large" />
              </button>
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar font-sans">
                <div className="text-2xl font-bold text-white mb-4">Change User Status</div>
                <div className="mb-4">
                  <div className="text-lg text-purple-200 mb-2">User: <span className="font-bold text-pink-300">{statusModal.user?.name}</span></div>
                  <div className="text-base text-blue-100 mb-2">Current Status: <span className="font-bold capitalize">{statusModal.user?.approveStatus}</span></div>
                </div>
                <div className="mb-6">
                  <label className="block text-purple-200 mb-2 font-semibold">Select New Status</label>
                  <select
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
                    value={statusModal.newStatus}
                    onChange={e => setStatusModal(s => ({ ...s, newStatus: e.target.value }))}
                  >
                    <option value="approved" className="text-black bg-white">Approved</option>
                    <option value="rejected" className="text-black bg-white">Rejected</option>
                    <option value="waiting" className="text-black bg-white">Waiting</option>
                  </select>
                </div>
                {statusModal.error && (
                  <div className="text-red-400 font-bold mb-4">{statusModal.error}</div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={() => setStatusModal({ open: false, user: null, loading: false, error: null, newStatus: '' })}
                    disabled={statusModal.loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-7 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={async () => {
                      await handleStatusModalSubmit();
                    }}
                    disabled={statusModal.loading || !statusModal.newStatus || statusModal.newStatus === statusModal.user?.approveStatus}
                  >
                    {statusModal.loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Add User Modal */}
        {addModal.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
              {/* Accent Header Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl" />
              
              {/* Close Button */}
              <button
                className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md"
                onClick={() => { setAddModal({ open: false, loading: false, error: null }); setFormData(initialFormData); }}
              >
                <CloseIcon fontSize="large" />
              </button>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <h2 className="text-3xl font-bold text-white mb-4">Add New User</h2>
                
                {/* Basic Details Section */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      >
                        <option value="intern">Intern</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">College Name</label>
                      <input
                        type="text"
                        value={formData.collegeName}
                        onChange={e => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">University</label>
                      <input
                        type="text"
                        value={formData.university}
                        onChange={e => setFormData(prev => ({ ...prev, university: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Degree</label>
                      <select
                        value={formData.degree}
                        onChange={e => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      >
                        <option value="Bachelors">Bachelors</option>
                        <option value="Masters">Masters</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Current Year</label>
                      <select
                        value={formData.currentYear}
                        onChange={e => setFormData(prev => ({ ...prev, currentYear: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={e => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">CGPA</label>
                      <input
                        type="text"
                        value={formData.cgpa}
                        onChange={e => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Year of Passing</label>
                      <input
                        type="text"
                        value={formData.yearOfPassing}
                        onChange={e => setFormData(prev => ({ ...prev, yearOfPassing: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Is Graduated?</label>
                      <select
                        value={formData.isGraduated ? 'yes' : 'no'}
                        onChange={e => setFormData(prev => ({ ...prev, isGraduated: e.target.value === 'yes' }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">Has Experience?</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hasExperience"
                            value="yes"
                            checked={formData.hasExperience === true}
                            onChange={() => setFormData(prev => ({ ...prev, hasExperience: true }))}
                            className="form-radio text-pink-500"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hasExperience"
                            value="no"
                            checked={formData.hasExperience === false}
                            onChange={() => setFormData(prev => ({ ...prev, hasExperience: false }))}
                            className="form-radio text-pink-500"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    <div />
                    {formData.hasExperience && (
                      <>
                        <div>
                          <label className="block text-purple-200 mb-1">Previous Company</label>
                          <input
                            type="text"
                            value={formData.previousCompany}
                            onChange={e => setFormData(prev => ({ ...prev, previousCompany: e.target.value }))}
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Position</label>
                          <input
                            type="text"
                            value={formData.position}
                            onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Years of Experience</label>
                          <input
                            type="text"
                            value={formData.yearsOfExperience}
                            onChange={e => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {addModal.error && (
                  <div className="mt-4 text-red-400 font-bold">{addModal.error}</div>
                )}

                {/* Submit/Cancel Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => { setAddModal({ open: false, loading: false, error: null }); setFormData(initialFormData); }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    disabled={addModal.loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={addModal.loading || !formData.name || !formData.email}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addModal.loading ? (
                      <>
                        <CircularProgress size={20} color="inherit" />
                        Creating...
                      </>
                    ) : (
                      <>Create User</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Delete User</h2>
              <p className="text-purple-200 mb-6">Are you sure you want to delete the user <span className="font-bold text-pink-300">{deleteConfirm.user?.name || deleteConfirm.user?.email}</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setDeleteConfirm({ open: false, user: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={async () => { await handleDeleteUser(deleteConfirm.user._id); }} disabled={deleting[deleteConfirm.user?._id]}>{deleting[deleteConfirm.user?._id] ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
        )}
        {/* View User Modal */}
        {viewModal.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[85vh] overflow-hidden animate-modalPop font-sans">
              {/* Accent Header Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
              
              {/* Close Button */}
              <button
                className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md"
                onClick={closeViewModal}
              >
                <CloseIcon fontSize="large" />
              </button>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar">
                {viewModal.loading ? (
                  <div className="flex justify-center items-center h-64">
                    <CircularProgress size={60} thickness={5} style={{ color: '#a78bfa' }} />
                  </div>
                ) : viewModal.error ? (
                  <div className="text-center text-red-400 font-bold py-10 flex flex-col items-center gap-2">
                    <ErrorIcon className="text-4xl" />
                    {viewModal.error}
                  </div>
                ) : viewModal.user && (
                  <div className="flex flex-col w-full gap-6 font-sans">
                    {/* Profile Section */}
                    <div className="relative flex flex-col sm:flex-row w-full items-start sm:items-center gap-6 py-2">
                      {/* Profile Image */}
                      <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-pink-400 shadow-lg bg-purple-900/40 flex items-center justify-center overflow-hidden">
                        <PersonIcon style={{ fontSize: '5rem' }} className="text-white" />
                      </div>

                      {/* User Details */}
                      <div className="flex-1 flex flex-col gap-3">
                        {/* Name */}
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">{viewModal.user.name}</h2>

                        {/* Contact Details (email and phone in one line) */}
                        <div className="flex flex-row flex-wrap items-center gap-6 text-purple-100">
                          <div className="flex items-center gap-2">
                            <EmailIcon className="text-pink-300 text-xl" />
                            <span className="text-base">{viewModal.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="text-pink-300 text-xl" />
                            <span className="text-base">{viewModal.user.phone || 'Not provided'}</span>
                          </div>
                        </div>

                        {/* Education Summary (Degree & Specialization moved to education details) */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-purple-100">
                          {viewModal.user.degree && (
                            <div className="flex items-center gap-2">
                              <SchoolIcon className="text-blue-400 text-xl" />
                              <span className="text-base">{viewModal.user.degree}</span>
                            </div>
                          )}
                          {viewModal.user.specialization && (
                            <div className="flex items-center gap-2">
                              <StarIcon className="text-pink-400 text-xl" />
                              <span className="text-base">{viewModal.user.specialization}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Education Details Section */}
                    <div className="w-full">
                      <div className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2" style={{letterSpacing: '0.01em'}}>
                        <SchoolIcon className="text-yellow-400" /> Education Details
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 w-full">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">College:</span>
                          <span className="text-purple-100">{viewModal.user.collegeName || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">University:</span>
                          <span className="text-purple-100">{viewModal.user.university || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Department:</span>
                          <span className="text-purple-100">{viewModal.user.department || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Degree:</span>
                          <span className="text-purple-100">{viewModal.user.degree || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Specialization:</span>
                          <span className="text-purple-100">{viewModal.user.specialization || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Current Year:</span>
                          <span className="text-purple-100">{viewModal.user.currentYear || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">CGPA:</span>
                          <span className="text-purple-100">{viewModal.user.cgpa || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Graduation Status:</span>
                          <span className="text-purple-100">{viewModal.user.isGraduated ? 'Graduated' : 'Not Graduated'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Year of Passing:</span>
                          <span className="text-purple-100">{viewModal.user.yearOfPassing || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Experience Details Section */}
                    <div className="w-full">
                      <div className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2" style={{letterSpacing: '0.01em'}}>
                        <WorkIcon className="text-green-400" /> Experience Details
                      </div>
                      {viewModal.user.hasExperience ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 w-full">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <span className="opacity-80">Company:</span>
                            <span className="text-purple-100">{viewModal.user.previousCompany}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white font-medium">
                            <span className="opacity-80">Position:</span>
                            <span className="text-purple-100">{viewModal.user.position}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white font-medium">
                            <span className="opacity-80">Years of Experience:</span>
                            <span className="text-purple-100">{viewModal.user.yearsOfExperience} years</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-purple-200">No prior experience</p>
                      )}
                    </div>

                    {/* Status & Registration Section */}
                    <div className="w-full">
                      <div className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2" style={{letterSpacing: '0.01em'}}>
                        <InfoIcon className="text-blue-400" /> Status & Registration
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 w-full">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Account Status:</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusColorClass(viewModal.user.approveStatus)}`}>
                            {viewModal.user.approveStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <span className="opacity-80">Registered On:</span>
                          <span className="text-purple-100">
                            {new Date(viewModal.user.registeredAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Edit User Modal */}
        {editModal.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-[#32296a] rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
              {/* Accent Header Bar */}
              <div className="h-2 w-full bg-pink-400 rounded-t-3xl mb-2" />
              {/* Close Button */}
              <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setEditModal({ open: false, user: null, loading: false, error: null })}>
                <CloseIcon fontSize="large" />
              </button>
              <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleEditUserSubmit}>
                <h2 className="text-3xl font-bold text-white mb-4 ">Edit User</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Name</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Email</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Phone</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Role</label>
                    <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="intern">Intern</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">College Name</label>
                    <input type="text" value={editForm.collegeName} onChange={e => setEditForm(f => ({ ...f, collegeName: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Department</label>
                    <input type="text" value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">University</label>
                    <input type="text" value={editForm.university} onChange={e => setEditForm(f => ({ ...f, university: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Degree</label>
                    <select value={editForm.degree} onChange={e => setEditForm(f => ({ ...f, degree: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="Bachelors">Bachelors</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Current Year</label>
                    <select value={editForm.currentYear} onChange={e => setEditForm(f => ({ ...f, currentYear: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Specialization</label>
                    <input type="text" value={editForm.specialization} onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">CGPA</label>
                    <input type="text" value={editForm.cgpa} onChange={e => setEditForm(f => ({ ...f, cgpa: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Year of Passing</label>
                    <input type="text" value={editForm.yearOfPassing} onChange={e => setEditForm(f => ({ ...f, yearOfPassing: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Is Graduated?</label>
                    <select value={editForm.isGraduated ? 'yes' : 'no'} onChange={e => setEditForm(f => ({ ...f, isGraduated: e.target.value === 'yes' }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Has Experience?</label>
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="editHasExperience"
                          value="yes"
                          checked={editForm.hasExperience === true}
                          onChange={() => setEditForm(f => ({ ...f, hasExperience: true }))}
                          className="form-radio text-pink-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="editHasExperience"
                          value="no"
                          checked={editForm.hasExperience === false}
                          onChange={() => setEditForm(f => ({ ...f, hasExperience: false }))}
                          className="form-radio text-pink-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  {editForm.hasExperience && (
                    <>
                      <div>
                        <label className="block text-purple-200 mb-1 font-semibold">Previous Company</label>
                        <input type="text" value={editForm.previousCompany} onChange={e => setEditForm(f => ({ ...f, previousCompany: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1 font-semibold">Position</label>
                        <input type="text" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1 font-semibold">Years of Experience</label>
                        <input type="text" value={editForm.yearsOfExperience} onChange={e => setEditForm(f => ({ ...f, yearsOfExperience: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                      </div>
                    </>
                  )}
                </div>
                {editModal.error && <div className="mt-4 text-red-400 font-bold">{editModal.error}</div>}
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-300" onClick={() => setEditModal({ open: false, user: null, loading: false, error: null })}>
                    Cancel
                  </button>
                  <button type="submit" disabled={editModal.loading} className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                    {editModal.loading ? 'Saving...' : 'Update User'}
                  </button>
                </div>
              </form>
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fadeIn {
                  animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
                }
                @keyframes modalPop {
                  0% { transform: scale(0.95) translateY(40px); opacity: 0; }
                  100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-modalPop {
                  animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1);
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #a78bfa55;
                  border-radius: 8px;
                }
              `}</style>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        </>
        )}
      </div>
    </>
  );
};

export default Users; 