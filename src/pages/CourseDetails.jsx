import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseUrl from '../Api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [profModalOpen, setProfModalOpen] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [profLoading, setProfLoading] = useState(false);
  const [profError, setProfError] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  

  // Add a function to refetch course details
  const refetchCourse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/courses/${courseId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch course');
      const data = await res.json();
      setCourse(data);
      try {
        const u = getUser();
        if (u && data) {
          const enrolled = Boolean(
            (Array.isArray(data?.enrolledUsers) && data.enrolledUsers.some(x => (x?._id || x) === u._id)) ||
            (Array.isArray(data?.users) && data.users.some(x => (x?._id || x) === u._id)) ||
            (Array.isArray(data?.enrollments) && data.enrollments.some(e => (e?.userId?._id || e?.userId || e?.user?._id || e?.user) === u._id)) ||
            data?.isEnrolled === true || data?.enrolled === true
          );
          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(false);
        }
      } catch {
        setIsEnrolled(false);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BaseUrl}/courses/${courseId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        setCourse(data);
        try {
          const u = getUser();
          if (u && data) {
            const enrolled = Boolean(
              (Array.isArray(data?.enrolledUsers) && data.enrolledUsers.some(x => (x?._id || x) === u._id)) ||
              (Array.isArray(data?.users) && data.users.some(x => (x?._id || x) === u._id)) ||
              (Array.isArray(data?.enrollments) && data.enrollments.some(e => (e?.userId?._id || e?.userId || e?.user?._id || e?.user) === u._id)) ||
              data?.isEnrolled === true || data?.enrolled === true
            );
            setIsEnrolled(enrolled);
          } else {
            setIsEnrolled(false);
          }
        } catch {
          setIsEnrolled(false);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  

  // Fetch professors for admin assignment
  useEffect(() => {
    if (profModalOpen) {
      setProfLoading(true);
      setProfError('');
      const token = localStorage.getItem('token');
      fetch(`${BaseUrl}/professors`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setProfessors(data))
        .catch(err => setProfError('Failed to fetch professors'))
        .finally(() => setProfLoading(false));
    }
  }, [profModalOpen]);

  

  // Simple confirmation-based enrollment (no fields)
  const handleEnrollConfirm = async () => {
    setEnrolling(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const payload = {
        userId: user?._id,
        courseId: course._id,
        amountPaid: 0,
        paymentMethod: 'Razorpay',
        transactionId: `CONF-${Date.now()}`,
        paymentStatus: 'Success',
        receiptUrl: ''
      };
      const res = await fetch(`${BaseUrl}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      toast.success('Enrolled successfully!');
      setEnrollModalOpen(false);
      setIsEnrolled(true);
      try { await refetchCourse(); } catch {}
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  // Assign professor handler
  const handleAssignProfessor = async (e) => {
    e.preventDefault();
    if (!selectedProfessor) return toast.error('Please select a professor');
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/professors/assign-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ professorId: selectedProfessor, courseId: course._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign professor');
      toast.success(data.message || 'Professor assigned!');
      setCourse(data.course);
      setProfModalOpen(false);
      setSelectedProfessor('');
      await refetchCourse();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Unassign professor handler
  const handleUnassignProfessor = async () => {
    setUnassigning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/professors/unassign-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseId: course._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to unassign professor');
      toast.success(data.message || 'Professor unassigned!');
      setCourse(data.course);
      await refetchCourse();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnassigning(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
    </div>
  );
  if (!course) return <div className="text-center text-red-400 font-bold py-10 w-full">Course not found.</div>;

  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen px-0 pt-2 md:pt-4 flex flex-col items-center">
      <div className="w-full mt-2">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ color: '#fff', fontWeight: 700, fontSize: 18, textTransform: 'none', background: 'rgba(168,139,250,0.15)', borderRadius: 2, px: 2, py: 1, minWidth: 0, mr: 0, boxShadow: 'none', '&:hover': { background: 'rgba(236,72,153,0.15)' } }} />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Image */}
          <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center">
            <img src={course.coverImage} alt={course.title} className="rounded-2xl shadow-lg w-full object-cover mb-4" style={{ maxHeight: 220 }} />
          </div>
          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-4 justify-between" style={{ lineHeight: 2 }}>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ lineHeight: 1.6 }}>{course.title}</h2>
              <p className="text-purple-200 mb-4 w-full" style={{ lineHeight: 2.1 }}>{course.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-blue-400/80 to-purple-400/80 text-white shadow border border-white/20">{course.type}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-pink-400/80 to-purple-400/80 text-white shadow border border-white/20">{course.level}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-yellow-400/80 to-pink-400/80 text-white shadow border border-white/20">{course.language}</span>
              </div>
              <div className="flex items-center gap-5 mb-4 flex-wrap">
                <span className="text-yellow-400 font-bold text-lg">★ {course.averageRating}</span>
                <span className="text-purple-200 text-sm">({course.ratingsCount} ratings)</span>
                <span className="text-purple-100 text-sm font-semibold">Duration: {course.duration}</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                {course.tags && course.tags.map((tag, idx) => (
                  <span key={idx} className="bg-purple-700/40 text-purple-200 px-2 py-0.5 rounded-full text-base font-semibold">#{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4" />
            </div>
            {!isAdmin ? (
              isEnrolled ? (
                <span className="px-4 py-2 rounded-lg bg-green-600/30 text-green-200 font-bold inline-flex items-center justify-center" style={{ minWidth: 150 }}>
                  Already enrolled for the course
                </span>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEnrollModalOpen(true)}
                  sx={{
                    background: 'linear-gradient(to right, #f472b6, #a78bfa)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: 15,
                    px: 1.5,
                    py: 0.7,
                    width: 150,
                    minWidth: 70,
                    mt: 1,
                    boxShadow: '0 4px 24px 0 rgba(168,139,250,0.15)',
                    '&:hover': { background: 'linear-gradient(to right, #a78bfa, #f472b6)' }
                  }}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              )
            ) : (
              <div className="mt-2">
                {course.professor && course.professor.name ? (
                  <div className="flex flex-col gap-2">
                    <span className="px-4 py-2 rounded-lg bg-green-600/30 text-green-200 font-bold flex items-center gap-3">
                      <img src={course.professor.profileImage} alt="prof" className="w-8 h-8 rounded-full object-cover border-2 border-pink-400 shadow" style={{ minWidth: 32 }} />
                      <span>{course.professor.name}</span>
                      <span className="text-xs text-purple-200 ml-2">({course.professor.email})</span>
                    </span>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleUnassignProfessor}
                      disabled={unassigning}
                      sx={{
                        color: '#fff',
                        borderColor: '#f472b6',
                        fontWeight: 700,
                        borderRadius: 2,
                        fontSize: 15,
                        px: 1.5,
                        py: 0.7,
                        width: 200,
                        minWidth: 100,
                        mt: 1,
                        boxShadow: '0 4px 24px 0 rgba(168,139,250,0.15)',
                        '&:hover': { borderColor: '#a78bfa', background: 'rgba(236,72,153,0.10)' }
                      }}
                    >
                      {unassigning ? 'Unassigning...' : 'Unassign Professor'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setProfModalOpen(true)}
                    sx={{
                      background: 'linear-gradient(to right, #a78bfa, #f472b6)',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: 15,
                      px: 1.5,
                      py: 0.7,
                      width: 200,
                      minWidth: 100,
                      mt: 1,
                      boxShadow: '0 4px 24px 0 rgba(168,139,250,0.15)',
                      '&:hover': { background: 'linear-gradient(to right, #f472b6, #a78bfa)' }
                    }}
                  >
                    Assign Professor
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Curriculum Accordions */}
        <div className="mt-8 w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Course Curriculum</h2>
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((mod, mIdx) => (
              <Accordion key={mIdx} sx={{ width: '100%', background: 'rgba(88,28,135,0.15)', color: '#fff', borderRadius: 2, mb: 2, boxShadow: 'none', border: '1px solid #a78bfa33' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                  <Typography sx={{ fontWeight: 700 }}>{mod.moduleTitle}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ mb: 1, color: '#d1b3ff', lineHeight: 1.8 }}>{mod.moduleDescription}</Typography>
                  {mod.lessons && mod.lessons.length > 0 ? (
                    mod.lessons.map((lesson, lIdx) => (
                      <Box key={lIdx} sx={{ mb: 2, pl: 2 }}>
                        <Typography sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>{lesson.title}</Typography>
                        <Typography sx={{ color: '#bdb4e6', mb: 1, lineHeight: 1.7 }}>{lesson.summary}</Typography>
                        {lesson.topics && lesson.topics.length > 0 && (
                          <ul className="list-disc ml-6">
                            {lesson.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="mb-1" style={{ lineHeight: 1.7 }}>
                                <span className="font-semibold text-purple-200">{topic.title}</span>: <span className="text-purple-100">{topic.description}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Box>
                    ))
                  ) : <Typography sx={{ color: '#bdb4e6' }}>No lessons in this module.</Typography>}
                </AccordionDetails>
              </Accordion>
            ))
          ) : <Typography sx={{ color: '#bdb4e6' }}>No modules found.</Typography>}
        </div>
      </div>
      {/* Enroll Modal */}
      <Dialog open={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} maxWidth="xs" fullWidth BackdropProps={{
        sx: {
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }
      }} PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #2d225a 80%, #a78bfa 100%)',
          boxShadow: '0 8px 32px 0 rgba(168,139,250,0.25)',
          border: '1.5px solid #f472b6',
          color: '#fff',
        }
      }}>
        <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-2xl mb-2" />
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, fontSize: 22, pb: 1 }}>Enroll in Course</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography sx={{ color: '#d1b3ff', lineHeight: 1.8 }}>
              Are you sure you want to enroll in <strong>{course.title}</strong>?
            </Typography>
          </Box>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button onClick={() => setEnrollModalOpen(false)} sx={{ background: 'linear-gradient(to right, #a78bfa, #f472b6)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #f472b6, #a78bfa)' } }}>Cancel</Button>
            <Button onClick={handleEnrollConfirm} variant="contained" disabled={enrolling} sx={{ background: 'linear-gradient(to right, #f472b6, #a78bfa)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #a78bfa, #f472b6)' } }}>{enrolling ? 'Enrolling...' : 'Confirm Enroll'}</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      {/* Professor Assignment Modal */}
      <Dialog open={profModalOpen} onClose={() => setProfModalOpen(false)} maxWidth="xs" fullWidth BackdropProps={{
        sx: {
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }
      }} PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #2d225a 80%, #a78bfa 100%)',
          boxShadow: '0 8px 32px 0 rgba(168,139,250,0.25)',
          border: '1.5px solid #f472b6',
          color: '#fff',
        }
      }}>
        <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-2xl mb-2" />
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, fontSize: 22, pb: 1 }}>Assign Professor</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <form onSubmit={handleAssignProfessor} className="flex flex-col gap-4 mt-2">
            <FormControl fullWidth required>
              <InputLabel id="prof-select-label" sx={{ color: '#d1b3ff', fontWeight: 600 }}>Professor</InputLabel>
              <Select
                labelId="prof-select-label"
                value={selectedProfessor}
                label="Professor"
                onChange={e => setSelectedProfessor(e.target.value)}
                sx={{ background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2, label: { color: '#d1b3ff' } }}
                disabled={profLoading}
              >
                {profLoading ? (
                  <MenuItem value=""><CircularProgress size={20} /> <span style={{ color: '#fff', marginLeft: 8 }}>Loading...</span></MenuItem>
                ) : profError ? (
                  <MenuItem value=""><span style={{ color: '#ef4444' }}>{profError}</span></MenuItem>
                ) : professors.length === 0 ? (
                  <MenuItem value=""><span style={{ color: '#fff' }}>No professors found</span></MenuItem>
                ) : professors.map(prof => (
                  <MenuItem key={prof._id} value={prof._id} sx={{ color: '#000', fontWeight: 600 }}>{prof.name} ({prof.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={() => setProfModalOpen(false)} sx={{ background: 'linear-gradient(to right, #a78bfa, #f472b6)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #f472b6, #a78bfa)' } }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={assigning} sx={{ background: 'linear-gradient(to right, #f472b6, #a78bfa)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #a78bfa, #f472b6)' } }}>{assigning ? 'Assigning...' : 'Assign'}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails; 