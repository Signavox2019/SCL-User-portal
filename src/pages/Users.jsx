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
import universityOptions from '../assets/University_list.js';

const filterOptions = {
  role: [
    { label: 'All Roles', value: '' },
    { label: 'Intern', value: 'intern' },
    { label: 'Admin', value: 'admin' },
    { label: 'Support', value: 'support' }
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

const degreeOptions = [
  'B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'PhD', 'B.Sc', 'M.Sc', 'BCA', 'MCA'
];
const departmentOptions = [
  'Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering'
];
const yearOptions = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'
];

const Users = () => {
  // Add CSS for proper dropdown behavior
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      select {
        direction: ltr !important;
      }
      select option {
        direction: ltr !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
    // Personal
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    email: '',
    phone: '',
    role: 'intern',
    // Education
    collegeName: '',
    department: '',
    university: '',
    degree: '',
    specialization: '',
    cgpa: '',
    currentYear: '1st Year',
    isGraduated: false,
    yearOfPassing: '',
    // Experience
    hasExperience: false,
    previousCompany: '',
    position: '',
    yearsOfExperience: '',
    // Organization
    organizationName: 'Signavox Technologies',
    placeOfWork: 'Signavox Technologies',
    shiftTimings: { start: '09:30', end: '18:30' },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hrName: 'HR Manager',
    employeeAddress: '',
    stipend: '₹ 7,000',
    amount: {
      courseAmount: '',
      paidAmount: '',
      balanceAmount: ''
    },
  };
  const [formData, setFormData] = useState(initialFormData);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModal, setEditModal] = useState({ open: false, user: null, loading: false, error: null });
  const [editForm, setEditForm] = useState(initialFormData);
  const [loadingButtons, setLoadingButtons] = useState({}); // Track loading state for individual buttons

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

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
    { name: 'Support', value: userStats.counts?.support || 0 },
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
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.collegeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase());
  
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
      
      showToast(res.data.message || 'User status updated successfully', 'success');
      setStatusModal({ open: false, user: null, loading: false, error: null, newStatus: '' });
    } catch (err) {
      setStatusModal(s => ({ ...s, loading: false, error: err.response?.data?.message || err.message }));
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddModal(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        name: formData.name || [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' '),
        shiftTimings: {
          start: formData.shiftTimings.start,
          end: formData.shiftTimings.end,
        },
        workingDays: formData.workingDays,
        amount: {
          courseAmount: Number(formData.amount?.courseAmount) || 0,
          paidAmount: Number(formData.amount?.paidAmount) || 0,
          balanceAmount: Number(formData.amount?.balanceAmount) || 0,
        },
      };
      const res = await axios.post(
        `${BaseUrl}/auth/register`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUsers(prev => [res.data.user, ...prev]);
      setFormData(initialFormData);
      setAddModal({ open: false, loading: false, error: null });
      showToast(res.data.message || 'User added successfully', 'success');
    } catch (err) {
      setAddModal(prev => ({ ...prev, loading: false, error: err.response?.data?.message || err.message }));
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  // Pagination logic
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;

  // Add this function to handle edit icon click
  const handleEditUserClick = (user) => {
    // Parse the name into separate fields
    const nameParts = (user.name || '').split(' ');
    const editUserData = {
      ...user,
      password: '', // Don't prefill password
      title: user.title || 'Mr',
      firstName: nameParts[0] || '',
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
      shiftTimings: user.shiftTimings || { start: '09:30', end: '18:30' },
      workingDays: user.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      organizationName: user.organizationName || 'Signavox Technologies',
      placeOfWork: user.placeOfWork || 'Signavox Technologies',
      hrName: user.hrName || 'HR Manager',
      employeeAddress: user.employeeAddress || '',
      stipend: user.stipend || '₹ 7,000',
      amount: {
        courseAmount: user.amount?.courseAmount ?? '',
        paidAmount: user.amount?.paidAmount ?? '',
        balanceAmount: user.amount?.balanceAmount ?? '',
      },
    };
    setEditForm(editUserData);
    setEditModal({ open: true, user, loading: false, error: null });
  };

  // Add this function to handle edit form submit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    const userId = editModal.user._id;
    setLoadingButtons(prev => ({ ...prev, [userId]: true }));
    setEditModal((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('token');
      // Combine name fields
      const fullName = [editForm.firstName, editForm.middleName, editForm.lastName].filter(Boolean).join(' ');
      // Prepare request body with all fields
      const reqBody = {
        name: fullName,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        title: editForm.title,
        collegeName: editForm.collegeName,
        department: editForm.department,
        university: editForm.university,
        degree: editForm.degree,
        specialization: editForm.specialization,
        cgpa: editForm.cgpa,
        currentYear: editForm.currentYear,
        isGraduated: editForm.isGraduated,
        yearOfPassing: editForm.yearOfPassing,
        hasExperience: editForm.hasExperience,
        previousCompany: editForm.previousCompany,
        position: editForm.position,
        yearsOfExperience: editForm.yearsOfExperience,
        organizationName: editForm.organizationName,
        placeOfWork: editForm.placeOfWork,
        shiftTimings: editForm.shiftTimings,
        workingDays: editForm.workingDays,
        hrName: editForm.hrName,
        employeeAddress: editForm.employeeAddress,
        stipend: editForm.stipend,
        amount: {
          courseAmount: Number(editForm.amount?.courseAmount) || 0,
          paidAmount: Number(editForm.amount?.paidAmount) || 0,
          balanceAmount: Number(editForm.amount?.balanceAmount) || 0,
        },
      };
      
      const res = await axios.put(
        `${BaseUrl}/users/admin/update-user/${userId}`,
        reqBody,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Update the user in the local state instead of refetching all users
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, ...reqBody, name: fullName }
            : user
        )
      );
      
      setEditModal({ open: false, user: null, loading: false, error: null });
      showToast(res.data.message || 'User updated successfully', 'success');
    } catch (err) {
      setEditModal((prev) => ({ ...prev, loading: false, error: err.response?.data?.message || err.message }));
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoadingButtons(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <>
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 20000, position: 'fixed', top: 16, right: 16 }} />, document.body
      )}
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
                  {userStats?.totalUsers ?? '-'}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-blue-100/90">Total Users</div>
                <div className="flex gap-8 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-purple-100/90 font-semibold">Interns</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {userStats?.counts?.interns ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-purple-100/90 font-semibold">Admins</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-pink-300">
                      {userStats?.counts?.admins ?? '-'}
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
                  {(userStats?.counts?.approvedUsers ?? 0) + (userStats?.counts?.pendingApprovals ?? 0) + (userStats?.counts?.rejectedUsers ?? 0) || '-'}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-green-100/90">Total Registrations</div>
                <div className="flex gap-4 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-100/90 font-semibold">Approved</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-green-300">
                      {userStats?.counts?.approvedUsers ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-yellow-100/90 font-semibold">Pending</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {userStats?.counts?.pendingApprovals ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-red-100/90 font-semibold">Rejected</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-red-300">
                      {userStats?.counts?.rejectedUsers ?? '-'}
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
                  {professorStats?.totalProfessors ?? '-'}
                </div>
                <div className="text-md sm:text-xl font-bold mt-1 tracking-wide uppercase text-purple-100/90">Total Professors</div>
                <div className="flex gap-8 mt-2 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-green-100/90 font-semibold">Active</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-green-300">
                      {professorStats?.activeProfessors ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-yellow-100/90 font-semibold">Inactive</span>
                    <span className="text-xl sm:text-3xl font-extrabold text-yellow-300">
                      {professorStats?.inactiveProfessors ?? '-'}
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
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={approvalBarData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
          
          /* Enhanced Modal Animations */
          @keyframes modalSlideIn {
            0% { transform: translateY(50px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-modalSlideIn { animation: modalSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          
          @keyframes cardHover {
            0% { transform: translateY(0); }
            100% { transform: translateY(-4px); }
          }
          .hover\\:card-hover:hover { animation: cardHover 0.3s ease-out forwards; }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer { animation: shimmer 2s infinite; }
          
          /* Glassmorphism Effects */
          .glass-effect {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          /* Gradient Text */
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #a78bfa 0%, #f472b6 100%);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
          }
          
          /* Status Badge Animations */
          @keyframes statusPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(168, 139, 250, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(168, 139, 250, 0); }
          }
          .status-pulse { animation: statusPulse 2s infinite; }
          
          /* Card Hover Effects */
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          
          /* Icon Animations */
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .icon-float { animation: iconFloat 3s ease-in-out infinite; }
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
                            <button 
                              title="Edit" 
                              onClick={() => handleEditUserClick(u)} 
                              disabled={loadingButtons[u._id]}
                              className="p-1.5 rounded-full bg-purple-500/80 hover:bg-purple-600 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingButtons[u._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <EditIcon fontSize="small" />
                              )}
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
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4">
            <div className="bg-gradient-to-br from-green-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl shadow-2xl border border-white/10 p-6 max-w-md w-full mx-4">
              <div className="flex flex-col items-center text-center">
                {/* Status Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${statusConfirm.action === 'accept' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {statusConfirm.action === 'accept' ? (
                    <CheckCircleIcon className="text-green-400 text-3xl" />
                  ) : (
                    <ThumbDownIcon className="text-red-400 text-3xl" />
                  )}
                </div>
                
                {/* Modal Title */}
                <h2 className="text-xl font-bold text-white mb-3">
                  {statusConfirm.action === 'accept' ? 'Approve User' : 'Reject User'}
                </h2>
                
                {/* Modal Content */}
                <div className="w-full">
                  <p className="text-purple-200 mb-6 leading-relaxed">
                    Are you sure you want to{' '}
                    <span className="font-bold text-pink-300">
                      {statusConfirm.action === 'accept' ? 'approve' : 'reject'}
                    </span>{' '}
                    the user{' '}
                    <span className="font-bold text-pink-300 break-words">
                      {statusConfirm.user?.name || statusConfirm.user?.email}
                    </span>?
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 text-sm" 
                    onClick={() => setStatusConfirm({ open: false, user: null, action: null })}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm ${
                      statusConfirm.action === 'accept' 
                        ? 'bg-gradient-to-br from-green-500 to-purple-500' 
                        : 'bg-gradient-to-br from-red-500 to-pink-500'
                    }`}
                    onClick={async () => { 
                      await handleStatusChange(statusConfirm.user._id, statusConfirm.action === 'accept'); 
                      setStatusConfirm({ open: false, user: null, action: null }); 
                    }} 
                    disabled={actionLoading[statusConfirm.user?._id]}
                  >
                    {actionLoading[statusConfirm.user?._id] ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {statusConfirm.action === 'accept' ? 'Approving...' : 'Rejecting...'}
                      </span>
                    ) : (
                      statusConfirm.action === 'accept' ? 'Approve' : 'Reject'
                    )}
                  </button>
                </div>
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
                <form onSubmit={handleAddUser}>
                  {/* Personal Details */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple-200 mb-1">Title</label>
                        <select value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required>
                          {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">First Name</label>
                        <input type="text" value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Middle Name</label>
                        <input type="text" value={formData.middleName} onChange={e => setFormData(f => ({ ...f, middleName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Phone</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Role</label>
                        <select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required>
                          {['intern', 'admin', 'support'].map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Education Details */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple-200 mb-1">College Name</label>
                        <input type="text" value={formData.collegeName} onChange={e => setFormData(f => ({ ...f, collegeName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Department</label>
                        <select
                          value={formData.department}
                          onChange={e => setFormData(f => ({ ...f, department: e.target.value }))}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          required
                        >
                          <option value="">Select Department</option>
                          {departmentOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">University</label>
                        <select
                          value={formData.university}
                          onChange={e => setFormData(f => ({ ...f, university: e.target.value }))}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          style={{ direction: 'ltr' }}
                          required
                        >
                          <option value="">Select University</option>
                          {universityOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Degree</label>
                        <select
                          value={formData.degree}
                          onChange={e => setFormData(f => ({ ...f, degree: e.target.value }))}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          required
                        >
                          <option value="">Select Degree</option>
                          {degreeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Specialization</label>
                        <input type="text" value={formData.specialization} onChange={e => setFormData(f => ({ ...f, specialization: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">CGPA</label>
                        <input type="text" value={formData.cgpa} onChange={e => setFormData(f => ({ ...f, cgpa: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Current Year</label>
                        <select
                          value={formData.currentYear}
                          onChange={e => setFormData(f => ({ ...f, currentYear: e.target.value }))}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          required
                        >
                          <option value="">Select Year</option>
                          {yearOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Is Graduated?</label>
                        <select value={formData.isGraduated ? 'yes' : 'no'} onChange={e => setFormData(f => ({ ...f, isGraduated: e.target.value === 'yes' }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10">
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Year of Passing</label>
                        <input type="text" value={formData.yearOfPassing} onChange={e => setFormData(f => ({ ...f, yearOfPassing: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                    </div>
                  </div>
                  {/* Experience Details */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple-200 mb-1">Has Experience?</label>
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-1">
                            <input type="radio" name="hasExperience" value="yes" checked={formData.hasExperience === true} onChange={() => setFormData(f => ({ ...f, hasExperience: true }))} className="form-radio text-pink-500" />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input type="radio" name="hasExperience" value="no" checked={formData.hasExperience === false} onChange={() => setFormData(f => ({ ...f, hasExperience: false }))} className="form-radio text-pink-500" />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                      <div />
                      {formData.hasExperience && (
                        <>
                          <div>
                            <label className="block text-purple-200 mb-1">Previous Company</label>
                            <input type="text" value={formData.previousCompany} onChange={e => setFormData(f => ({ ...f, previousCompany: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                          </div>
                          <div>
                            <label className="block text-purple-200 mb-1">Position</label>
                            <input type="text" value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                          </div>
                          <div>
                            <label className="block text-purple-200 mb-1">Years of Experience</label>
                            <input type="text" value={formData.yearsOfExperience} onChange={e => setFormData(f => ({ ...f, yearsOfExperience: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Organization Details */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Organization Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-purple-200 mb-1">Organization Name</label>
                        <input type="text" value={formData.organizationName} onChange={e => setFormData(f => ({ ...f, organizationName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Place of Work</label>
                        <input type="text" value={formData.placeOfWork} onChange={e => setFormData(f => ({ ...f, placeOfWork: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Shift Start Time</label>
                        <input type="time" value={formData.shiftTimings.start} onChange={e => setFormData(f => ({ ...f, shiftTimings: { ...f.shiftTimings, start: e.target.value } }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Shift End Time</label>
                        <input type="time" value={formData.shiftTimings.end} onChange={e => setFormData(f => ({ ...f, shiftTimings: { ...f.shiftTimings, end: e.target.value } }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-purple-200 mb-1">Working Days</label>
                        <div className="flex flex-wrap gap-4">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <label key={day} className="flex items-center gap-2 text-purple-100">
                              <input
                                type="checkbox"
                                checked={formData.workingDays.includes(day)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setFormData(f => ({ ...f, workingDays: [...f.workingDays, day] }));
                                  } else {
                                    setFormData(f => ({ ...f, workingDays: f.workingDays.filter(d => d !== day) }));
                                  }
                                }}
                                className="form-checkbox text-pink-500"
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">HR Name</label>
                        <input type="text" value={formData.hrName} onChange={e => setFormData(f => ({ ...f, hrName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Employee Address</label>
                        <input type="text" value={formData.employeeAddress} onChange={e => setFormData(f => ({ ...f, employeeAddress: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Stipend</label>
                        <input type="text" value={formData.stipend} onChange={e => setFormData(f => ({ ...f, stipend: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-purple-200 mb-2">Course Payment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-purple-200 mb-1">Course Amount</label>
                          <input
                            type="number"
                            name="courseAmount"
                            value={formData.amount.courseAmount}
                            onChange={e => {
                              const value = e.target.value;
                              setFormData(f => {
                                const newAmount = {
                                  ...f.amount,
                                  courseAmount: value,
                                };
                                const course = Number(newAmount.courseAmount) || 0;
                                const paid = Number(newAmount.paidAmount) || 0;
                                newAmount.balanceAmount = course - paid;
                                return { ...f, amount: newAmount };
                              });
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Paid Amount</label>
                          <input
                            type="number"
                            name="paidAmount"
                            value={formData.amount.paidAmount}
                            onChange={e => {
                              const value = e.target.value;
                              setFormData(f => {
                                const newAmount = {
                                  ...f.amount,
                                  paidAmount: value,
                                };
                                const course = Number(newAmount.courseAmount) || 0;
                                const paid = Number(newAmount.paidAmount) || 0;
                                newAmount.balanceAmount = course - paid;
                                return { ...f, amount: newAmount };
                              });
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Balance Amount</label>
                          <input
                            type="number"
                            value={formData.amount.balanceAmount}
                            readOnly
                            className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 bg-opacity-60 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {addModal.error && (
                    <div className="mt-4 text-red-400 font-bold">{addModal.error}</div>
                  )}
                  {/* Submit/Cancel Buttons */}
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => { setAddModal({ open: false, loading: false, error: null }); setFormData(initialFormData); }}
                      className="px-8 py-3 rounded-xl bg-transparent border text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      disabled={addModal.loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addModal.loading || !formData.firstName || !formData.lastName || !formData.email}
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
                </form>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn p-4">
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-6 max-w-md w-full mx-4">
              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <DeleteIcon className="text-red-400 text-3xl" />
                </div>
                
                {/* Modal Title */}
                <h2 className="text-xl font-bold text-white mb-3">Delete User</h2>
                
                {/* Modal Content */}
                <div className="w-full">
                  <p className="text-purple-200 mb-6 leading-relaxed">
                    Are you sure you want to delete the user{' '}
                    <span className="font-bold text-pink-300 break-words">
                      {deleteConfirm.user?.name || deleteConfirm.user?.email}
                    </span>?
                  </p>
                  <p className="text-red-300 text-sm mb-6 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 text-sm" 
                    onClick={() => setDeleteConfirm({ open: false, user: null })}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm" 
                    onClick={async () => { await handleDeleteUser(deleteConfirm.user._id); }} 
                    disabled={deleting[deleteConfirm.user?._id]}
                  >
                    {deleting[deleteConfirm.user?._id] ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </span>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
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
          <div 
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn p-4"
            onClick={closeViewModal}
          >
            <div 
              className="relative w-full max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#1a1a2e]/95 via-[#16213e]/95 to-[#0f3460]/95 rounded-3xl shadow-2xl border border-purple-400/20 flex flex-col max-h-[90vh] overflow-hidden animate-modalSlideIn font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Header Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-t-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
              
              {/* Close Button */}
              <button
                className="absolute top-6 right-6 text-purple-200 hover:text-pink-400 transition-all duration-300 z-10 bg-white/10 rounded-full p-2 shadow-lg backdrop-blur-md hover:bg-white/20 hover:scale-110"
                onClick={closeViewModal}
              >
                <CloseIcon fontSize="large" />
              </button>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6 custom-scrollbar">
                {viewModal.loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <CircularProgress size={80} thickness={4} style={{ color: '#a78bfa' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-200 font-medium text-lg mb-2">Loading user details...</p>
                        <p className="text-purple-300 text-sm">Please wait while we fetch the information</p>
                      </div>
                    </div>
                  </div>
                ) : viewModal.error ? (
                  <div className="text-center text-red-400 font-bold py-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <ErrorIcon className="text-3xl" />
                    </div>
                    <p className="text-lg">{viewModal.error}</p>
                  </div>
                ) : viewModal.user && (
                  <div className="flex flex-col w-full gap-8 font-sans">
                    {/* Hero Profile Section */}
                    <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                      {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-t-2xl"></div> */}
                      
                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                        {/* Profile Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-gradient-to-r from-pink-400 to-purple-400 shadow-2xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full"></div>
                            <PersonIcon style={{ fontSize: '4rem' }} className="text-white relative z-10" />
                          </div>
                                                     {/* Status Badge */}
                           <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold capitalize shadow-lg status-pulse ${getStatusColorClass(viewModal.user.approveStatus)}`}>
                             {viewModal.user.approveStatus}
                           </div>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 flex flex-col gap-4">
                          <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-wide">{viewModal.user.name}</h2>
                            <p className="text-xl text-purple-200 font-medium">{viewModal.user.role?.charAt(0).toUpperCase() + viewModal.user.role?.slice(1) || 'User'}</p>
                          </div>
                          
                          {/* Contact Info Cards */}
                                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm card-hover hover:bg-white/10 transition-all duration-300">
                               <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center icon-float">
                                 <EmailIcon className="text-pink-400 text-xl" />
                               </div>
                               <div>
                                 <p className="text-xs text-purple-300 uppercase tracking-wide">Email</p>
                                 <p className="text-white font-medium">{viewModal.user.email}</p>
                               </div>
                             </div>
                             
                             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm card-hover hover:bg-white/10 transition-all duration-300">
                               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center icon-float">
                                 <PhoneIcon className="text-blue-400 text-xl" />
                               </div>
                               <div>
                                 <p className="text-xs text-purple-300 uppercase tracking-wide">Phone</p>
                                 <p className="text-white font-medium">{viewModal.user.phone || 'Not provided'}</p>
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Information Sections Grid */}
                    <div className="flex flex-col gap-6">
                      {/* Education Section */}
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm card-hover hover:from-blue-500/15 hover:to-purple-500/15 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <SchoolIcon className="text-blue-400 text-2xl" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">Education</h3>
                        </div>
                        
                                                 <div className="space-y-4">
                           <div className="flex flex-wrap gap-4">
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 card-hover hover:bg-white/10 transition-all duration-300 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">College</p>
                               <p className="text-white font-medium break-words">{viewModal.user.collegeName || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">University</p>
                               <p className="text-white font-medium break-words">{viewModal.user.university || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Department</p>
                               <p className="text-white font-medium break-words">{viewModal.user.department || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Degree</p>
                               <p className="text-white font-medium break-words">{viewModal.user.degree || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Specialization</p>
                               <p className="text-white font-medium break-words">{viewModal.user.specialization || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Current Year</p>
                               <p className="text-white font-medium break-words">{viewModal.user.currentYear || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">CGPA</p>
                               <p className="text-white font-medium break-words">{viewModal.user.cgpa || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Graduation Status</p>
                               <p className="text-white font-medium break-words">{viewModal.user.isGraduated ? 'Graduated' : 'Not Graduated'}</p>
                             </div>
                             {viewModal.user.yearOfPassing && (
                               <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                                 <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Year of Passing</p>
                                 <p className="text-white font-medium break-words">{viewModal.user.yearOfPassing}</p>
                               </div>
                             )}
                           </div>
                         </div>
                      </div>

                      {/* Organization Section */}
                      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm card-hover hover:from-green-500/15 hover:to-blue-500/15 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <BusinessIcon className="text-green-400 text-2xl" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">Organization</h3>
                        </div>
                        
                                                 <div className="space-y-4">
                           <div className="flex flex-wrap gap-4">
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Organization Name</p>
                               <p className="text-white font-medium break-words">{viewModal.user.organizationName || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Place of Work</p>
                               <p className="text-white font-medium break-words">{viewModal.user.placeOfWork || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Shift Timings</p>
                               <p className="text-white font-medium break-words">{viewModal.user.shiftTimings?.default || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">HR Name</p>
                               <p className="text-white font-medium break-words">{viewModal.user.hrName || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Stipend</p>
                               <p className="text-white font-medium break-words">{viewModal.user.stipend || 'Not provided'}</p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[300px] flex-1">
                               <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Working Days</p>
                               <p className="text-white font-medium break-words">{Array.isArray(viewModal.user.workingDays) ? viewModal.user.workingDays.join(', ') : 'Not provided'}</p>
                             </div>
                             {viewModal.user.offerLetter && (
                               <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[300px] flex-1">
                                 <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Offer Letter</p>
                                 <a href={viewModal.user.offerLetter} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline font-bold hover:text-blue-400 transition inline-flex items-center gap-2">
                                   Download PDF
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                   </svg>
                                 </a>
                               </div>
                             )}
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm card-hover hover:from-orange-500/15 hover:to-red-500/15 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <WorkIcon className="text-orange-400 text-2xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Experience</h3>
                      </div>
                      
                      {viewModal.user.hasExperience ? (
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                            <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Company</p>
                            <p className="text-white font-medium break-words">{viewModal.user.previousCompany}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                            <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Position</p>
                            <p className="text-white font-medium break-words">{viewModal.user.position}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                            <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Years of Experience</p>
                            <p className="text-white font-medium break-words">{viewModal.user.yearsOfExperience} years</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                            <WorkIcon className="text-orange-400 text-2xl" />
                          </div>
                          <p className="text-purple-200 text-lg font-medium">No prior experience</p>
                          <p className="text-purple-300 text-sm mt-1">This user is a fresh graduate or student</p>
                        </div>
                      )}
                    </div>

                    {/* Registration Info */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm card-hover hover:from-purple-500/15 hover:to-pink-500/15 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <InfoIcon className="text-purple-400 text-2xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Registration Details</h3>
                      </div>
                      
                                             <div className="flex flex-wrap gap-4">
                         <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                           <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Account Status</p>
                           <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusColorClass(viewModal.user.approveStatus)}`}>
                             {viewModal.user.approveStatus}
                           </span>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px] flex-1">
                           <p className="text-xs text-purple-300 uppercase tracking-wide mb-1">Registered On</p>
                           <p className="text-white font-medium break-words">{new Date(viewModal.user.registeredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                         </div>
                       </div>
                    </div>
                    {/* Course Payment Section - Creative & Professional */}
                    <div className="relative bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl card-hover hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 overflow-hidden mt-6">
                      {/* Animated Accent Icon */}
                      <div className="absolute -top-8 right-8 w-24 h-24 bg-gradient-to-br from-pink-400/40 via-purple-400/40 to-blue-400/40 rounded-full blur-2xl animate-pulse-slow z-0" />
                      <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg animate-bounce-slow">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4m8-4h-4m-8 0H4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg mb-1">Course Payment</h3>
                          <p className="text-purple-100/80 text-base">Detailed payment breakdown for this user</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Course Amount */}
                        <div className="flex flex-col items-center justify-center bg-white/10 rounded-xl p-6 border border-pink-400/20 shadow-md">
                          <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider mb-2">Total Amount</span>
                          <span className="text-3xl font-extrabold text-pink-200 gradient-text drop-shadow-lg">{viewModal.user?.amount?.courseAmount ? `₹${Number(viewModal.user.amount.courseAmount).toLocaleString()}` : 'N/A'}</span>
                        </div>
                        {/* Paid Amount */}
                        <div className="flex flex-col items-center justify-center bg-white/10 rounded-xl p-6 border border-blue-400/20 shadow-md">
                          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Paid</span>
                          <span className="text-3xl font-extrabold text-blue-200 gradient-text drop-shadow-lg">{viewModal.user?.amount?.paidAmount ? `₹${Number(viewModal.user.amount.paidAmount).toLocaleString()}` : 'N/A'}</span>
                          {/* Progress Bar */}
                          <div className="w-full mt-4">
                            <div className="h-2 rounded-full bg-blue-900/30 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.round((Number(viewModal.user?.amount?.paidAmount || 0) / (Number(viewModal.user?.amount?.courseAmount || 1))) * 100))}%` }}
                              />
                            </div>
                            <div className="text-xs text-blue-200 mt-1 text-right">
                              {viewModal.user?.amount?.courseAmount ? `${Math.min(100, Math.round((Number(viewModal.user?.amount?.paidAmount || 0) / (Number(viewModal.user?.amount?.courseAmount || 1))) * 100))}% Paid` : ''}
                            </div>
                          </div>
                        </div>
                        {/* Balance Amount */}
                        <div className="flex flex-col items-center justify-center bg-white/10 rounded-xl p-6 border border-purple-400/20 shadow-md">
                          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Balance</span>
                          <span className="text-3xl font-extrabold text-purple-200 gradient-text drop-shadow-lg">{viewModal.user?.amount?.balanceAmount !== undefined ? `₹${Number(viewModal.user.amount.balanceAmount).toLocaleString()}` : 'N/A'}</span>
                          {Number(viewModal.user?.amount?.balanceAmount) === 0 && (
                            <span className="mt-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold animate-pulse">Fully Paid</span>
                          )}
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
                <h2 className="text-3xl font-bold text-white mb-4">Edit User</h2>
                
                {/* Personal Details */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-purple-200 mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">Title</label>
                      <select value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required>
                        {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">First Name</label>
                      <input type="text" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Middle Name</label>
                      <input type="text" value={editForm.middleName} onChange={e => setEditForm(f => ({ ...f, middleName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Last Name</label>
                      <input type="text" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Email</label>
                      <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Phone</label>
                      <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Role</label>
                      <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required>
                        {['intern', 'admin', 'support'].map(opt => (
                          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education Details */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-purple-200 mb-4">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">College Name</label>
                      <input type="text" value={editForm.collegeName} onChange={e => setEditForm(f => ({ ...f, collegeName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" required />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Department</label>
                      <select
                        value={editForm.department}
                        onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">University</label>
                      <select
                        value={editForm.university}
                        onChange={e => setEditForm(f => ({ ...f, university: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        style={{ direction: 'ltr' }}
                        required
                      >
                        <option value="">Select University</option>
                        {universityOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Degree</label>
                      <select
                        value={editForm.degree}
                        onChange={e => setEditForm(f => ({ ...f, degree: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        required
                      >
                        <option value="">Select Degree</option>
                        {degreeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Specialization</label>
                      <input type="text" value={editForm.specialization} onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">CGPA</label>
                      <input type="text" value={editForm.cgpa} onChange={e => setEditForm(f => ({ ...f, cgpa: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Current Year</label>
                      <select
                        value={editForm.currentYear}
                        onChange={e => setEditForm(f => ({ ...f, currentYear: e.target.value }))}
                        className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        required
                      >
                        <option value="">Select Year</option>
                        {yearOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Is Graduated?</label>
                      <select value={editForm.isGraduated ? 'yes' : 'no'} onChange={e => setEditForm(f => ({ ...f, isGraduated: e.target.value === 'yes' }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Year of Passing</label>
                      <input type="text" value={editForm.yearOfPassing} onChange={e => setEditForm(f => ({ ...f, yearOfPassing: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                  </div>
                </div>

                {/* Experience Details */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-purple-200 mb-4">Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">Has Experience?</label>
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
                    <div />
                    {editForm.hasExperience && (
                      <>
                        <div>
                          <label className="block text-purple-200 mb-1">Previous Company</label>
                          <input type="text" value={editForm.previousCompany} onChange={e => setEditForm(f => ({ ...f, previousCompany: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Position</label>
                          <input type="text" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                        </div>
                        <div>
                          <label className="block text-purple-200 mb-1">Years of Experience</label>
                          <input type="text" value={editForm.yearsOfExperience} onChange={e => setEditForm(f => ({ ...f, yearsOfExperience: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Organization Details */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-purple-200 mb-4">Organization Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-200 mb-1">Organization Name</label>
                      <input type="text" value={editForm.organizationName} onChange={e => setEditForm(f => ({ ...f, organizationName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Place of Work</label>
                      <input type="text" value={editForm.placeOfWork} onChange={e => setEditForm(f => ({ ...f, placeOfWork: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Shift Start Time</label>
                      <input type="time" value={editForm.shiftTimings?.start || '09:30'} onChange={e => setEditForm(f => ({ ...f, shiftTimings: { ...f.shiftTimings, start: e.target.value } }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Shift End Time</label>
                      <input type="time" value={editForm.shiftTimings?.end || '18:30'} onChange={e => setEditForm(f => ({ ...f, shiftTimings: { ...f.shiftTimings, end: e.target.value } }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-purple-200 mb-1">Working Days</label>
                      <div className="flex flex-wrap gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                          <label key={day} className="flex items-center gap-2 text-purple-100">
                            <input
                              type="checkbox"
                              checked={editForm.workingDays?.includes(day) || false}
                              onChange={e => {
                                if (e.target.checked) {
                                  setEditForm(f => ({ ...f, workingDays: [...(f.workingDays || []), day] }));
                                } else {
                                  setEditForm(f => ({ ...f, workingDays: (f.workingDays || []).filter(d => d !== day) }));
                                }
                              }}
                              className="form-checkbox text-pink-500"
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">HR Name</label>
                      <input type="text" value={editForm.hrName} onChange={e => setEditForm(f => ({ ...f, hrName: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Employee Address</label>
                      <input type="text" value={editForm.employeeAddress} onChange={e => setEditForm(f => ({ ...f, employeeAddress: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                    <div>
                      <label className="block text-purple-200 mb-1">Stipend</label>
                      <input type="text" value={editForm.stipend} onChange={e => setEditForm(f => ({ ...f, stipend: e.target.value }))} className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10" />
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Course Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-purple-200 mb-1">Course Amount</label>
                        <input
                          type="number"
                          name="courseAmount"
                          value={editForm.amount?.courseAmount || ''}
                          onChange={e => {
                            const value = e.target.value;
                            setEditForm(f => {
                              const newAmount = {
                                ...f.amount,
                                courseAmount: value,
                              };
                              const course = Number(newAmount.courseAmount) || 0;
                              const paid = Number(newAmount.paidAmount) || 0;
                              newAmount.balanceAmount = course - paid;
                              return { ...f, amount: newAmount };
                            });
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          name="paidAmount"
                          value={editForm.amount?.paidAmount || ''}
                          onChange={e => {
                            const value = e.target.value;
                            setEditForm(f => {
                              const newAmount = {
                                ...f.amount,
                                paidAmount: value,
                              };
                              const course = Number(newAmount.courseAmount) || 0;
                              const paid = Number(newAmount.paidAmount) || 0;
                              newAmount.balanceAmount = course - paid;
                              return { ...f, amount: newAmount };
                            });
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 mb-1">Balance Amount</label>
                        <input
                          type="number"
                          value={editForm.amount?.balanceAmount || ''}
                          readOnly
                          className="w-full py-2 px-3 rounded-xl bg-purple-900/40 text-white border border-white/10 bg-opacity-60 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {editModal.error && <div className="mt-4 text-red-400 font-bold">{editModal.error}</div>}
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="px-5 py-2 rounded-lg bg-transparent border text-white font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-300" onClick={() => setEditModal({ open: false, user: null, loading: false, error: null })}>
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