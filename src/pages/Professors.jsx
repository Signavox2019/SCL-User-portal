import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
  School,
  Star,
  TrendingUp,
  Group,
  Person,
  Email,
  Phone,
  Work,
  LinkedIn,
  CalendarToday,
  Close as CloseIcon,
  BarChart,
  PieChart as PieChartIcon,
  Visibility,
  Search,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [stats, setStats] = useState({ totalProfessors: 0, activeProfessors: 0, inactiveProfessors: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedProfessorLoading, setSelectedProfessorLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', linkedIn: '', profileImage: '', bio: '', expertise: '', yearsOfExperience: '', designation: '', currentOrganization: ''
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  // Accordion state for modules (multiple open allowed)
  const [openModuleIndexes, setOpenModuleIndexes] = useState({});
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const [profRes, statsRes] = await Promise.all([
          fetch(`${BaseUrl}/professors`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${BaseUrl}/professors/stats/metrics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (!profRes.ok || !statsRes.ok) throw new Error('Failed to fetch professor data');
        const profData = await profRes.json();
        const statsData = await statsRes.json();
        setProfessors(profData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const handleOpenModal = (prof) => {
    setSelectedProfessorLoading(true);
    setModalOpen(true);
    setModalLoading(false);
    // Fetch professor details from API
    const token = localStorage.getItem('token');
    axios.get(`${BaseUrl}/professors/${prof._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        setSelectedProfessor(res.data);
      })
      .catch(err => {
        setSelectedProfessor(null);
        toast.error('Failed to load professor details', { position: 'top-right', autoClose: 4000 });
      })
      .finally(() => {
        setSelectedProfessorLoading(false);
      });
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProfessor(null);
    setSelectedProfessorLoading(false);
  };

  // Toast helper
  const showToast = (msg, type = 'success') => {
    if (type === 'success') toast.success(msg, { position: 'top-right', autoClose: 3000 });
    else toast.error(msg, { position: 'top-right', autoClose: 4000 });
  };

  // Add Professor
  const handleAddProfessor = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const expertiseArr = form.expertise.split(',').map(s => s.trim()).filter(Boolean);
      const res = await axios.post(`${BaseUrl}/professors`, {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
        expertise: expertiseArr
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      showToast('Professor added!');
      setProfessors([res.data.professor, ...professors]);
      setAddModalOpen(false);
      setForm({ name: '', email: '', phone: '', linkedIn: '', profileImage: '', bio: '', expertise: '', yearsOfExperience: '', designation: '', currentOrganization: '' });
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Edit Professor
  const openEditModal = (prof) => {
    setForm({ ...prof, expertise: (prof.expertise || []).join(', ') });
    setEditId(prof._id);
    setEditModalOpen(true);
    setAddModalOpen(false);
  };
  const handleEditProfessor = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const expertiseArr = form.expertise.split(',').map(s => s.trim()).filter(Boolean);
      const res = await axios.put(`${BaseUrl}/professors/${editId}`, {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
        expertise: expertiseArr
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      showToast('Professor updated!');
      setProfessors(professors.map(p => p._id === editId ? { ...p, ...res.data.professor } : p));
      setEditModalOpen(false);
      setForm({ name: '', email: '', phone: '', linkedIn: '', profileImage: '', bio: '', expertise: '', yearsOfExperience: '', designation: '', currentOrganization: '' });
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Professor
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };
  const handleDeleteProfessor = async () => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BaseUrl}/professors/${deleteId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      showToast('Professor deleted!');
      setProfessors(professors.filter(p => p._id !== deleteId));
      setDeleteModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Accordion state for modules (multiple open allowed)
  useEffect(() => {
    if (selectedProfessor && selectedProfessor.courses) {
      setOpenModuleIndexes({}); // All closed by default
    }
  }, [selectedProfessor]);
  const handleToggleModule = (courseIdx, moduleIdx) => {
    setOpenModuleIndexes(prev => ({
      ...prev,
      [`${courseIdx}_${moduleIdx}`]: !prev[`${courseIdx}_${moduleIdx}`]
    }));
  };

  // Chart data
  const pieData = [
    { name: 'Active', value: stats.activeProfessors || 0, color: '#10b981' },
    { name: 'Inactive', value: stats.inactiveProfessors || 0, color: '#f59e0b' },
  ];
  const barData = stats.allProfessorDetails
    ? stats.allProfessorDetails.map((prof) => ({ name: prof.name, Courses: prof.courseCount }))
    : [];

  // Filtered professors for search
  const filteredProfessors = professors.filter((prof) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      prof.name.toLowerCase().includes(s) ||
      prof.email.toLowerCase().includes(s) ||
      (prof.designation && prof.designation.toLowerCase().includes(s)) ||
      (prof.currentOrganization && prof.currentOrganization.toLowerCase().includes(s))
    );
  });

  // Pagination helpers
  const totalPages = Math.ceil(filteredProfessors.length / rowsPerPage) || 1;
  const paginatedProfessors = filteredProfessors.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Custom XAxis tick for bar chart
  const CustomBarTick = (props) => {
    const { x, y, payload } = props;
    const name = payload.value;
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{name}</title>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#c4b5fd" fontSize="12" style={{ fontWeight: 600, maxWidth: 80 }} transform="rotate(-30)">
          {name.length > 12 ? name.slice(0, 11) + '…' : name}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-400 font-bold py-10">{error}</div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
          <Group className="text-white text-4xl drop-shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            Professors
          </h1>
          <p className="text-lg text-purple-100/80 mt-2">
            Meet our expert faculty and their achievements
          </p>
        </div>
        <div className="ml-auto">
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 text-lg"
            onClick={() => {
              setForm({ name: '', email: '', phone: '', linkedIn: '', profileImage: '', bio: '', expertise: '', yearsOfExperience: '', designation: '', currentOrganization: '' });
              setAddModalOpen(true);
              setEditModalOpen(false);
            }}
          >
            <AddIcon /> Add Professor
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <Group className="text-2xl text-purple-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{stats.totalProfessors}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">Total Professors</div>
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <TrendingUp className="text-2xl text-green-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{stats.activeProfessors}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-green-100/90">Active</div>
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <Star className="text-2xl text-yellow-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{stats.inactiveProfessors}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-yellow-100/90">Inactive</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professors Status Pie Chart - narrower card */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 lg:col-span-1 min-w-[260px] w-full">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <PieChartIcon className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg">Professor Status</div>
              <div className="text-sm text-green-100/80 mt-1">Active vs Inactive</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-base rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-base font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-lg font-bold text-gray-200">{value} professors</div>
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
        {/* Courses per Professor Bar Chart - wider card */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 lg:col-span-2 w-full">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <BarChart className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Courses per Professor</div>
              <div className="text-sm text-blue-100/80 mt-1">Number of courses handled</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <XAxis dataKey="name" stroke="#c4b5fd" tick={<CustomBarTick />} interval={0} height={60} />
              <YAxis stroke="#c4b5fd" />
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }}/>
              <Bar dataKey="Courses" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Professors Table Section */}
      <div className="rounded-2xl p-6 shadow-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <Group className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Professors List</div>
              <div className="text-sm text-purple-100/80 mt-1">Search and view faculty details</div>
            </div>
          </div>
          <div className="flex items-center bg-white/10 rounded-xl px-3 py-2 border border-white/10 shadow-inner max-w-xs w-full">
            <Search className="text-purple-300 mr-2" />
            <input
              type="text"
              placeholder="Search professors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white placeholder-purple-200 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[700px] text-sm text-left text-purple-100 table-auto bg-[#32296a]">
            <thead className="sticky top-0 z-10 bg-[#32296a]">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-purple-200">Name</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-blue-200">Email</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-yellow-200">Phone</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-purple-100">Designation</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-pink-200">Organization</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-blue-200 text-center">Courses</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-center text-purple-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessors.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <School className="text-4xl text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Professors Found</h3>
                  <p className="text-purple-200/80">No faculty data available.</p>
                </td></tr>
              ) : (
                paginatedProfessors.map((prof, idx) => (
                  <tr key={prof._id + idx} className="hover:bg-purple-500/30 transition-all duration-200 border-b border-white/10 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-white tracking-wide truncate" title={prof.name}>{prof.name}</td>
                    <td className="px-4 py-3 text-blue-100 truncate" title={prof.email}>{prof.email}</td>
                    <td className="px-4 py-3 text-yellow-100 truncate" title={prof.phone}>{prof.phone}</td>
                    <td className="px-4 py-3 text-purple-100 truncate" title={prof.designation}>{prof.designation}</td>
                    <td className="px-4 py-3 text-pink-100 truncate" title={prof.currentOrganization}>{prof.currentOrganization}</td>
                    <td className="px-4 py-3 text-blue-200 font-bold text-center">{prof.courses?.length || 0}</td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        className="p-1 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white"
                        title="View Professor"
                        onClick={() => handleOpenModal(prof)}
                      >
                        <Visibility fontSize="small" />
                      </button>
                      <button
                        className="p-1 rounded-full bg-purple-500/80 hover:bg-purple-600 text-white"
                        title="Edit Professor"
                        onClick={() => openEditModal(prof)}
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        className="p-1 rounded-full bg-pink-500/80 hover:bg-pink-600 text-white"
                        title="Delete Professor"
                        onClick={() => openDeleteModal(prof._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination below table */}
        {filteredProfessors.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 py-4 bg-transparent relative z-0 mt-4">
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
                Showing {filteredProfessors.length === 0 ? 0 : ((page - 1) * rowsPerPage + 1)}-
                {Math.min(page * rowsPerPage, filteredProfessors.length)} of {filteredProfessors.length} professors
              </span>
              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button
                  className="p-0.5 rounded-full hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeftIcon />
                </button>
                <span className="text-purple-200/80 text-sm">{page} / {totalPages}</span>
                <button
                  className="p-0.5 rounded-full hover:bg-purple-300 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-40"
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

      {/* Modal for professor details */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[85vh] overflow-hidden animate-modalPop font-sans">
            {/* Accent Header Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={handleCloseModal}>
              <CloseIcon fontSize="large" />
            </button>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar font-sans">
              {modalLoading || selectedProfessorLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
                </div>
              ) : selectedProfessor ? (
                <div className="flex flex-col w-full gap-2 font-sans">
                  {/* Fancy Header Section */}
                  <div className="relative flex flex-col sm:flex-row w-full items-center sm:items-end gap-0 sm:gap-6 mb-2">
                    <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-pink-400 shadow-lg bg-purple-900/40 flex items-center justify-center overflow-hidden -mb-6 sm:mb-0 sm:-mr-8 z-10">
                      <img src={selectedProfessor.profileImage} alt={selectedProfessor.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0 h-full sm:pl-10">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide mb-1 text-center sm:text-left font-sans">{selectedProfessor.name}</h2>
                      {selectedProfessor.bio && (
                        <div className="text-purple-100 text-base mb-1 text-left italic font-sans">{selectedProfessor.bio}</div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1">
                        <span className="text-pink-200 font-semibold text-base sm:text-lg font-sans">{selectedProfessor.designation}</span>
                        <span className="text-purple-200 text-sm sm:text-base font-sans">{selectedProfessor.currentOrganization}</span>
                      </div>
                      <div className="flex flex-row flex-wrap gap-4 mt-1 text-xs text-purple-200 items-center font-sans">
                        <div className="flex items-center gap-2"><Email className="text-pink-300 text-base" />{selectedProfessor.email}</div>
                        <div className="flex items-center gap-2"><Phone className="text-pink-300 text-base" />{selectedProfessor.phone}</div>
                        {selectedProfessor.linkedIn && (
                          <a href={selectedProfessor.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline transition-all duration-200 font-sans">
                            <LinkedIn className="text-blue-400 text-base" />LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Gradient Divider */}
                  <div className="w-full h-0.5 my-3 bg-gradient-to-r from-pink-400/40 via-purple-400/40 to-blue-400/40 rounded-full" />
                  {/* Professional Details Section (Two Columns) */}
                  <div className="w-full mt-2">
                    <div className="uppercase tracking-widest text-xl font-bold text-purple-300 mb-3 font-sans">Professional Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 w-full">
                      <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base font-sans"><Work className="text-purple-300" /> <span className="opacity-80">Designation</span>: <span className="text-purple-100 font-sans">{selectedProfessor.designation}</span></div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base font-sans"><School className="text-pink-300" /> <span className="opacity-80">Organization</span>: <span className="text-purple-100 font-sans">{selectedProfessor.currentOrganization}</span></div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base font-sans"><Star className="text-yellow-400" /> <span className="opacity-80">Experience</span>: <span className="text-purple-100 font-sans">{selectedProfessor.yearsOfExperience} years</span></div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base font-sans"><CalendarToday className="text-purple-300" /> <span className="opacity-80">Joined</span>: <span className="text-purple-100 font-sans">{selectedProfessor.createdAt ? new Date(selectedProfessor.createdAt).toLocaleDateString() : '-'}</span></div>
                    </div>
                    {/* Expertise row: creative inline pills */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2 text-white font-medium text-sm md:text-base font-sans"><LightbulbIcon className="text-purple-300" /> <span className="opacity-80">Expertise</span>:</div>
                      <div className="flex flex-wrap gap-2 mb-0">
                        {selectedProfessor.expertise && selectedProfessor.expertise.length > 0
                          ? selectedProfessor.expertise.map((exp, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 text-blue-200 text-xs font-semibold border border-blue-300/30 shadow-sm hover:scale-105 transition-transform duration-200 font-sans tracking-wide">
                                {exp}
                              </span>
                            ))
                          : <span className="text-purple-200/60 italic text-sm font-sans">No expertise listed</span>}
                      </div>
                    </div>
                    {/* Assigned Courses row: vertical timeline style */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3 text-pink-200 text-xl font-bold font-sans"><MenuBookIcon className="text-pink-300 text-2xl" />Assigned Courses</div>
                      <div className="flex flex-col gap-10 relative">
                        {selectedProfessor.courses && selectedProfessor.courses.length > 0 ? (
                          selectedProfessor.courses.map((c, i) => (
                            <div key={c._id || i} className="relative flex flex-col gap-4 pb-6 border-b border-purple-400/10 last:border-b-0 text-lg font-bold font-sans">
                              {/* Image left, content right (title, desc, price, rating, tags) */}
                              <div className="flex flex-col sm:flex-row gap-6 items-stretch">
                                {c.coverImage && (
                                  <img src={c.coverImage} alt={c.title} className="w-36 h-36 object-cover rounded-2xl border-2 border-pink-400/40 shadow-lg flex-shrink-0" />
                                )}
                                <div className="flex-1 flex flex-col justify-between gap-2 py-1">
                                  <span className="text-3xl font-bold text-pink-200 leading-tight mb-1 font-sans">{c.title}</span>
                                  {c.description && <div className="text-purple-100 text-base sm:text-lg mb-2 font-normal font-sans">{c.description}</div>}
                                  <div className="flex flex-row flex-wrap gap-6 items-center mb-2 font-medium font-sans">
                                    {c.isFree ? (
                                      <span className="text-green-400 font-bold text-xl font-sans">Free</span>
                                    ) : (
                                      <span className="text-pink-300 font-bold text-xl font-sans">{c.price?.amount}{c.price?.discountPercent ? <span className="ml-1">({c.price.discountPercent}% off)</span> : null}</span>
                                    )}
                                    {typeof c.averageRating === 'number' && (
                                      <span className="text-yellow-300 font-semibold text-xl flex items-center font-sans"><span className="mr-1">★</span>{c.averageRating} <span className="text-purple-200 font-normal ml-1">({c.ratingsCount || 0})</span></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {/* Next row: remaining details */}
                              <div className="flex flex-col gap-2 text-lg text-purple-100 mt-2 pl-1 font-normal font-sans">
                                {/* Row 1: Category & Subcategory */}
                                <div className="flex flex-row gap-8 items-center text-base sm:text-lg">
                                  <span>Category: <span className="text-purple-100 font-normal font-sans">{c.category}</span></span>
                                  {c.subCategory && <span>Subcategory: <span className="text-purple-100 font-normal font-sans">{c.subCategory}</span></span>}
                                </div>
                                {/* Row 2: Language & Duration */}
                                <div className="flex flex-row gap-8 items-center text-base sm:text-lg">
                                  <span>Language: <span className="text-purple-100 font-normal font-sans">{c.language}</span></span>
                                  <span>Duration: <span className="text-purple-100 font-normal font-sans">{c.duration}</span></span>
                                </div>
                                {/* Row 3: Published */}
                                {c.publishedAt && (
                                  <div className="flex flex-row gap-8 items-center text-base sm:text-lg">
                                    <span>Published: <span className="text-purple-100 font-normal font-sans">{new Date(c.publishedAt).toLocaleDateString()}</span></span>
                                  </div>
                                )}
                                {/* Row 4: Tags */}
                                {c.tags && c.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 items-center mt-1 text-base sm:text-lg">
                                    {c.tags.map((tag, idx) => (
                                      <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 text-pink-100 text-xs font-semibold border border-pink-400/40 shadow hover:scale-105 transition-transform duration-200 font-sans tracking-wide">{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Modules Title */}
                              {c.modules && c.modules.length > 0 && (
                                <div className="mt-4 mb-2 text-blue-200 text-xl font-bold tracking-wide font-sans">Modules</div>
                              )}
                              {/* Modules Accordion */}
                              {c.modules && c.modules.length > 0 && (
                                <div className="mt-3 flex flex-col gap-4">
                                  {c.modules.map((mod, mi) => {
                                    const isOpen = openModuleIndexes[`${i}_${mi}`] || false;
                                    return (
                                      <div key={mod._id || mi} className="rounded-xl overflow-hidden border border-purple-400/20 bg-white/5 font-sans">
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between gap-4 px-4 py-3 focus:outline-none transition-all group font-sans"
                                          onClick={() => handleToggleModule(i, mi)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="w-1.5 h-8 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full"></span>
                                            <span className="text-lg font-medium text-blue-200 group-hover:text-pink-200 transition-colors font-sans">{mod.moduleTitle}</span>
                                            {mod.moduleDescription && (
                                              <span className="text-purple-200 text-sm truncate max-w-xs hidden sm:inline-block font-normal font-sans">{mod.moduleDescription.length > 60 ? mod.moduleDescription.slice(0, 60) + '…' : mod.moduleDescription}</span>
                                            )}
                                          </div>
                                          <ExpandMoreIcon className={`text-purple-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div
                                          className={`transition-all duration-300 bg-gradient-to-br from-purple-900/30 to-blue-900/10 ${isOpen ? 'max-h-[2000px] opacity-100 py-3 px-4' : 'max-h-0 opacity-0 py-0 px-4'} overflow-hidden font-normal font-sans`}
                                          style={{ borderTop: isOpen ? '1px solid #a78bfa33' : 'none' }}
                                        >
                                          {isOpen && (
                                            <>
                                              {mod.moduleDescription && <div className="text-purple-200 text-base mb-2 font-sans">{mod.moduleDescription}</div>}
                                              {/* Lessons */}
                                              {mod.lessons && mod.lessons.length > 0 && (
                                                <div className="flex flex-col gap-3 mt-1">
                                                  {mod.lessons.map((lesson, li) => (
                                                    <div key={lesson._id || li} className="border-l-2 border-blue-400/30 pl-4 font-sans">
                                                      <div className="text-base font-semibold text-pink-200 font-sans">Lesson: {lesson.title}</div>
                                                      {lesson.summary && <div className="text-purple-100 text-sm mb-1 font-sans">{lesson.summary}</div>}
                                                      {/* Topics */}
                                                      {lesson.topics && lesson.topics.length > 0 && (
                                                        <div className="mt-1 flex flex-col gap-2">
                                                          {lesson.topics.map((topic, ti) => (
                                                            <div key={topic._id || ti} className="border-l-2 border-purple-400/30 pl-4 font-sans">
                                                              <div className="text-base font-semibold text-blue-200 font-sans">Topic: {topic.title}</div>
                                                              {topic.description && <div className="text-purple-100 text-sm mb-1 font-sans">{topic.description}</div>}
                                                              {/* Subtopics */}
                                                              {topic.subTopics && topic.subTopics.length > 0 && (
                                                                <div className="mt-1 flex flex-col gap-1">
                                                                  {topic.subTopics.map((sub, subi) => (
                                                                    <div key={sub._id || subi} className="border-l-2 border-pink-400/30 pl-4 font-sans">
                                                                      <div className="text-base font-semibold text-pink-200 font-sans">Subtopic: {sub.title}</div>
                                                                      {sub.content && <div className="text-purple-100 text-sm mb-1 font-sans">{sub.content}</div>}
                                                                      {sub.videoUrl && <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs font-sans">Video</a>}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              )}
                                                              {topic.videoUrl && <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs font-sans">Video</a>}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                      {/* Quizzes */}
                                                      {lesson.quizIncluded && lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                                                        <div className="mt-2">
                                                          <div className="text-yellow-300 font-semibold mb-1 font-sans">Quiz Questions:</div>
                                                          <ul className="list-disc pl-6 text-purple-100 text-sm font-sans">
                                                            {lesson.quizQuestions.map((q, qi) => (
                                                              <li key={q._id || qi} className="mb-1">
                                                                <div><b>Q:</b> {q.question}</div>
                                                                {q.options && q.options.length > 0 && (
                                                                  <div className="ml-2">Options: {q.options.join(', ')}</div>
                                                                )}
                                                                {q.answer && <div className="ml-2 text-green-400">Answer: {q.answer}</div>}
                                                              </li>
                                                            ))}
                                                          </ul>
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-purple-200/60 italic font-sans">No courses assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 font-bold py-10 font-sans">Failed to load professor details.</div>
              )}
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Add/Edit Professor Modal */}
      {(addModalOpen || editModalOpen) && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-[#32296a] rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
            {/* Accent Header Bar */}
            <div className="h-2 w-full bg-pink-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => { setAddModalOpen(false); setEditModalOpen(false); setForm({ name: '', email: '', phone: '', linkedIn: '', profileImage: '', bio: '', expertise: '', yearsOfExperience: '', designation: '', currentOrganization: '' }); }}>
              <CloseIcon fontSize="large" />
            </button>
            <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={addModalOpen ? handleAddProfessor : handleEditProfessor}>
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-glow">{addModalOpen ? 'Add Professor' : 'Edit Professor'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Name</label>
                  <input type="text" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Email</label>
                  <input type="email" name="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Phone</label>
                  <input type="text" name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">LinkedIn</label>
                  <input type="text" name="linkedIn" value={form.linkedIn} onChange={e => setForm(f => ({ ...f, linkedIn: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Profile Image URL</label>
                  <input type="text" name="profileImage" value={form.profileImage} onChange={e => setForm(f => ({ ...f, profileImage: e.target.value }))} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Designation</label>
                  <input type="text" name="designation" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Organization</label>
                  <input type="text" name="currentOrganization" value={form.currentOrganization} onChange={e => setForm(f => ({ ...f, currentOrganization: e.target.value }))} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Years of Experience</label>
                  <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={e => setForm(f => ({ ...f, yearsOfExperience: e.target.value }))} required min={0} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-purple-200 mb-1 font-semibold">Expertise (comma separated)</label>
                  <input type="text" name="expertise" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} placeholder="e.g. Web Development, UI/UX, MERN stack" className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-purple-200 mb-1 font-semibold">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-300" onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}>
                  Cancel
                </button>
                <button type="submit" disabled={modalLoading} className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  {modalLoading ? 'Saving...' : (addModalOpen ? 'Add Professor' : 'Update Professor')}
                </button>
              </div>
            </form>
          </div>
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
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Delete Professor Modal */}
      {deleteModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="bg-[#32296a] rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
            <p className="text-purple-200 mb-6">Are you sure you want to delete this professor?</p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 hover:from-purple-500 hover:to-pink-500 transition-all duration-300" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleDeleteProfessor} disabled={modalLoading}>{modalLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />, document.body
      )}
    </div>
  );
};

export default Professors; 