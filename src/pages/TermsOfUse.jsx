import React from 'react';
import {
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Copyright as CopyrightIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  Support as SupportIcon,
  Policy as PolicyIcon,
  ContactSupport as ContactSupportIcon,
  Update as UpdateIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  TrackChanges as TrackChangesIcon,
  Public as PublicIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  NotInterested as NotInterestedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignavoxLogo from '../assets/snignavox_icon.png';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TermsOfUse = () => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const termsContent = {
    title: "Terms of Use",
    lastUpdated: "December 15, 2024",
    introduction: "These Terms of Use govern your use of Signavox Career Ladder, operated by SIGNAVOX TECHNOLOGIES PVT LTD (collectively referred to as \"Signavox Career Ladder,\" \"the Company,\" \"we,\" \"us,\" or \"our\"). By accessing and using our platform, you agree to be bound by these terms. Please read them carefully before using our services.",
    
    mainSections: [
      {
        title: "Acceptance of Terms",
        icon: <CheckCircleIcon className="text-green-400" />,
        color: "from-green-500/20 to-green-600/20",
        borderColor: "border-green-400/30",
        content: [
          "By accessing and using our platform, you agree to be bound by these Terms of Use",
          "You must be at least 18 years old to use our services, or have parental/guardian consent",
          "You are responsible for maintaining the confidentiality of your account credentials",
          "You agree to provide accurate and complete information when registering",
          "Your continued use of the platform constitutes acceptance of any updated terms"
        ]
      },
      {
        title: "Service Description",
        icon: <SchoolIcon className="text-blue-400" />,
        color: "from-blue-500/20 to-blue-600/20",
        borderColor: "border-blue-400/30",
        content: [
          "Signavox Career Ladder provides educational and professional development services",
          "Our platform includes online courses, assessments, career guidance, and networking opportunities",
          "We offer both free and paid services, with clear pricing and payment terms",
          "Services may include live sessions, recorded content, and interactive features",
          "We reserve the right to modify, suspend, or discontinue any service with notice"
        ]
      },
      {
        title: "User Registration & Accounts",
        icon: <PersonIcon className="text-purple-400" />,
        color: "from-purple-500/20 to-purple-600/20",
        borderColor: "border-purple-400/30",
        content: [
          "You must register with valid information to access certain features",
          "You are responsible for all activities under your account",
          "You must not share your account credentials with others",
          "You must notify us immediately of any unauthorized use of your account",
          "We may require verification of your identity for security purposes"
        ]
      },
      {
        title: "User Conduct & Responsibilities",
        icon: <VerifiedUserIcon className="text-orange-400" />,
        color: "from-orange-500/20 to-orange-600/20",
        borderColor: "border-orange-400/30",
        content: [
          "You agree to use the platform in a respectful and professional manner",
          "You must not upload or transmit harmful, inappropriate, or illegal content",
          "You must respect intellectual property rights and not infringe on others' work",
          "You must not attempt to gain unauthorized access to our systems",
          "You must comply with all applicable laws and regulations"
        ]
      },
      {
        title: "Prohibited Activities",
        icon: <BlockIcon className="text-red-400" />,
        color: "from-red-500/20 to-red-600/20",
        borderColor: "border-red-400/30",
        content: [
          "Creating multiple accounts or impersonating others",
          "Attempting to gain unauthorized access to our systems or other users' accounts",
          "Using automated tools to scrape or collect data without permission",
          "Engaging in any form of harassment, discrimination, or bullying",
          "Sharing confidential or proprietary information without authorization"
        ]
      },
      {
        title: "Intellectual Property Rights",
        icon: <CopyrightIcon className="text-pink-400" />,
        color: "from-pink-500/20 to-pink-600/20",
        borderColor: "border-pink-400/30",
        content: [
          "All content on our platform is protected by copyright and other intellectual property laws",
          "You retain ownership of content you create and submit to our platform",
          "You grant us a license to use your content for platform purposes",
          "You may not reproduce or distribute our content without written permission",
          "Trademarks and logos are the property of their respective owners"
        ]
      }
    ],

    detailedSections: [
      {
        title: "Payment Terms & Refunds",
        icon: <PaymentIcon className="text-green-400" />,
        content: [
          "Payment is required for access to premium services and courses",
          "All fees are non-refundable unless otherwise specified in our refund policy",
          "We reserve the right to change pricing with 30 days' notice",
          "Payment processing is handled by secure third-party providers",
          "Failed payments may result in suspension of service access",
          "Refunds may be provided at our discretion for technical issues or service failures"
        ]
      },
      {
        title: "Privacy & Data Protection",
        icon: <LockIcon className="text-blue-400" />,
        content: [
          "Your privacy is important to us. Please review our Privacy Policy for details",
          "We collect and process personal data in accordance with applicable laws",
          "You consent to our collection and use of your data as described in our Privacy Policy",
          "We implement appropriate security measures to protect your information",
          "You have rights regarding your personal data as outlined in our Privacy Policy",
          "We may share your information with third parties as described in our Privacy Policy"
        ]
      },
      {
        title: "Service Availability & Limitations",
        icon: <SpeedIcon className="text-purple-400" />,
        content: [
          "We strive to provide reliable service but cannot guarantee uninterrupted access",
          "Our platform may be temporarily unavailable due to maintenance or technical issues",
          "We are not responsible for delays or failures due to circumstances beyond our control",
          "Service availability may vary by geographic location",
          "We may limit access to certain features based on your subscription level",
          "We reserve the right to modify or discontinue services with reasonable notice"
        ]
      },
      {
        title: "User-Generated Content",
        icon: <AssignmentIcon className="text-orange-400" />,
        content: [
          "You may submit content to our platform, including comments, reviews, and assignments",
          "You represent that you have the right to share such content",
          "We may review, edit, or remove content that violates our terms",
          "You grant us a worldwide, non-exclusive license to use your content",
          "We are not responsible for the accuracy or reliability of user-generated content",
          "You may not submit content that infringes on others' rights or is inappropriate"
        ]
      },
      {
        title: "Third-Party Services & Links",
        icon: <PublicIcon className="text-pink-400" />,
        content: [
          "Our platform may contain links to third-party websites and services",
          "We do not endorse or control third-party content or services",
          "Your use of third-party services is subject to their respective terms",
          "We are not responsible for third-party content, privacy practices, or security",
          "Third-party services may collect and process your data independently",
          "We recommend reviewing third-party terms and privacy policies before use"
        ]
      },
      {
        title: "Termination & Account Suspension",
        icon: <CancelIcon className="text-red-400" />,
        content: [
          "We may terminate or suspend your account for violations of these terms",
          "You may terminate your account at any time by contacting us",
          "Termination does not relieve you of obligations under these terms",
          "We may retain certain information as required by law or for legitimate business purposes",
          "Upon termination, your access to paid services will cease immediately",
          "We may delete your account data in accordance with our data retention policy"
        ]
      },
      {
        title: "Disclaimers & Limitations of Liability",
        icon: <WarningIcon className="text-yellow-400" />,
        content: [
          "Our services are provided \"as is\" without warranties of any kind",
          "We do not guarantee the accuracy, completeness, or usefulness of any information",
          "We are not liable for any indirect, incidental, or consequential damages",
          "Our total liability is limited to the amount you paid for our services",
          "We do not guarantee employment or career outcomes from using our platform",
          "You use our services at your own risk and discretion"
        ]
      },
      {
        title: "Governing Law & Dispute Resolution",
        icon: <GavelIcon className="text-indigo-400" />,
        content: [
          "These terms are governed by the laws of the jurisdiction where we operate",
          "Any disputes will be resolved through binding arbitration in accordance with our procedures",
          "You agree to waive any right to a jury trial or class action lawsuit",
          "Small claims court actions are not subject to mandatory arbitration",
          "You may opt out of arbitration within 30 days of accepting these terms",
          "The prevailing party may recover reasonable attorney fees and costs"
        ]
      },
      {
        title: "Changes to Terms",
        icon: <UpdateIcon className="text-teal-400" />,
        content: [
          "We may update these terms from time to time to reflect changes in our services",
          "Material changes will be communicated to you via email or platform notification",
          "Your continued use after changes constitutes acceptance of the new terms",
          "If you disagree with changes, you may terminate your account",
          "We will provide at least 30 days' notice for material changes",
          "The date at the top indicates when these terms were last updated"
        ]
      }
    ],

    userRights: [
      {
        icon: <CheckCircleIcon className="text-green-400" />,
        title: "Your Rights",
        description: "What you can expect from our platform",
        color: "from-green-500/20 to-green-600/20",
        borderColor: "border-green-400/30",
        rights: [
          "Access to educational content and resources as described",
          "Professional development opportunities and career guidance",
          "Secure and private account management",
          "Support and assistance when needed",
          "Clear information about our services and pricing",
          "Ability to cancel your account at any time"
        ]
      },
      {
        icon: <WarningIcon className="text-yellow-400" />,
        title: "Your Responsibilities",
        description: "What we expect from you as a user",
        color: "from-yellow-500/20 to-yellow-600/20",
        borderColor: "border-yellow-400/30",
        responsibilities: [
          "Maintaining accurate account information",
          "Following platform guidelines and policies",
          "Respecting other users and their privacy",
          "Reporting any issues or violations",
          "Paying for services as agreed",
          "Not sharing account credentials with others"
        ]
      }
    ],

    contactInfo: {
      title: "Contact Us",
      description: "If you have any questions about these Terms of Use, please contact us.",
      email: "support.scl@signavoxtechnologies.com",
      phone: "+1 (555) 123-4567",
      address: "SIGNAVOX TECHNOLOGIES PVT LTD"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#311188] to-[#0A081E] text-white relative overflow-hidden overflow-x-hidden">
      {/* Animated, Large, Low-Opacity Logo Background for Dashboard */}
      <img
        src={SignavoxLogo}
        alt="Signavox Logo Watermark"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 hidden md:block animate-dashboard-logo-float"
        style={{
          width: '55vw',
          maxWidth: 600,
          minWidth: 300,
          opacity: 0.07,
          filter: 'drop-shadow(0 0 80px #a78bfa) drop-shadow(0 0 32px #f472b6)',
        }}
        draggable={false}
      />
      
      {/* Watermark icon - Right side */}
      <div className="fixed right-8 top-24 opacity-10 select-none pointer-events-none hidden md:block animate-fade-in z-0">
        <img
          src={SignavoxLogo}
          alt="Signavox Logo"
          className="w-[32rem] h-[32rem] object-contain mx-auto"
          style={{}}
          draggable={false}
        />
      </div>
      
      {/* Header */}
      <div className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:pt-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm hover:scale-110 shadow-lg"
            >
              <ArrowBackIcon className="text-lg sm:text-xl" />
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              {termsContent.title}
            </h1>
          </div>
          
          <div className="pl-16 sm:pl-20">
            <p className="text-purple-200 text-base sm:text-lg lg:text-xl leading-relaxed mb-0">
              {termsContent.introduction}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-2 relative z-10">
        {/* Accordion Container */}
        <Box sx={{ 
          '& .MuiAccordion-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            marginBottom: '16px',
            '&:before': { display: 'none' },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.01)',
              transition: 'all 0.3s ease',
            },
          },
          '& .MuiAccordionSummary-root': {
            background: 'transparent',
            borderRadius: '16px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
          },
          '& .MuiAccordionDetails-root': {
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0 0 16px 16px',
          },
        }}>
          
          {/* Acceptance of Terms */}
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircleIcon sx={{ color: '#34d399' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Acceptance of Terms
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[0].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#a78bfa',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Service Description */}
          <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SchoolIcon sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Service Description
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[1].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#60a5fa',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* User Registration & Accounts */}
          <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PersonIcon sx={{ color: '#a78bfa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  User Registration & Accounts
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[2].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#a78bfa',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* User Conduct & Responsibilities */}
          <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <VerifiedUserIcon sx={{ color: '#fb923c' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  User Conduct & Responsibilities
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[3].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#fb923c',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Prohibited Activities */}
          <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <BlockIcon sx={{ color: '#ef4444' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Prohibited Activities
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[4].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Intellectual Property Rights */}
          <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CopyrightIcon sx={{ color: '#ec4899' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Intellectual Property Rights
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.mainSections[5].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#ec4899',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Payment Terms & Refunds */}
          <Accordion expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PaymentIcon sx={{ color: '#34d399' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Payment Terms & Refunds
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[0].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#34d399',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Privacy & Data Protection */}
          <Accordion expanded={expanded === 'panel8'} onChange={handleChange('panel8')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <LockIcon sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Privacy & Data Protection
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[1].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#60a5fa',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Service Availability & Limitations */}
          <Accordion expanded={expanded === 'panel9'} onChange={handleChange('panel9')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SpeedIcon sx={{ color: '#a78bfa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Service Availability & Limitations
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[2].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#a78bfa',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* User-Generated Content */}
          <Accordion expanded={expanded === 'panel10'} onChange={handleChange('panel10')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AssignmentIcon sx={{ color: '#fb923c' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  User-Generated Content
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[3].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#fb923c',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Third-Party Services & Links */}
          <Accordion expanded={expanded === 'panel11'} onChange={handleChange('panel11')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PublicIcon sx={{ color: '#ec4899' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Third-Party Services & Links
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[4].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#ec4899',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Termination & Account Suspension */}
          <Accordion expanded={expanded === 'panel12'} onChange={handleChange('panel12')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CancelIcon sx={{ color: '#ef4444' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Termination & Account Suspension
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[5].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Disclaimers & Limitations of Liability */}
          <Accordion expanded={expanded === 'panel13'} onChange={handleChange('panel13')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <WarningIcon sx={{ color: '#eab308' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Disclaimers & Limitations of Liability
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[6].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#eab308',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Governing Law & Dispute Resolution */}
          <Accordion expanded={expanded === 'panel14'} onChange={handleChange('panel14')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <GavelIcon sx={{ color: '#6366f1' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Governing Law & Dispute Resolution
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[7].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#6366f1',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Changes to Terms */}
          <Accordion expanded={expanded === 'panel15'} onChange={handleChange('panel15')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ color: 'white' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UpdateIcon sx={{ color: '#14b8a6' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Changes to Terms
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {termsContent.detailedSections[8].content.map((item, itemIndex) => (
                    <Typography component="li" key={itemIndex} sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      '&::before': {
                        content: '"•"',
                        color: '#14b8a6',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginTop: '2px'
                      }
                    }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 4 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transform: 'scale(1.01)',
              transition: 'all 0.3s ease',
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ContactSupportIcon sx={{ color: '#22c55e', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {termsContent.contactInfo.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e9d5ff' }}>
                    {termsContent.contactInfo.description}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '16px',
                    minHeight: '120px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.15) 100%)',
                      transform: 'scale(1.02)',
                      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease',
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 197, 253, 0.3) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        }}>
                          <InfoIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          Email
                        </Typography>
                      </Box>
                      <Typography 
                        component="a" 
                        href={`mailto:${termsContent.contactInfo.email}`}
                        sx={{ 
                          color: '#93c5fd', 
                          textDecoration: 'none',
                          fontSize: '16px',
                          fontWeight: 'medium',
                          display: 'block',
                          '&:hover': {
                            color: '#60a5fa',
                            transition: 'color 0.3s ease',
                          }
                        }}
                      >
                  {termsContent.contactInfo.email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '16px',
                    minHeight: '120px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(196, 181, 253, 0.15) 100%)',
                      transform: 'scale(1.02)',
                      boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.3)',
                      transition: 'all 0.3s ease',
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(196, 181, 253, 0.3) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                        }}>
                          <PolicyIcon sx={{ color: '#a855f7', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          Company
                        </Typography>
                      </Box>
                      <Typography sx={{ 
                        color: '#e9d5ff', 
                        fontSize: '16px',
                        fontWeight: 'medium',
                        display: 'block'
                      }}>
                  {termsContent.contactInfo.address}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes dashboard-logo-float {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -52%) scale(1.04) rotate(2deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
        .animate-dashboard-logo-float {
          animation: dashboard-logo-float 16s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.1; }
        }
        .animate-fade-in {
          animation: fade-in 2s ease-in;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px #f472b6) drop-shadow(0 0 16px #a78bfa);
        }
      `}</style>
    </div>
  );
};

export default TermsOfUse; 