import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseUrl from '../Api';
import {
  Box, Typography, Button, Chip, Rating, Avatar, Card, CardContent, 
  Divider, List, ListItem, ListItemIcon, ListItemText, Paper, 
  Grid, IconButton, CircularProgress, Alert, Accordion, AccordionSummary, 
  AccordionDetails, Badge, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar
} from '@mui/material';
import {
  ArrowBack, Star, AccessTime, MonetizationOn, CurrencyRupee, Person, 
  Category, Language, TrendingUp, School, VideoLibrary,
  Book, Assignment, Quiz, PlayCircle, CheckCircle, 
  ExpandMore, CalendarToday, Description, Tag, 
  Visibility, ThumbUp, Share, Bookmark, BookmarkBorder, LocalOffer
} from '@mui/icons-material';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [transactionId, setTransactionId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [quizLesson, setQuizLesson] = useState(null);
  const [openQuizLessonIndex, setOpenQuizLessonIndex] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BaseUrl}/courses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch course details');
        const data = await res.json();
        setCourse(data.course || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    navigator.share({
      title: course?.title,
      text: course?.description,
      url: window.location.href
    }).catch(() => {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    });
  };

  const handleEnroll = () => {
    setEnrollOpen(true);
    setEnrollError('');
    setEnrollSuccess('');
    setAmountPaid(course?.price?.amount || '');
    setPaymentMethod('Razorpay');
    setTransactionId('');
    setReceiptUrl('');
  };

  const handleEnrollSubmit = async () => {
    setEnrollLoading(true);
    setEnrollError('');
    setEnrollSuccess('');
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not logged in');
      const payload = {
        userId,
        courseId: course._id,
        amountPaid: Number(amountPaid),
        paymentMethod,
        transactionId,
        paymentStatus: 'Success',
        receiptUrl
      };
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      setEnrollSuccess(data.message || 'Enrolled successfully!');
      setSnackbar({ open: true, message: data.message || 'Enrolled successfully!', severity: 'success' });
      setEnrollOpen(false);
    } catch (err) {
      setEnrollError(err.message || 'Failed to enroll');
      setSnackbar({ open: true, message: err.message || 'Failed to enroll', severity: 'error' });
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleOpenQuiz = (lesson) => {
    setQuizLesson(lesson);
  };

  const handleCloseQuiz = () => {
    setQuizLesson(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100vw', maxWidth: '100vw', background: '#f5f6fa', overflowX: 'hidden' }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', width: '100vw', background: '#f5f6fa' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/courses')} startIcon={<ArrowBack />}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', width: '100vw', background: '#f5f6fa' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Course not found</Typography>
        <Button variant="contained" onClick={() => navigate('/courses')} startIcon={<ArrowBack />}>
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', background: '#f5f6fa', pb: 6, px: { xs: 0, md: 0 }, overflowX: 'hidden' }}>
      {/* Top Bar with Back Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 2, md: 4 }, pt: 3, pb: 2 }}>
        <IconButton onClick={() => navigate('/courses')} sx={{ color: '#6366f1', mr: 2 }}>
          <ArrowBack sx={{ fontSize: 32 }} />
        </IconButton>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#232046', letterSpacing: 0.5, fontSize: { xs: 28, md: 38 } }}>
          {course.title}
        </Typography>
      </Box>

      {/* Hero Image and Description */}
      <Box sx={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 4, px: { xs: 2, md: 4 }, mt: 1, background: 'transparent', boxShadow: 'none', overflowX: 'hidden' }}>
        {/* Hero Image */}
        {course.coverImage && (
          <Box sx={{ flex: '0 0 420px', width: { xs: '100%', md: 420 }, maxWidth: '100%', height: { xs: 220, md: 320 }, borderRadius: 4, overflowX: 'hidden', boxShadow: 'none', background: 'transparent' }}>
            <img 
              src={course.coverImage} 
              alt={course.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
            />
          </Box>
        )}
        {/* Description and Enroll */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, justifyContent: 'flex-start', alignItems: 'flex-start', mt: { xs: 2, md: 0 } }}>
          <Typography variant="h5" sx={{ color: '#232046', fontWeight: 700, mb: 0.5 }}>Description</Typography>
          <Typography variant="body1" sx={{ color: '#444', fontSize: 17, mb: 1, lineHeight: 1.6, maxWidth: 700 }}>
            {course.description}
          </Typography>
          {/* Tags above rating/metrics chips, styled as white buttons with black text */}
          {course.tags && course.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {course.tags.map((tag, index) => (
                <Button
                  key={index}
                  variant="contained"
                  sx={{
                    background: '#fff',
                    color: '#232046',
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 2.5,
                    py: 0.5,
                    fontSize: 15,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px #a78bfa11',
                    border: '1.5px solid #e0e7ff',
                    '&:hover': { background: '#f3f4f6' },
                    minWidth: 'unset',
                  }}
                  disableElevation
                >
                  {tag}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
            <Chip icon={<Star sx={{ color: '#fbbf24' }} />} label={`${course.averageRating || 4.5} (${course.ratingsCount || 0} reviews)`} sx={{ fontWeight: 600, fontSize: 15, background: '#fff7e6', color: '#b45309' }} />
            <Chip icon={<AccessTime sx={{ color: '#6366f1' }} />} label={course.duration || 'Not specified'} sx={{ fontWeight: 600, fontSize: 15, background: '#e0e7ff', color: '#3730a3' }} />
            <Chip icon={<Category sx={{ color: '#6366f1' }} />} label={course.category || 'Not specified'} sx={{ fontWeight: 600, fontSize: 15, background: '#f3f4f6', color: '#4b5563' }} />
            <Chip icon={<Language sx={{ color: '#6366f1' }} />} label={course.language || 'Not specified'} sx={{ fontWeight: 600, fontSize: 15, background: '#f3f4f6', color: '#4b5563' }} />
            <Chip icon={<TrendingUp sx={{ color: '#6366f1' }} />} label={course.level || 'Beginner'} sx={{ fontWeight: 600, fontSize: 15, background: '#f3e8ff', color: '#7c3aed' }} />
          </Box>
          {/* Price and Enroll button side by side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 1 }}>
            <Button
              variant="contained"
              sx={{
                fontWeight: 900,
                fontSize: 17,
                borderRadius: 4,
                px: 3,
                py: 0.7,
                minHeight: 40,
                height: 40,
                background: '#fbbf24',
                color: '#fff',
                letterSpacing: 0.5,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.1,
                border: '1.5px solid #fde68a',
                boxShadow: '0 2px 8px 0 #fbbf2422',
                position: 'relative',
                transition: 'box-shadow 0.2s',
                '&:hover': { background: '#fde68a', color: '#fff', boxShadow: '0 4px 16px 0 #fbbf2444' },
              }}
              disabled
              startIcon={<CurrencyRupee sx={{ color: '#fff', fontSize: 20, mb: '-2px' }} />}
            >
              {course.price?.amount ? course.price.amount : 'Free'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              sx={{
                fontWeight: 800,
                fontSize: 16,
                borderRadius: 3,
                px: 4,
                py: 0.7,
                minHeight: 40,
                height: 40,
                boxShadow: '0 2px 12px #a78bfa22',
                background: '#6366f1',
                color: '#fff',
                letterSpacing: 0.5,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={handleEnroll}
            >
              Enroll
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Course Overview - creative horizontal info bar */}
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, mt: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, background: '#ede9fe', borderRadius: 3, p: 2, boxShadow: '0 2px 12px #a78bfa11' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <School sx={{ fontSize: 28, color: '#7c3aed' }} />
            <Typography sx={{ fontWeight: 700, color: '#5b21b6', fontSize: 18 }}>{course.modules?.length || 0}</Typography>
            <Typography sx={{ color: '#5b21b6', fontSize: 15 }}>Modules</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VideoLibrary sx={{ fontSize: 28, color: '#2563eb' }} />
            <Typography sx={{ fontWeight: 700, color: '#1e40af', fontSize: 18 }}>{course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}</Typography>
            <Typography sx={{ color: '#1e40af', fontSize: 15 }}>Lessons</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Assignment sx={{ fontSize: 28, color: '#16a34a' }} />
            <Typography sx={{ fontWeight: 700, color: '#15803d', fontSize: 18 }}>{course.modules?.reduce((total, module) => total + module.lessons?.reduce((lTotal, lesson) => lTotal + (lesson.quizIncluded ? 1 : 0), 0), 0) || 0}</Typography>
            <Typography sx={{ color: '#15803d', fontSize: 15 }}>Quizzes</Typography>
          </Box>
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrendingUp sx={{ fontSize: 28, color: '#9333ea' }} />
            <Typography sx={{ fontWeight: 700, color: '#7c3aed', fontSize: 18 }}>{course.level || 'Beginner'}</Typography>
            <Typography sx={{ color: '#7c3aed', fontSize: 15 }}>Level</Typography>
          </Box> */}
        </Box>
      </Box>

      {/* Course Content - Accordion style */}
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, mt: 3, background: 'transparent', boxShadow: 'none' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#232046', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Book sx={{ color: '#6366f1' }} />
          Course Content
        </Typography>
        {course.modules?.map((module, moduleIndex) => (
          <Accordion key={moduleIndex} sx={{ mb: 2, borderRadius: 2, background: '#f8fafc', boxShadow: '0 2px 8px #a78bfa11', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: '#6366f1', width: 26, height: 26, fontSize: 13, fontWeight: 700 }}>
                  {moduleIndex + 1}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: 20 }}>
                  {module.moduleTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: 15 }}>
                  {module.lessons?.length || 0} lessons
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 500, mb: 1 }}>
                {module.moduleDescription}
              </Typography>
              <List>
                {module.lessons?.map((lesson, lessonIndex) => (
                  <ListItem key={lessonIndex} sx={{ px: 0, mb: 1, borderRadius: 2, background: '#fff', boxShadow: '0 1px 4px #a78bfa11', minHeight: 48, flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ListItemIcon>
                        <PlayCircle sx={{ color: '#6366f1' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: 16 }}>
                            {lesson.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5, fontSize: 14 }}>
                              {lesson.summary}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {lesson.previewAvailable && (
                                <Chip size="small" label="Preview" sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                              )}
                              {lesson.quizIncluded && (
                                <Chip
                                  size="small"
                                  icon={<Quiz />}
                                  label="Quiz"
                                  sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600, cursor: 'pointer' }}
                                />
                              )}
                              {/* <Chip size="small" icon={<AccessTime />} label={lesson.durationMinutes || 'Not specified'} sx={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} /> */}
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Quiz Modal */}
      <Dialog open={!!quizLesson} onClose={handleCloseQuiz} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 22, color: '#232046', pb: 1 }}>Quiz: {quizLesson?.title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {quizLesson?.quizQuestions?.length > 0 ? (
            quizLesson.quizQuestions.map((q, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, borderRadius: 2, background: '#f3f4f6' }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Q{idx + 1}: {q.question}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {q.options.map((opt, oidx) => (
                    <Button key={oidx} variant="outlined" sx={{ justifyContent: 'flex-start', borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#232046', borderColor: '#a78bfa' }}>
                      {opt}
                    </Button>
                  ))}
                </Box>
                <Typography sx={{ mt: 1, color: '#6366f1', fontWeight: 600, fontSize: 15 }}>Answer: {q.answer}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No quiz questions available for this lesson.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseQuiz} color="secondary" variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Modal */}
      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 0, background: '#f5f6fa' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 24, color: '#232046', pb: 1 }}>Enroll in {course.title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {enrollError && <Alert severity="error">{enrollError}</Alert>}
          <TextField
            label="Amount Paid"
            type="number"
            value={amountPaid}
            onChange={e => setAmountPaid(e.target.value)}
            fullWidth
            required
            sx={{ mb: 1 }}
          />
          <TextField
            label="Payment Method"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            fullWidth
            required
            sx={{ mb: 1 }}
          />
          <TextField
            label="Transaction ID"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            fullWidth
            required
            sx={{ mb: 1 }}
          />
          <TextField
            label="Receipt URL"
            value={receiptUrl}
            onChange={e => setReceiptUrl(e.target.value)}
            fullWidth
            required
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEnrollOpen(false)} color="secondary" variant="outlined">Cancel</Button>
          <Button onClick={handleEnrollSubmit} color="primary" variant="contained" disabled={enrollLoading} sx={{ fontWeight: 700, px: 4, borderRadius: 3 }}>{enrollLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enroll'}</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for feedback */}
      <Snackbar 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        sx={{ zIndex: 99999 }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%', minWidth: '300px', fontWeight: 600, fontSize: '14px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseDetails; 