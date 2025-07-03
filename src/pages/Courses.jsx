import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Tooltip, Card, CardContent, CardMedia, Chip, Divider } from '@mui/material';
import { Add, FilterList, Search, School, Person, AccessTime, Close } from '@mui/icons-material';

// Placeholder: Replace with real admin check
const isAdmin = localStorage.getItem('role') === 'admin';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: '',
    coverImage: '',
    professor: '',
    modules: [
      {
        moduleTitle: '',
        moduleDescription: '',
        lessons: [
          {
            title: '',
            summary: '',
            topics: [
              {
                title: '',
                description: '',
                videoUrl: '',
                subTopics: [
                  { title: '', content: '', videoUrl: '' }
                ]
              }
            ],
            quizIncluded: false,
            quizQuestions: [
              { question: '', options: ['', '', ''], answer: '' }
            ]
          }
        ]
      }
    ]
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BaseUrl}/courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data.courses || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  const handleCreateCourse = async () => {
    setCreating(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course');
      setCourses((prev) => [data.course, ...prev]);
      setSuccessMsg('Course created successfully!');
      setAddOpen(false);
      setNewCourse({
        title: '', description: '', duration: '', coverImage: '', professor: '', modules: [
          { moduleTitle: '', moduleDescription: '', lessons: [
            { title: '', summary: '', topics: [
              { title: '', description: '', videoUrl: '', subTopics: [ { title: '', content: '', videoUrl: '' } ] }
            ], quizIncluded: false, quizQuestions: [ { question: '', options: ['', '', ''], answer: '' } ] }
          ] }
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#24106a] via-[#311188] to-[#0A081E] py-10 px-2 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <School className="text-4xl text-purple-200 drop-shadow-lg animate-bounce" />
          <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-300 to-blue-300 tracking-wide drop-shadow-lg font-gothic-round-bold">Courses</span>
        </div>
        {isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={handleAddOpen}
            sx={{ borderRadius: 3, fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 12px #a78bfa55' }}
          >
            Add Course
          </Button>
        )}
      </div>
      {/* Search & Filter Bar */}
      <div className="flex w-full gap-4 mb-8 items-center">
        <TextField
          variant="outlined"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search className="text-purple-400 mr-2" />
            ),
            sx: { borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 12px #a78bfa22', fontWeight: 600 }
          }}
          sx={{ flex: isAdmin ? 1 : 2, minWidth: isAdmin ? 240 : 320, maxWidth: 400 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<FilterList />}
          onClick={() => setFilterOpen(true)}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1rem',
            minWidth: 120,
            background: 'linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)',
            color: '#fff',
            boxShadow: '0 2px 12px #a78bfa22',
            textTransform: 'none',
            letterSpacing: '0.04em',
            '&:hover': { background: 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)' }
          }}
        >
          Filter
        </Button>
        {isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={handleAddOpen}
            sx={{ borderRadius: 3, fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 12px #a78bfa55', minWidth: 140 }}
          >
            Add Course
          </Button>
        )}
      </div>
      {/* Loading & Error */}
      {loading && <div className="flex justify-center items-center h-60"><CircularProgress color="secondary" /></div>}
      {error && <div className="text-center text-red-400 font-bold py-10">{error}</div>}
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10 justify-center">
        {filteredCourses.map(course => (
          <Card key={course._id} className="rounded-3xl shadow-2xl bg-gradient-to-br from-[#2d1a6a]/90 to-[#0a081e]/90 border border-white/10 hover:scale-105 transition-transform duration-300 overflow-hidden group w-full max-w-3xl mx-auto">
            <CardMedia
              component="img"
              height="220"
              image={course.coverImage || 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'}
              alt={course.title}
              className="object-cover w-full"
            />
            <CardContent className="flex flex-col gap-2 px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <School className="text-purple-300 text-3xl" />
                <span className="font-extrabold text-2xl text-white drop-shadow-lg truncate font-gothic-round-bold">{course.title}</span>
                <Chip label={course.duration} color="secondary" size="medium" className="ml-auto font-bold text-base" sx={{ fontWeight: 700, px: 2, background: 'linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)', color: '#fff' }} />
              </div>
              <Divider className="my-2" sx={{ borderColor: '#a78bfa55' }} />
              <div className="text-base text-purple-100 mb-2 line-clamp-4 min-h-[4em] font-medium" style={{ color: '#f3e8ff' }}>{course.description}</div>
              <div className="flex items-center gap-3 mt-2">
                <Person className="text-pink-300 text-xl" />
                <span className="text-base text-pink-100 font-semibold">Professor: {course.professor?.name || course.professor || 'N/A'}</span>
                <AccessTime className="text-blue-300 ml-auto text-xl" />
                <span className="text-base text-blue-100 font-semibold">{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Add Course Modal */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle className="flex items-center gap-2 font-bold text-purple-700">
          <Add className="text-purple-400" /> Add New Course
          <IconButton onClick={handleAddClose} className="ml-auto"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers className="bg-gradient-to-br from-purple-50 to-white">
          {/* Simple form for demo, can be expanded for full module/lesson editing */}
          <div className="flex flex-col gap-4">
            <TextField label="Title" value={newCourse.title} onChange={e => setNewCourse(c => ({ ...c, title: e.target.value }))} fullWidth required />
            <TextField label="Description" value={newCourse.description} onChange={e => setNewCourse(c => ({ ...c, description: e.target.value }))} fullWidth required multiline rows={2} />
            <TextField label="Duration" value={newCourse.duration} onChange={e => setNewCourse(c => ({ ...c, duration: e.target.value }))} fullWidth required />
            <TextField label="Cover Image URL" value={newCourse.coverImage} onChange={e => setNewCourse(c => ({ ...c, coverImage: e.target.value }))} fullWidth />
            <TextField label="Professor (ID or Name)" value={newCourse.professor} onChange={e => setNewCourse(c => ({ ...c, professor: e.target.value }))} fullWidth required />
            {/* For demo, modules/lessons editing can be added here */}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="secondary" variant="outlined">Cancel</Button>
          <Button onClick={handleCreateCourse} color="primary" variant="contained" disabled={creating}>{creating ? <CircularProgress size={20} /> : 'Create'}</Button>
        </DialogActions>
        {successMsg && <div className="text-green-600 text-center py-2 font-bold">{successMsg}</div>}
      </Dialog>
      {/* Filter Modal (placeholder) */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <DialogTitle>Filter Courses</DialogTitle>
        <DialogContent>
          <div className="text-gray-500">(Filter options coming soon...)</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Courses; 