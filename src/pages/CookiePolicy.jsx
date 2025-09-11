import React from 'react';
import {
  Cookie as CookieIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  Policy as PolicyIcon,
  ContactSupport as ContactSupportIcon,
  Web as WebIcon,
  Share as ShareIcon,
  Campaign as CampaignIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  TrackChanges as TrackChangesIcon,
  Public as PublicIcon,
  Update as UpdateIcon,
  ExpandMore as ExpandMoreIcon,
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

const CookiePolicy = () => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Cookie Policy Content - Exact content from Cookie Policy.docx
  const cookiePolicyContent = {
    title: "Cookie Policy",
    lastUpdated: "December 15, 2024",
    introduction: "This Cookie Policy explains how Signavox Career Ladder, operated by SIGNAVOX TECHNOLOGIES PVT LTD (collectively referred to as \"Signavox Career Ladder,\" \"the Company,\" \"we,\" \"us,\" or \"our\"), uses cookies and similar technologies to recognize you (\"User\" or \"you\") when you visit any of our websites.",
    
    cookieTypes: [
      {
        title: "Essential Website Cookies",
        icon: <ShieldIcon className="text-red-400" />,
        color: "from-red-500/20 to-red-600/20",
        borderColor: "border-red-400/30",
        description: "These cookies are strictly necessary to provide you with services available through our website and to use some of its features.",
        details: "For example, they allow us to maintain secure login sessions. If you choose to refuse these cookies, then you may still use our website through your access to some functionality and areas of our website may be restricted."
      },
      {
        title: "Performance & Functionality Cookies",
        icon: <SpeedIcon className="text-blue-400" />,
        color: "from-blue-500/20 to-blue-600/20",
        borderColor: "border-blue-400/30",
        description: "These cookies are used to enhance the performance and functionality of our website but are non-essential to its use.",
        details: "For example, interaction with blogs, chat rooms and forums and to enable us to differentiate between customers and guest visitors for the purposes of determining the level of permitted use of certain tools made available via the website."
      },
      {
        title: "Analytics & Customization Cookies",
        icon: <AnalyticsIcon className="text-purple-400" />,
        color: "from-purple-500/20 to-purple-600/20",
        borderColor: "border-purple-400/30",
        description: "These cookies collect information that is used either in aggregate form to help us understand how our website is being used.",
        details: "They help us understand how effective our marketing campaigns are, or to help us customize our website for you."
      },
      {
        title: "Targeting/Advertising Cookies",
        icon: <TrackChangesIcon className="text-pink-400" />,
        color: "from-pink-500/20 to-pink-600/20",
        borderColor: "border-pink-400/30",
        description: "These cookies are used to make advertising messages more relevant to you and your interests and track advertising impressions.",
        details: "They perform functions like preventing the same ad from continuously appearing, ensuring that ads are properly displayed for advertisers, helping measure the effectiveness of advertising campaigns and, in some cases, selecting advertisements that are based on your interests."
      },
      {
        title: "Social Networking Cookies",
        icon: <PublicIcon className="text-green-400" />,
        color: "from-green-500/20 to-green-600/20",
        borderColor: "border-green-400/30",
        description: "These cookies are used to enable you to share pages and content that you find interesting on our website through third-party social networking.",
        details: "These cookies may also be used for advertising and analytics purposes. When you share an article using a social media sharing button on our website (e.g. Facebook, LinkedIn, or Twitter), the social network that has created the button will record that you have done this."
      }
    ],
    
    sections: [
      {
        title: "Policy Summary",
        icon: <PolicyIcon className="text-blue-400" />,
        content: [
          "This Cookie Policy explains how Signavox Career Ladder, operated by SIGNAVOX TECHNOLOGIES PVT LTD (collectively referred to as \"Signavox Career Ladder,\" \"the Company,\" \"we,\" \"us,\" or \"our\"), uses cookies and similar technologies to recognize you (\"User\" or \"you\") when you visit any of our websites."
        ]
      },
      {
        title: "What are cookies?",
        icon: <CookieIcon className="text-green-400" />,
        content: [
          "Cookies are small data files that are placed on your device when you visit a website. Cookies are widely used by website owners to make their websites work, or work more efficiently, as well as to provide reporting information.",
          "Cookies set by the website owner (in this case, SIGNAVOX TECHNOLOGIES PVT LTD are called \"first-party cookies.\" Cookies set by parties other than the website owner are called \"third-party cookies.\" Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., such as advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your device both when it visits the website in question and when it visits certain websites."
        ]
      },
      {
        title: "Why does Signavox technologies use cookies?",
        icon: <AnalyticsIcon className="text-purple-400" />,
        content: [
          "We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons for our websites to operate, and we refer to these as \"essential\" or \"strictly necessary\" cookies. Other cookies also enable us to track and target the interests of our visitors to enhance the experience on our website. Third parties place cookies on our website and are used for advertising, analytics and other purposes. This is described in more detail below."
        ]
      },
      {
        title: "What about other tracking technologies, like web beacons?",
        icon: <WebIcon className="text-orange-400" />,
        content: [
          "Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time like web beacons (sometimes called \"tracking pixels\" or \"clear gifs\"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our website. This allows us, for example, to monitor the traffic patterns of visitors from one page within our website to another, to deliver or communicate with cookies, to understand whether you have come to our website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of outbound marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning."
        ]
      },
      {
        title: "Does Signavox allow targeted advertising?",
        icon: <CampaignIcon className="text-red-400" />,
        content: [
          "Third parties may place cookies on your computer or mobile device to serve advertising through our website. These companies may use information about your visits to this and other websites to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. This can be accomplished by third parties using cookies or web beacons to collect information about your visits to this and other sites to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or such third parties to identify your name, contact details or other personally identifying details unless you choose to provide these (except that, as outlined above, we may combine certain information about your use of the website with personal information that you provide to us in online forms in order to contact you about products or services in which you may be interested)."
        ]
      },
      {
        title: "How often will Signavox update this cookie policy?",
        icon: <UpdateIcon className="text-yellow-400" />,
        content: [
          "We may update this Cookie Policy from time to time to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. The date at the top of this Cookie Policy indicates when it was last updated. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies."
        ]
      },
      {
        title: "Where can I get further information?",
        icon: <InfoIcon className="text-blue-400" />,
        content: [
          "If you have any questions about our use of cookies or other technologies, then please email us.",
          "In all cases, you can change your browser settings to refuse these cookies. Please visit browser's help menu."
        ]
      },
      {
        title: "How can I control cookies?",
        icon: <CheckCircleIcon className="text-green-400" />,
        content: [
          "You have the right to decide whether to refuse cookies. If you choose to refuse cookies, you may still use our website although your access to some functionality and areas of our website may be restricted.",
          "You can set or amend your web browser controls to accept or refuse cookies. As how you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information. In addition, if you would like to find out more information about how to amend your web browser controls to accept or refuse cookies, then please visit cookie.org."
        ]
      }
    ],
    
    contactInfo: {
      title: "Contact Us",
      description: "If you have any questions about our use of cookies or other technologies, then please email us.",
      email: "support.scl@signavoxtechnologies.com",
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
              {cookiePolicyContent.title}
            </h1>
          </div>
          
          <div className="pl-16 sm:pl-20">
            <p className="text-purple-200 text-base sm:text-lg lg:text-xl leading-relaxed mb-0">
              {cookiePolicyContent.introduction}
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

        {/* Cookie Types Section */}
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
                  <CookieIcon sx={{ color: '#ef4444' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Types of Cookies We Use
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Typography variant="body2" sx={{ mb: 3, color: '#e9d5ff' }}>
              We use different types of cookies to enhance your experience and provide essential functionality
                </Typography>
                <Grid container spacing={3}>
            {cookiePolicyContent.cookieTypes.map((type, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.02)',
                          transition: 'all 0.3s ease',
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                    {type.icon}
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                              {type.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#e9d5ff', mb: 2, fontSize: '0.875rem' }}>
                  {type.description}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#c4b5fd', fontSize: '0.8rem' }}>
                  {type.details}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Policy Summary */}
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
                  <PolicyIcon sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Policy Summary
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[0].content.map((item, itemIndex) => (
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

          {/* What are cookies? */}
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
                  <CookieIcon sx={{ color: '#34d399' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  What are cookies?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[1].content.map((item, itemIndex) => (
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

          {/* Why does Signavox technologies use cookies? */}
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
                  <AnalyticsIcon sx={{ color: '#a78bfa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Why does Signavox technologies use cookies?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[2].content.map((item, itemIndex) => (
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

          {/* What about other tracking technologies, like web beacons? */}
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
                  <WebIcon sx={{ color: '#fb923c' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  What about other tracking technologies, like web beacons?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[3].content.map((item, itemIndex) => (
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

          {/* Does Signavox allow targeted advertising? */}
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
                  <CampaignIcon sx={{ color: '#ef4444' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Does Signavox allow targeted advertising?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[4].content.map((item, itemIndex) => (
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

          {/* How often will Signavox update this cookie policy? */}
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
                  <UpdateIcon sx={{ color: '#eab308' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  How often will Signavox update this cookie policy?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[5].content.map((item, itemIndex) => (
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

          {/* Where can I get further information? */}
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
                  <InfoIcon sx={{ color: '#60a5fa' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Where can I get further information?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[6].content.map((item, itemIndex) => (
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

          {/* How can I control cookies? */}
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
                  <CheckCircleIcon sx={{ color: '#34d399' }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  How can I control cookies?
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ color: '#e9d5ff', lineHeight: 1.7 }}>
                <Box component="ul" sx={{ pl: 3, spaceY: 2 }}>
                  {cookiePolicyContent.sections[7].content.map((item, itemIndex) => (
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
                    {cookiePolicyContent.contactInfo.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e9d5ff' }}>
                    {cookiePolicyContent.contactInfo.description}
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
                        href={`mailto:${cookiePolicyContent.contactInfo.email}`}
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
                  {cookiePolicyContent.contactInfo.email}
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
                  {cookiePolicyContent.contactInfo.address}
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

export default CookiePolicy; 
