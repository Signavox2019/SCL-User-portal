import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import BaseUrl from '../Api';
import universityList from '../assets/University_list.js';

// Dropdown options for degree and department
const degreeOptions = [
  'B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'PhD', 'B.Sc', 'M.Sc', 'BCA', 'MCA'
];
const departmentOptions = [
  'Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering'
];
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Grade as GradeIcon,
  BusinessCenter as BusinessCenterIcon,
  AccountBalance as AccountBalanceIcon,
  WorkOutline as WorkOutlineIcon,
  Payment as PaymentIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [offerLetterUrl, setOfferLetterUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Add CSS to force dropdowns to open downward
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      select {
        direction: ltr !important;
        text-align: left !important;
      }
      select option {
        direction: ltr !important;
        text-align: left !important;
      }
      /* Force dropdowns to open downward */
      select:focus {
        transform: none !important;
        transform-origin: top left !important;
      }
      /* Ensure dropdown opens below the select */
      select:focus option {
        position: relative !important;
        top: auto !important;
        bottom: auto !important;
      }
      /* Override any dropup behavior */
      .select-dropdown {
        transform: none !important;
        transform-origin: top left !important;
      }
      /* Force dropdown direction */
      select[size] {
        transform: none !important;
      }
      /* Ensure proper positioning for all select elements */
      select {
        position: relative !important;
        z-index: 1 !important;
      }
      /* Override any browser default dropup behavior */
      select:focus {
        position: relative !important;
        top: auto !important;
        bottom: auto !important;
      }
      /* Hide scrollbar for installments modal */
      .scrollbar-hide {
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (editing && unsavedChanges) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [editing, unsavedChanges]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BaseUrl}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ensure boolean values are properly set
      const userData = {
        ...response.data.user,
        hasExperience: response.data.user.hasExperience === true,
        isGraduated: response.data.user.isGraduated === true
      };
      
      setUser(userData);
      setFormData(userData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile data');
      setLoading(false);
      toast.error('Failed to fetch profile data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setUnsavedChanges(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      }
      reader.readAsDataURL(file);
    }
    setUnsavedChanges(true);
  };

  const handleEdit = () => {
    setEditing(true);
    setUnsavedChanges(false); // Reset unsaved changes when editing starts
  };

  const handleCancel = () => {
    // Ensure boolean values are properly set when canceling
    const resetData = {
      ...user,
      hasExperience: user.hasExperience === true,
      isGraduated: user.isGraduated === true
    };
    setFormData(resetData);
    setProfileImagePreview(null);
    setEditing(false);
    setUnsavedChanges(false); // Reset unsaved changes on cancel
  };

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BaseUrl}/users/me/update-profile`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ensure boolean values are properly set after saving
      const updatedUserData = {
        ...response.data.user,
        hasExperience: response.data.user.hasExperience === true,
        isGraduated: response.data.user.isGraduated === true
      };
      
      setUser(updatedUserData);
      setFormData(updatedUserData);
      setProfileImagePreview(null);
      setEditing(false);
      setUnsavedChanges(false); // Reset unsaved changes on successful save
      
      // Update localStorage with the new user data so navbar reflects changes immediately
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Trigger a custom event to notify other components about the user update
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUserData }));
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleViewOfferLetter = () => {
    if (formData.offerLetter) {
      setOfferLetterUrl(formData.offerLetter);
      setShowViewModal(true);
    } else {
      toast.info('No offer letter available');
    }
  };

  const handleOpenInNewTab = () => {
    if (offerLetterUrl) {
      window.open(offerLetterUrl, '_blank');
    }
  };

  const handleViewInstallments = () => {
    setShowInstallmentsModal(true);
  };

  const getFieldDisplayName = (fieldName) => {
    const fieldMappings = {
      'title': 'Title',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'email': 'Email',
      'phone': 'Phone',
      'employeeAddress': 'Employee Address',
      'resume': 'Resume',
      'collegeName': 'College Name',
      'department': 'Department',
      'university': 'University',
      'degree': 'Degree',
      'specialization': 'Specialization',
      'cgpa': 'CGPA',
      'currentYear': 'Current Year',
      'yearOfPassing': 'Year of Passing',
      'isGraduated': 'Is Graduated',
      'hasExperience': 'Has Experience',
      'previousCompany': 'Previous Company',
      'position': 'Position',
      'yearsOfExperience': 'Years of Experience',
      'hrName': 'HR Name',
      'workingDays': 'Working Days'
    };
    
    return fieldMappings[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const checkRequiredFields = () => {
    // Only check editable fields (not disabled) - excluding profile image and non-editable org/course fields
    const requiredFields = [
      // Personal Information (editable) - all fields required
      'title', 'firstName', 'lastName', 'email', 'phone', 'employeeAddress', 'resume',
      // Academic Information (editable) - all fields required
      'collegeName', 'department', 'university', 'degree', 'specialization',
      'cgpa', 'currentYear', 'yearOfPassing', 'isGraduated',
      // Work Experience (editable) - all fields required
      'hasExperience',
      // Organization Details (editable only) - only editable fields
      'hrName', 'workingDays'
    ];

    let missingFields = requiredFields.filter(field => {
      const value = formData[field];
      
      // Handle boolean fields
      if (field === 'isGraduated' || field === 'hasExperience') {
        return value === undefined || value === null || value === '';
      }
      
      // Handle array fields
      if (Array.isArray(value)) {
        return !value || value.length === 0;
      }
      
      // Handle regular fields
      return !value || value === '' || value === 'Not specified';
    });

    // Add conditional work experience fields if hasExperience is true
    if (formData.hasExperience === true) {
      const workExperienceFields = ['previousCompany', 'position', 'yearsOfExperience'];
      const missingWorkFields = workExperienceFields.filter(field => {
        const value = formData[field];
        return !value || value === '' || value === 'Not specified';
      });
      missingFields = [...missingFields, ...missingWorkFields];
    }

    return missingFields;
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
      <div className="text-center text-red-400 font-bold py-10">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-400 font-bold py-10">
        No user data found
      </div>
    );
  }

  const renderFormField = (label, name, type = 'text', placeholder = '', disabled = false, icon = null, fullWidth = true) => {
    // Handle nested object properties (e.g., 'shiftTimings.start')
    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current && current[key], obj);
    };

    const setValue = (obj, path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
      }, obj);
      target[lastKey] = value;
      return obj;
    };

    const currentValue = getValue(formData, name) || '';
    const displayValue = Array.isArray(currentValue) ? currentValue.join(', ') : currentValue;

    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        {editing && !disabled ? (
          <input
            type={type}
            name={name}
            value={displayValue}
            onChange={(e) => {
              const newFormData = { ...formData };
              if (name.includes('.')) {
                setValue(newFormData, name, e.target.value);
              } else {
                newFormData[name] = e.target.value;
              }
              setFormData(newFormData);
              setUnsavedChanges(true);
            }}
            className="w-full px-4 py-3 bg-white/10 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        ) : (
          <div className="px-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white font-medium backdrop-blur-sm break-words overflow-hidden">
            <span className="break-all">{displayValue || 'Not specified'}</span>
          </div>
        )}
      </div>
    );
  };

  const renderSelectField = (label, name, options, disabled = false, icon = null, fullWidth = true) => {
    const currentValue = formData[name];
    // Handle boolean values for Yes/No options
    const getDisplayValue = (value) => {
      if (value === true) return 'Yes';
      if (value === false) return 'No';
      return value || '';
    };
    const handleSelectChange = (e) => {
      const value = e.target.value;
      if (options.includes('Yes') && options.includes('No')) {
        setFormData(prev => ({
          ...prev,
          [name]: value === 'Yes' ? true : value === 'No' ? false : ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      setUnsavedChanges(true);
    };
    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        {editing && !disabled ? (
          <div className="relative">
            <select
              name={name}
              value={getDisplayValue(currentValue)}
              onChange={handleSelectChange}
              className="w-full px-4 py-3 bg-white/10 border border-purple-300/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
                direction: 'ltr',
                textAlign: 'left',
                transform: 'none',
                transformOrigin: 'top left',
                position: 'relative',
                zIndex: 1,
                // Force dropdown to open downward
                top: 'auto',
                bottom: 'auto'
              }}
            >
              <option value="" className="text-gray-700 bg-white">Select {label.toLowerCase()}</option>
              {options.map(option => (
                <option key={option} value={option} className="text-gray-700 bg-white">
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="px-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white font-medium backdrop-blur-sm">
            {getDisplayValue(currentValue) || 'Not specified'}
          </div>
        )}
      </div>
    );
  };

  const renderRadioField = (label, name, disabled = false, icon = null, fullWidth = true) => {
    const currentValue = formData[name];
    
    // Debug logging
    console.log(`${label} Value:`, currentValue, 'Type:', typeof currentValue);

    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        {editing && !disabled ? (
          <div className="flex gap-6">
            <label className="flex items-center gap-3 text-white cursor-pointer hover:text-purple-200 transition-colors duration-200">
              <input
                type="radio"
                name={name}
                value="true"
                checked={currentValue === true}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-500 bg-transparent border-2 border-purple-300 rounded-full focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                style={{
                  accentColor: '#a855f7'
                }}
              />
              <span className="font-medium">Yes</span>
            </label>
            <label className="flex items-center gap-3 text-white cursor-pointer hover:text-purple-200 transition-colors duration-200">
              <input
                type="radio"
                name={name}
                value="false"
                checked={currentValue === false}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-500 bg-transparent border-2 border-purple-300 rounded-full focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                style={{
                  accentColor: '#a855f7'
                }}
              />
              <span className="font-medium">No</span>
            </label>
          </div>
        ) : (
          <div className="px-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white font-medium backdrop-blur-sm">
            {currentValue === true ? 'Yes' : currentValue === false ? 'No' : 'Not specified'}
          </div>
        )}
      </div>
    );
  };

  const renderWorkingDaysField = (label, name, disabled = false, icon = null, fullWidth = true) => {
    const currentValue = formData[name] || [];
    const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const handleDayToggle = (day) => {
      if (editing && !disabled) {
        const currentDays = Array.isArray(currentValue) ? currentValue : [];
        const updatedDays = currentDays.includes(day) 
          ? currentDays.filter(d => d !== day)
          : [...currentDays, day];
        setFormData(prev => ({
          ...prev,
          [name]: updatedDays
        }));
      }
      setUnsavedChanges(true);
    };

    const isDaySelected = (day) => {
      const currentDays = Array.isArray(currentValue) ? currentValue : [];
      return currentDays.includes(day);
    };

    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        <div className="flex flex-wrap gap-2">
          {workingDays.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              disabled={!editing || disabled}
              className={`px-3 py-2 rounded-full font-medium transition-all duration-200 ${
                isDaySelected(day)
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 border border-purple-300/30 text-white hover:bg-white/20'
              } ${(!editing || disabled) ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderShiftTimingsField = (label, name, disabled = false, icon = null, fullWidth = true) => {
    // Get nested value for shift timings
    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current && current[key], obj);
    };

    const currentValue = getValue(formData, name) || '';
    
    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        <div className="px-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-white font-medium backdrop-blur-sm min-h-[52px] flex items-center">
          {currentValue || 'Not specified'}
        </div>
      </div>
    );
  };

  const renderOfferLetterField = (label, name, disabled = false, icon = null, fullWidth = true) => {
    const currentValue = formData[name] || '';
    const hasOfferLetter = currentValue && currentValue !== 'Not specified';
    
    return (
      <div className={`mb-4 ${!fullWidth ? 'md:w-1/2' : ''}`}>
        <label className="block text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
          {icon && <span className="text-purple-300">{icon}</span>}
          {label}
        </label>
        <div className="flex items-center gap-3">
          {hasOfferLetter ? (
            <button
              onClick={handleViewOfferLetter}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>
          ) : (
            <div className="w-full">
              <div className="px-4 py-3 bg-white/5 border border-purple-300/20 rounded-xl text-purple-300 font-medium backdrop-blur-sm">
                No offer letter generated
              </div>
              <div className="mt-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <p className="text-xs text-yellow-200 font-medium">
                  💡 Note: Please ask admin to generate your offer letter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectionCard = (title, icon, children) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg">
          {icon}
        </div>
        <div>
          <div className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">{title}</div>
          <div className="text-sm text-purple-100/80 mt-1">Manage your {title.toLowerCase()} details</div>
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 max-w-full overflow-x-hidden">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 max-w-7xl mx-auto">
        {/* Left Column - Profile Image & Basic Info */}
        <div className="lg:col-span-4">
          {/* Profile Image Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300 mb-6 relative">
            {/* Edit Icon - Top Right */}
            {!editing && (
              <button
                onClick={handleEdit}
                className="absolute top-4 right-4 bg-gradient-to-br from-pink-500 to-purple-500 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all duration-200"
              >
                <EditIcon className="text-white text-lg" />
              </button>
            )}
            
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300/30 shadow-xl">
                  {profileImagePreview || formData.profileImage ? (
                    <img
                      src={profileImagePreview || formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <PersonIcon className="text-white text-4xl" />
                    </div>
                  )}
                </div>

                {/* Camera Icon for Image Upload */}
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-gradient-to-br from-pink-500 to-purple-500 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all duration-200">
                    <CameraIcon className="text-white text-lg" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  {formData.firstName} {formData.middleName} {formData.lastName}
                </h1>
                <p className="text-lg text-purple-200 flex items-center justify-center gap-2 text-center break-words">
                  <EmailIcon className="text-purple-200 flex-shrink-0" />
                  <span className="break-all">{formData.email}</span>
                </p>
                {formData.phone && (
                  <p className="text-purple-300 flex items-center justify-center gap-2">
                    <PhoneIcon className="text-purple-300" />
                    {formData.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Organization Details Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg">
                <BusinessIcon className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Organization Details</h2>
                <p className="text-purple-200 text-sm">Your current organization information</p>
              </div>
            </div>
            <div className="space-y-4">
              {renderFormField('Organization Name', 'organizationName', 'text', '', true, <BusinessIcon />)}
              {renderFormField('Place of Work', 'placeOfWork', 'text', '', true, <LocationIcon />)}
              {renderFormField('Stipend', 'stipend', 'text', '', true, <PaymentIcon />)}
              {renderShiftTimingsField('Shift Timings', 'shiftTimings.default', true, <CalendarIcon />)}
              {renderFormField('HR Name', 'hrName', 'text', 'Enter HR name', false, <PersonIcon />)}
              {renderWorkingDaysField('Working Days', 'workingDays', false, <CalendarIcon />)}
              {renderOfferLetterField('Offer Letter', 'offerLetter', true, <DescriptionIcon />)}
            </div>
          </div>

          {/* Course Payment & Registration Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                <PaymentIcon className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Course Payment & Registration</h2>
                <p className="text-purple-200 text-sm">Your course and payment details</p>
              </div>
            </div>
            <div className="space-y-4">
              {renderFormField('Course Amount', 'amount.courseAmount', 'text', '', true, <PaymentIcon />)}
              {renderFormField('Discount', 'amount.discount', 'text', '', true, <PaymentIcon />)}
              {renderFormField('Final Amount', 'amount.finalAmount', 'text', '', true, <PaymentIcon />)}
              {renderFormField('Total Paid', 'amount.totalPaid', 'text', '', true, <PaymentIcon />)}
              {renderFormField('Balance Amount', 'amount.balanceAmount', 'text', '', true, <PaymentIcon />)}
              
              {/* Installments Button */}
              {formData.amount && formData.amount.installments && formData.amount.installments.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={handleViewInstallments}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>View Installments ({formData.amount.installments.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-8">
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg">
                  <PersonIcon className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Personal Information</h2>
                  <p className="text-purple-200 text-sm">Your basic personal details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelectField('Title', 'title', ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'], false, <BadgeIcon />)}
                {renderFormField('First Name', 'firstName', 'text', 'Enter your first name', false, <PersonIcon />)}
                {renderFormField('Middle Name', 'middleName', 'text', 'Enter your middle name', false, <PersonIcon />)}
                {renderFormField('Last Name', 'lastName', 'text', 'Enter your last name', false, <PersonIcon />)}
                {renderFormField('Email', 'email', 'email', 'Enter your email address', false, <EmailIcon />)}
                {renderFormField('Phone', 'phone', 'tel', 'Enter your phone number', false, <PhoneIcon />)}
                {renderFormField('Employee Address', 'employeeAddress', 'text', 'Enter your address', false, <LocationIcon />)}
                {renderFormField('Resume', 'resume', 'text', 'Enter resume URL', false, <DescriptionIcon />)}
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
                  <SchoolIcon className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Academic Information</h2>
                  <p className="text-purple-200 text-sm">Your educational background</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField('College Name', 'collegeName', 'text', 'Enter your college name', false, <AccountBalanceIcon />)}
                {renderSelectField('Department', 'department', departmentOptions, false, <SchoolIcon />)}
                {renderSelectField('University', 'university', universityList, false, <AccountBalanceIcon />)}
                {renderSelectField('Degree', 'degree', degreeOptions, false, <GradeIcon />)}
                {renderFormField('Specialization', 'specialization', 'text', 'Enter your specialization', false, <SchoolIcon />)}
                {renderFormField('CGPA', 'cgpa', 'text', 'Enter your CGPA', false, <GradeIcon />)}
                {renderSelectField('Current Year', 'currentYear', ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'], false, <CalendarIcon />)}
                {renderFormField('Year of Passing', 'yearOfPassing', 'text', 'Enter year of passing', false, <CalendarIcon />)}
                {renderSelectField('Is Graduated', 'isGraduated', ['Yes', 'No'], false, <SchoolIcon />)}
              </div>
            </div>

            {/* Work Experience Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-200/20 p-6 shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 shadow-lg">
                  <WorkIcon className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Work Experience</h2>
                  <p className="text-purple-200 text-sm">Your professional background</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderRadioField('Has Experience', 'hasExperience', false, <WorkOutlineIcon />)}
                {formData.hasExperience === true && (
                  <>
                    {renderFormField('Previous Company', 'previousCompany', 'text', 'Enter previous company name', false, <BusinessCenterIcon />)}
                    {renderFormField('Position', 'position', 'text', 'Enter your position', false, <WorkIcon />)}
                    {renderFormField('Years of Experience', 'yearsOfExperience', 'text', 'Enter years of experience', false, <WorkIcon />)}
                  </>
                )}
              </div>
            </div>

            {/* Save & Cancel Buttons - Below Work Experience Card */}
            {editing && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSave}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <SaveIcon />
                  )}
                  <span>{savingProfile ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <CancelIcon />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* View Offer Letter Modal */}
      {showViewModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn" style={{ zIndex: 999999 }}>
          <div className="relative w-full max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop" style={{ zIndex: 999999 }}>
            {/* Accent Header Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 px-6 pb-6 pt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Offer Letter</h3>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 mr-12"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-purple-200 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Your Offer Letter</p>
                      <p className="text-sm text-purple-300">View your generated offer letter</p>
                    </div>
                  </div>
                </div>
                
                {/* Offer Letter Display */}
                <div className="bg-white/5 rounded-xl border border-purple-300/20 overflow-hidden">
                  {offerLetterUrl ? (
                    <div className="w-full h-96 bg-white rounded-lg">
                      <iframe
                        src={offerLetterUrl}
                        className="w-full h-full border-0"
                        title="Offer Letter"
                        style={{ 
                          minHeight: '500px',
                          background: 'white'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-purple-300">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-semibold">Offer Letter Not Available</p>
                        <p className="text-sm">The offer letter could not be loaded.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Installments Modal */}
      {showInstallmentsModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-[3px] transition-opacity duration-300 animate-fadeIn" style={{ zIndex: 999999 }}>
          <div className="relative w-full max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#1e1b4b]/95 to-[#0f0a1a]/98 rounded-3xl shadow-2xl border border-indigo-400/30 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide animate-modalPop" style={{ zIndex: 999999 }}>
            {/* Accent Header Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-3xl mb-2" />
            
            {/* Close Button */}
            <button
              onClick={() => setShowInstallmentsModal(false)}
              className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-2 shadow-lg backdrop-blur-md hover:bg-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 px-6 pb-6 pt-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Payment Installments</h3>
                    <p className="text-purple-200 text-sm">Your payment history and installment details</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Final Amount</p>
                      <p className="text-white text-lg font-bold">₹{formData.amount?.finalAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-200 text-sm font-medium">Total Paid</p>
                      <p className="text-white text-lg font-bold">₹{formData.amount?.totalPaid?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Balance</p>
                      <p className="text-white text-lg font-bold">₹{formData.amount?.balanceAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Installments List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">Installment History</h4>
                <div className="space-y-3">
                  {formData.amount?.installments?.map((installment, index) => (
                    <div key={installment._id} className="bg-white/5 border border-purple-300/20 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-white font-semibold">{installment.description}</h5>
                              <p className="text-purple-200 text-sm">Reference: {installment.referenceId}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-purple-300 text-sm">Amount Paid</p>
                              <p className="text-green-400 font-bold text-lg">₹{installment.amountPaid?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-purple-300 text-sm">Payment Date</p>
                              <p className="text-white font-medium">
                                {new Date(installment.dateOfPayment).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {installment.paymentSnapshot && (
                            <div className="mt-3">
                              <button
                                onClick={() => window.open(installment.paymentSnapshot, '_blank')}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Payment Proof
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Profile; 