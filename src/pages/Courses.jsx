import React, { useEffect, useState, useRef } from 'react';
import BaseUrl from '../Api';
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Chip, Box, Typography, Rating, Tooltip, InputAdornment, FormControl, InputLabel, Select, MenuItem, ListItemText, Checkbox, OutlinedInput, Snackbar, Alert, Divider, Menu, ListItemIcon, Paper, FormControlLabel
} from '@mui/material';
import {
  Add, FilterList, Search, AccessTime, Star, MonetizationOn, ArrowForward, Edit, Delete, VideoLibrary, Tag, Category, Person, CalendarMonth, Description, Subtitles, Translate, CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from '@mui/icons-material/Category';
import CheckIcon from '@mui/icons-material/Check';

// Placeholder: Replace with real admin check
const isAdmin = localStorage.getItem('role') === 'admin';

const CATEGORY_ENUMS = [
  'Web Development',
  'Data Science',
  'Design',
  'Marketing',
  'Business',
  'Other',
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addCourseError, setAddCourseError] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    subCategory: '',
    level: '',
    language: '',
    price: { amount: '', currency: '', discountPercent: '' },
    isFree: false,
    averageRating: '',
    ratingsCount: '',
    coverImage: '',
    promoVideoUrl: '',
    tags: [],
    duration: '',
    modules: [
      {
        moduleTitle: '',
        moduleDescription: '',
        lessons: [
          {
            title: '',
            summary: '',
            durationMinutes: '',
            previewAvailable: false,
            quizIncluded: false,
            quizQuestions: [
              { question: '', options: ['', '', '', ''], answer: '' }
            ],
            topics: [
              {
                title: '',
                description: '',
                videoUrl: '',
                subTopics: [
                  { title: '', content: '', videoUrl: '' }
                ]
              }
            ]
          }
        ]
      }
    ],
    professor: '',
    enrolledUsers: [],
    status: 'Draft',
    publishedAt: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [professors, setProfessors] = useState([]);
  const [professorsLoading, setProfessorsLoading] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

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

  useEffect(() => {
    if (addOpen) {
      setProfessorsLoading(true);
      const token = localStorage.getItem('token');
      fetch(`${BaseUrl}/professors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setProfessors(Array.isArray(data) ? data : data.professors || []);
        })
        .catch(() => setProfessors([]))
        .finally(() => setProfessorsLoading(false));
    }
  }, [addOpen]);

  const handleDeleteCourse = (course) => {
    setDeleteCourseId(course._id);
    setDeleteOpen(true);
  };
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/courses/${deleteCourseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete course');
      setCourses((prev) => prev.filter(c => c._id !== deleteCourseId));
      setToast({ open: true, message: 'Course deleted successfully!', severity: 'success' });
      setDeleteOpen(false);
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteCourseId(null);
  };

  // Filtered courses
  const filteredCourses = courses.filter(c =>
    (selectedCategory ? c.category === selectedCategory : true) &&
    (c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddOpen = () => {
    setAddOpen(true);
    setAddCourseError('');
  };
  const handleAddClose = () => {
    setAddOpen(false);
    setAddCourseError('');
    setEditMode(false);
    setEditingCourseId(null);
    setNewCourse({
      title: '', slug: '', description: '', category: '', subCategory: '', level: '', language: '', price: { amount: '', currency: '', discountPercent: '' }, isFree: false, averageRating: '', ratingsCount: '', coverImage: '', promoVideoUrl: '', tags: [], duration: '', modules: [ { moduleTitle: '', moduleDescription: '', lessons: [ { title: '', summary: '', durationMinutes: '', previewAvailable: false, quizIncluded: false, quizQuestions: [ { question: '', options: ['', '', '', ''], answer: '' } ], topics: [ { title: '', description: '', videoUrl: '', subTopics: [ { title: '', content: '', videoUrl: '' } ] } ] } ] } ], professor: '', enrolledUsers: [], status: 'Draft', publishedAt: '',
    });
    setTagInput('');
  };
  const handleAddCourseChange = (field, value) => {
    setNewCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleAddCoursePriceChange = (field, value) => {
    setNewCourse(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value
      }
    }));
  };
  const handleTagInputChange = (e) => setTagInput(e.target.value);
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !newCourse.tags.includes(tag)) {
      setNewCourse(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };
  const handleRemoveTag = (tagToRemove) => {
    setNewCourse(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };
  const handleEditCourse = (course) => {
    setEditMode(true);
    setEditingCourseId(course._id);
    setAddOpen(true);
    setAddCourseError('');
    setNewCourse({
      ...course,
      price: {
        amount: course.price?.amount || '',
        currency: course.price?.currency || '',
        discountPercent: course.price?.discountPercent || '',
      },
      modules: course.modules || [],
      tags: course.tags || [],
      professor: course.professor?._id || course.professor || '',
      publishedAt: course.publishedAt ? course.publishedAt.slice(0, 16) : '',
    });
  };
  const handleSaveCourse = async () => {
    setCreating(true);
    setAddCourseError('');
    try {
      const token = localStorage.getItem('token');
      const courseToSend = {
        ...newCourse,
        price: {
          amount: Number(newCourse.price.amount),
          currency: newCourse.price.currency,
          discountPercent: Number(newCourse.price.discountPercent)
        },
        isFree: Boolean(newCourse.isFree),
        averageRating: newCourse.averageRating ? Number(newCourse.averageRating) : 0,
        ratingsCount: newCourse.ratingsCount ? Number(newCourse.ratingsCount) : 0,
        enrolledUsers: [],
        tags: newCourse.tags,
        status: newCourse.status || 'Draft',
        publishedAt: newCourse.publishedAt || undefined,
      };
      let res, data;
      if (editMode && editingCourseId) {
        res = await fetch(`${BaseUrl}/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(courseToSend)
        });
      } else {
        res = await fetch(`${BaseUrl}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(courseToSend)
        });
      }
      try {
        data = await res.json();
      } catch (jsonErr) {
        setAddCourseError('Server did not return a valid JSON response.');
        setCreating(false);
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Failed to save course');
      if (editMode && editingCourseId) {
        setCourses((prev) => prev.map(c => c._id === editingCourseId ? data.course : c));
        setToast({ open: true, message: 'Course updated successfully!', severity: 'success' });
      } else {
        setCourses((prev) => [data.course, ...prev]);
        setToast({ open: true, message: 'Course created successfully!', severity: 'success' });
      }
      setAddOpen(false);
      setEditMode(false);
      setEditingCourseId(null);
      setNewCourse({
        title: '', slug: '', description: '', category: '', subCategory: '', level: '', language: '', price: { amount: '', currency: '', discountPercent: '' }, isFree: false, averageRating: '', ratingsCount: '', coverImage: '', promoVideoUrl: '', tags: [], duration: '', modules: [ { moduleTitle: '', moduleDescription: '', lessons: [ { title: '', summary: '', durationMinutes: '', previewAvailable: false, quizIncluded: false, quizQuestions: [ { question: '', options: ['', '', '', ''], answer: '' } ], topics: [ { title: '', description: '', videoUrl: '', subTopics: [ { title: '', content: '', videoUrl: '' } ] } ] } ] } ], professor: '', enrolledUsers: [], status: 'Draft', publishedAt: '',
      });
      setTagInput('');
    } catch (err) {
      setAddCourseError(err.message || 'Unknown error occurred while saving course.');
      setToast({ open: true, message: err.message || 'Unknown error occurred while saving course.', severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilterAnchorEl(null);
  };

  const handleModuleChange = (moduleIndex, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, idx) =>
        idx === moduleIndex ? { ...module, [field]: value } : module
      )
    }));
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lidx) =>
                lidx === lessonIndex ? { ...lesson, [field]: value } : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleTopicChange = (moduleIndex, lessonIndex, topicIndex, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lidx) =>
                lidx === lessonIndex
                  ? {
                      ...lesson,
                      topics: lesson.topics.map((topic, tidx) =>
                        tidx === topicIndex ? { ...topic, [field]: value } : topic
                      ),
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleSubtopicChange = (moduleIndex, lessonIndex, topicIndex, subtopicIndex, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, idx) =>
        idx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lidx) =>
                lidx === lessonIndex
                  ? {
                      ...lesson,
                      topics: lesson.topics.map((topic, tidx) =>
                        tidx === topicIndex
                          ? {
                              ...topic,
                              subTopics: topic.subTopics.map((sub, sidx) =>
                                sidx === subtopicIndex ? { ...sub, [field]: value } : sub
                              ),
                            }
                          : topic
                      ),
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleQuizQuestionChange = (moduleIndex, lessonIndex, qIdx, field, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIdx) =>
        mIdx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex
                  ? {
                      ...lesson,
                      quizQuestions: (lesson.quizQuestions || []).map((q, idx) =>
                        idx === qIdx ? { ...q, [field]: value } : q
                      ),
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleQuizOptionChange = (moduleIndex, lessonIndex, qIdx, optIdx, value) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIdx) =>
        mIdx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex
                  ? {
                      ...lesson,
                      quizQuestions: (lesson.quizQuestions || []).map((q, idx) =>
                        idx === qIdx
                          ? { ...q, options: q.options.map((opt, oIdx) => (oIdx === optIdx ? value : opt)) }
                        : q
                      ),
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleAddQuizQuestion = (moduleIndex, lessonIndex) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIdx) =>
        mIdx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex
                  ? {
                      ...lesson,
                      quizQuestions: [
                        ...(lesson.quizQuestions || []),
                        { question: '', options: ['', '', '', ''], answer: '' },
                      ],
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  const handleRemoveQuizQuestion = (moduleIndex, lessonIndex, qIdx) => {
    setNewCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIdx) =>
        mIdx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIdx) =>
                lIdx === lessonIndex
                  ? {
                      ...lesson,
                      quizQuestions: (lesson.quizQuestions || []).filter((_, idx) => idx !== qIdx),
                    }
                  : lesson
              ),
            }
          : module
      ),
    }));
  };

  return (
    <>
      {/* Toast Notification - Moved outside main container */}
      <Snackbar 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        open={toast.open} 
        autoHideDuration={3000} 
        onClose={() => setToast({ ...toast, open: false })}
        sx={{
          zIndex: 99999,
          position: 'fixed',
          top: '20px',
          right: '20px',
          '& .MuiSnackbar-root': {
            zIndex: 99999,
          }
        }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity} 
          sx={{ 
            width: '100%',
            minWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            '& .MuiAlert-icon': {
              fontSize: '20px'
            },
            '& .MuiAlert-message': {
              padding: '8px 0'
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <div className="min-h-screen w-full pb-10 px-0 md:px-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold bg-clip-text text-transparent text-white tracking-wide drop-shadow-lg font-gothic-round-bold">Courses</span>
          </div>
        </div>
      {/* Search Bar */}
      <div className="flex w-full gap-2 mb-10 items-center">
        <TextField
          variant="outlined"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search className="text-purple-400 mr-2" />
            ),
            sx: {
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 2px 12px #a78bfa22',
              fontWeight: 600,
              height: 50,
              fontSize: '1.1rem',
              pl: 1.5
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<FilterList />}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1.1rem',
            minWidth: 140,
            height: 50,
            backgroundColor: '#6366f1',
            color: '#fff',
            boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)',
            textTransform: 'none',
            letterSpacing: '0.04em',
            '&:hover': { backgroundColor: '#4f46e5' }
          }}
          onClick={handleFilterClick}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem
            onClick={() => handleCategorySelect('')}
            selected={selectedCategory === ''}
          >
            All Categories
          </MenuItem>
          {CATEGORY_ENUMS.map((cat) => (
            <MenuItem
              key={cat}
              selected={selectedCategory === cat}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </MenuItem>
          ))}
        </Menu>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1.1rem',
            minWidth: 140,
            height: 50,
            backgroundColor: '#ec4899',
            color: '#fff',
            boxShadow: '0 2px 12px rgba(236, 72, 153, 0.3)',
            textTransform: 'none',
            letterSpacing: '0.04em',
            '&:hover': { backgroundColor: '#db2777' }
          }}
          onClick={handleAddOpen}
        >
          Add Course
        </Button>
      </div>
      {/* Loading & Error */}
      {loading && <div className="flex justify-center items-center h-60"><CircularProgress color="secondary" /></div>}
      {error && <div className="text-center text-red-400 font-bold py-10">{error}</div>}
      {/* Courses List */}
      <div className="flex flex-col items-center gap-8 w-full">
        {filteredCourses.map(course => (
          <Box
            key={course._id}
            className="w-full flex flex-row items-stretch gap-0 relative"
            sx={{ width: '100%', background: '#fff', color: '#232046', boxShadow: '0 6px 32px 0 rgba(160, 120, 250, 0.13)', border: '1.5px solid #e0e7ff', borderRadius: 8, m: 0, minHeight: 120, maxHeight: 180, transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'scale(1.025)', boxShadow: '0 12px 40px 0 rgba(160, 120, 250, 0.18)', borderColor: '#a78bfa', }, overflow: 'hidden', position: 'relative' }}
          >
            {/* Edit/Delete icons absolutely at top right */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 0 }}>
              <Tooltip title="Edit Course"><IconButton onClick={() => handleEditCourse(course)}><Edit sx={{ color: '#6366f1' }} /></IconButton></Tooltip>
              <Tooltip title="Delete Course"><IconButton onClick={() => handleDeleteCourse(course)}><Delete sx={{ color: '#f472b6' }} /></IconButton></Tooltip>
            </Box>
            {/* Left: Title & Description */}
            <Box className="flex flex-col justify-between flex-1 p-5 gap-1">
              <Box>
                <Typography
                  variant="h6"
                  className="font-extrabold tracking-wide font-gothic-round-bold"
                  sx={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    fontSize: { xs: 16, md: 20 },
                  }}
                >
                  {course.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', fontSize: 14, lineHeight: 1.5, maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {course.description}
                </Typography>
              </Box>
              {/* Bottom row: View Details, Rating, Duration, Price */}
              <Box className="flex flex-row items-center justify-between mt-2 w-full">
                <Box className="flex flex-row items-center gap-3">
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      px: 1.5,
                      py: 0.3,
                      width: 150,
                      mt: 0,
                      background: 'linear-gradient(90deg, #818cf8 0%, #a5b4fc 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 8px #a78bfa22',
                      textTransform: 'none',
                      letterSpacing: '0.02em',
                                              '&:hover': { background: 'linear-gradient(90deg, #a5b4fc 0%, #818cf8 100%)' }
                      }}
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      View Details
                  </Button>
                  <Rating
                    name="read-only"
                    value={course.rating || course.averageRating || 4.5}
                    precision={0.1}
                    readOnly
                    size="medium"
                    sx={{ color: '#f59e42', fontSize: 22 }}
                  />
                </Box>
                <Box className="flex flex-row items-center gap-2 min-w-[110px]">
                  <Chip
                    icon={<AccessTime sx={{ color: '#6366f1' }} />}
                    label={<span style={{ fontWeight: 700, fontSize: 14 }}>{course.duration || 'N/A'}</span>}
                    sx={{
                      background: 'rgba(99,102,241,0.08)',
                      color: '#232046',
                      fontWeight: 700,
                      fontSize: 14,
                      height: 30,
                      px: 1.2,
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #a78bfa22',
                    }}
                  />
                  <Chip
                    icon={<MonetizationOn sx={{ color: '#10b981' }} />}
                    label={<span style={{ fontWeight: 700, fontSize: 14 }}>{course.price?.amount ? `₹${course.price.amount}` : (course.price ? `₹${course.price}` : 'Free')}</span>}
                    sx={{
                      background: 'rgba(16,185,129,0.08)',
                      color: '#232046',
                      fontWeight: 700,
                      fontSize: 14,
                      height: 30,
                      px: 1.2,
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #10b98122',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel} maxWidth="xs" PaperProps={{
        sx: {
          background: 'linear-gradient(120deg, #f3e8ff 0%, #f8fafc 100%)',
          borderRadius: 4,
        }
      }}>
        <DialogTitle>Are you sure you want to delete this course?</DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Course Modal */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth PaperProps={{
        sx: {
          background: 'linear-gradient(120deg, #f3e8ff 0%, #f8fafc 100%)',
          borderRadius: 6,
          boxShadow: 8,
          p: 0,
        }
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 4,
          py: 3,
          background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          mb: 1
        }}>
          <Add sx={{ fontSize: 36, color: '#fff' }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 0 }}>Add New Course</Typography>
        </Box>
        <DialogContent dividers sx={{ background: 'linear-gradient(120deg, #f8fafc 0%, #f3e8ff 100%)', p: 2 }}>
          {addCourseError && <Alert severity="error" sx={{ mb: 2 }}>{addCourseError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Core Info */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>Core Info</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Title" value={newCourse.title} onChange={e => handleAddCourseChange('title', e.target.value)} fullWidth required />
              <TextField label="Slug" value={newCourse.slug} onChange={e => handleAddCourseChange('slug', e.target.value)} fullWidth required />
            </Box>
            <TextField label="Description" value={newCourse.description} onChange={e => handleAddCourseChange('description', e.target.value)} fullWidth required multiline rows={2} />
            <FormControl fullWidth required sx={{ mt: 2 }}>
              <InputLabel id="type-select-label">Type</InputLabel>
              <Select
                labelId="type-select-label"
                value={newCourse.type || ''}
                label="Type"
                onChange={e => handleAddCourseChange('type', e.target.value)}
              >
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Soft Skills">Soft Skills</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
                <MenuItem value="Creative">Creative</MenuItem>
                <MenuItem value="Language">Language</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            {/* Modules (moved here) */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mt: 2 }}>Modules</Typography>
            {newCourse.modules.map((module, moduleIndex) => (
              <Paper key={moduleIndex} sx={{ border: '1px solid #e0e7ff', borderRadius: 2, p: 2, mb: 2, background: '#fafaff' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    label="Module Title"
                    value={module.moduleTitle}
                    onChange={e => handleModuleChange(moduleIndex, 'moduleTitle', e.target.value)}
                  />
                  <TextField label={`Module Description ${moduleIndex + 1}`} value={module.moduleDescription} onChange={e => handleModuleChange(moduleIndex, 'moduleDescription', e.target.value)} fullWidth multiline rows={2} />
                </Box>
                {/* Lessons */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>Lessons</Typography>
                {module.lessons.map((lesson, lessonIndex) => (
                  <Paper key={`${moduleIndex}-${lessonIndex}`} sx={{ border: '1px solid #e0e7ff', borderRadius: 2, p: 2, mb: 1, background: '#f5f7fa' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <TextField label={`Lesson Title ${lessonIndex + 1}`} value={lesson.title} onChange={e => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)} fullWidth required />
                      <TextField label={`Lesson Summary ${lessonIndex + 1}`} value={lesson.summary} onChange={e => handleLessonChange(moduleIndex, lessonIndex, 'summary', e.target.value)} fullWidth multiline rows={2} />
                    </Box>
                    {/* Topics */}
                    <Typography variant="subtitle3" sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>Topics</Typography>
                    {lesson.topics.map((topic, topicIndex) => (
                      <Paper key={`${moduleIndex}-${lessonIndex}-${topicIndex}`} sx={{ border: '1px solid #e0e7ff', borderRadius: 2, p: 2, mb: 1, background: '#f8f9fb' }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <TextField label={`Topic Title ${topicIndex + 1}`} value={topic.title} onChange={e => handleTopicChange(moduleIndex, lessonIndex, topicIndex, 'title', e.target.value)} fullWidth required />
                          <TextField label={`Topic Description ${topicIndex + 1}`} value={topic.description} onChange={e => handleTopicChange(moduleIndex, lessonIndex, topicIndex, 'description', e.target.value)} fullWidth multiline rows={2} />
                        </Box>
                        {/* Subtopics */}
                        <Typography variant="subtitle4" sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>Subtopics</Typography>
                        {topic.subTopics.map((subtopic, subtopicIndex) => (
                          <Paper key={`${moduleIndex}-${lessonIndex}-${topicIndex}-${subtopicIndex}`} sx={{ border: '1px solid #e0e7ff', borderRadius: 2, p: 2, mb: 1, background: '#fcfcfd' }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              <TextField label={`Subtopic Title ${subtopicIndex + 1}`} value={subtopic.title} onChange={e => handleSubtopicChange(moduleIndex, lessonIndex, topicIndex, subtopicIndex, 'title', e.target.value)} fullWidth required />
                              <TextField label={`Subtopic Content ${subtopicIndex + 1}`} value={subtopic.content} onChange={e => handleSubtopicChange(moduleIndex, lessonIndex, topicIndex, subtopicIndex, 'content', e.target.value)} fullWidth multiline rows={2} />
                            </Box>
                          </Paper>
                        ))}
                      </Paper>
                    ))}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={lesson.quizIncluded || false}
                            onChange={e => handleLessonChange(moduleIndex, lessonIndex, 'quizIncluded', e.target.checked)}
                          />
                        }
                        label="Quiz Included?"
                      />
                    </Box>
                    {/* Quiz Section */}
                    {lesson.quizIncluded && (
                      <Box sx={{ border: '1px solid #e0e7ff', borderRadius: 2, p: 2, mb: 2, background: '#f3f4f6' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>Quiz Questions</Typography>
                        {(lesson.quizQuestions || []).map((q, qIdx) => (
                          <Paper key={qIdx} sx={{ p: 2, mb: 2, background: '#fff', border: '1px solid #e0e7ff', borderRadius: 2 }}>
                            <TextField
                              label={`Question ${qIdx + 1}`}
                              value={q.question}
                              onChange={e => handleQuizQuestionChange(moduleIndex, lessonIndex, qIdx, 'question', e.target.value)}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              {[0, 1, 2, 3].map(optIdx => (
                                <TextField
                                  key={optIdx}
                                  label={`Option ${optIdx + 1}`}
                                  value={q.options[optIdx] || ''}
                                  onChange={e => handleQuizOptionChange(moduleIndex, lessonIndex, qIdx, optIdx, e.target.value)}
                                  fullWidth
                                />
                              ))}
                            </Box>
                            <TextField
                              label="Correct Answer"
                              value={q.answer}
                              onChange={e => handleQuizQuestionChange(moduleIndex, lessonIndex, qIdx, 'answer', e.target.value)}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                            <Button color="error" variant="outlined" onClick={() => handleRemoveQuizQuestion(moduleIndex, lessonIndex, qIdx)} sx={{ mt: 1 }}>Remove Question</Button>
                          </Paper>
                        ))}
                        <Button variant="contained" color="secondary" onClick={() => handleAddQuizQuestion(moduleIndex, lessonIndex)}>
                          Add Quiz Question
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Paper>
            ))}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Category" value={newCourse.category} onChange={e => handleAddCourseChange('category', e.target.value)} fullWidth required />
              <TextField label="Subcategory" value={newCourse.subCategory} onChange={e => handleAddCourseChange('subCategory', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="level-select-label">Level</InputLabel>
                <Select
                  labelId="level-select-label"
                  value={newCourse.level || ''}
                  label="Level"
                  onChange={e => handleAddCourseChange('level', e.target.value)}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Language" value={newCourse.language} onChange={e => handleAddCourseChange('language', e.target.value)} fullWidth required />
            </Box>
            {/* Pricing */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mt: 2 }}>Pricing</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Price Amount" type="number" value={newCourse.price.amount} onChange={e => handleAddCoursePriceChange('amount', e.target.value)} fullWidth required />
              <TextField label="Currency" value={newCourse.price.currency} onChange={e => handleAddCoursePriceChange('currency', e.target.value)} fullWidth />
              <TextField label="Discount %" type="number" value={newCourse.price.discountPercent} onChange={e => handleAddCoursePriceChange('discountPercent', e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="isfree-select-label">Is Free?</InputLabel>
                <Select
                  labelId="isfree-select-label"
                  value={newCourse.isFree ? 'true' : 'false'}
                  label="Is Free?"
                  onChange={e => handleAddCourseChange('isFree', e.target.value === 'true')}
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Ratings & Tags */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Average Rating" type="number" value={newCourse.averageRating} onChange={e => handleAddCourseChange('averageRating', e.target.value)} fullWidth />
              <TextField label="Ratings Count" type="number" value={newCourse.ratingsCount} onChange={e => handleAddCourseChange('ratingsCount', e.target.value)} fullWidth />
              <TextField label="Duration (e.g. 12h 30m)" value={newCourse.duration} onChange={e => handleAddCourseChange('duration', e.target.value)} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <TextField
                  label="Add Tag"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  InputProps={{ endAdornment: <Button onClick={handleAddTag} disabled={!tagInput.trim()}>Add</Button> }}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {newCourse.tags.map(tag => (
                    <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} color="primary" variant="outlined" />
                  ))}
                </Box>
              </FormControl>
            </Box>
            {/* Media & Professor */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mt: 2 }}>Media & Professor</Typography>
            <TextField label="Cover Image URL" value={newCourse.coverImage} onChange={e => handleAddCourseChange('coverImage', e.target.value)} fullWidth />
            <TextField label="Promo Video URL" value={newCourse.promoVideoUrl} onChange={e => handleAddCourseChange('promoVideoUrl', e.target.value)} fullWidth />
            <FormControl fullWidth required sx={{ mt: 1 }}>
              <InputLabel id="professor-select-label">Professor</InputLabel>
              <Select
                labelId="professor-select-label"
                value={newCourse.professor}
                label="Professor"
                onChange={e => handleAddCourseChange('professor', e.target.value)}
                disabled={professorsLoading}
              >
                {professorsLoading && <MenuItem value=""><em>Loading...</em></MenuItem>}
                {!professorsLoading && professors.length === 0 && <MenuItem value=""><em>No professors found</em></MenuItem>}
                {professors.map(prof => (
                  <MenuItem key={prof._id} value={prof._id}>
                    {prof.name} ({prof.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Status & PublishedAt */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={newCourse.status || ''}
                  label="Status"
                  onChange={e => handleAddCourseChange('status', e.target.value)}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Published">Published</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Published At"
                type="datetime-local"
                value={newCourse.publishedAt}
                onChange={e => handleAddCourseChange('publishedAt', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1, background: 'linear-gradient(90deg, #f3e8ff 0%, #f8fafc 100%)', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
          <Button onClick={handleAddClose} color="secondary" variant="outlined">Cancel</Button>
          <Button onClick={handleSaveCourse} color="primary" variant="contained" disabled={creating} sx={{ fontWeight: 700, px: 4, borderRadius: 3, boxShadow: 2 }}>{creating ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default Courses; 