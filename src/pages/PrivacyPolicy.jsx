import React from 'react';
import {
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ContactSupport as ContactSupportIcon,
  Policy as PolicyIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Share as ShareIcon,
  Timeline as TimelineIcon,
  Campaign as CampaignIcon,
  Shield as ShieldIcon,
  TransferWithinAStation as TransferIcon,
  Gavel as GavelIcon,
  ChildCare as ChildCareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignavoxLogo from '../assets/snignavox_icon.png';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#311188] to-[#0A081E] text-white relative overflow-hidden overflow-x-hidden">
             {/* Animated Logo Background */}
       <img
         src={SignavoxLogo}
         alt="Signavox Logo Watermark"
         className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 animate-dashboard-logo-float"
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
              Privacy Policy
            </h1>
          </div>
          
          <div className="pl-16 sm:pl-20">
            <p className="text-purple-200 text-base sm:text-lg lg:text-xl leading-relaxed mb-0">
               Welcome, and thank you for your interest in Signavox Career Ladder Privacy Policy by "Signavox technologies Private Limited" (referred to as "Signavox Career Ladder", "Company", "we", "us" or "our" in this privacy policy)."our" in this privacy policy). 
This privacy notice will tell you about what we collect and do with your personal information when you visit our company website or interact with us for various services or fill your personal information to contact us or want to access our services where we process your personal information. 
The Notice also summarizes how we will store and handle that data along with the precautions we take to protect it. 

             </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-2 relative z-10">
        {/* Introduction */}
        {/* <div className="mb-8 px-4">
          <div className="space-y-4">
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              This privacy notice will tell you about what we collect and do with your personal information when you visit our company website or interact with us for various services or fill your personal information to contact us or want to access our services where we process your personal information.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              The Notice also summarizes how we will store and handle that data along with the precautions we take to protect it.
            </p>
          </div>
        </div> */}

        {/* Privacy Notice Objective */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <PolicyIcon className="text-blue-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Privacy Notice Objective</h3>
          </div>
          <div className="space-y-4">
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              This Notice applies to personal data collected through your use of any websites managed by Signavox technologies Private Limited and any services provided by us (downloadable software, games, mobile applications including tablet applications), and through your interaction with our activities on other platforms such as Facebook, Twitter or any such similar platforms on which a link to this Notice is displayed, and through all other communications between you and the company, through written or oral means, such as email or phone (all the above modes collectively termed as our "Service" in this Notice).
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              It is important that you read this Notice together with the additional privacy terms or agreements policies of specific programs, campaigns or promotions conducted or organized by us. We encourage you to read these additional terms or policies or agreements before participating in any such programs, campaigns or promotions as you will be required to comply with them if you participate. This Notice supplements the other agreements you have entered with the Company and is not intended to override them unless specified in a particular jurisdiction.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              Our business is constantly evolving and so this Notice document may change from time to time. Please come back to this Notice documents document every now and then to make sure you are familiar with the latest version of the Notice. Any new Notice published for this Service will be applicable to you from the date you agree to the updated terms of the Notice through the Service. Your continued use of the Service after the revised Notice has become effective indicates that you have read, understood and agreed to the current version of the Notice.
            </p>
          </div>
        </div>

        {/* Definitions */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <InfoIcon className="text-green-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Definitions</h3>
          </div>
          <div className="space-y-4">
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              "Personal Data" means any information relating to an identified or identifiable natural living person. Refer to section on 'What Personal Data We Collect' for a more detailed description.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              "Data controller" determines the purposes and means of processing personal data.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              "Data processor" is responsible for processing personal data on behalf of the controller.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              "Website" collectively refers to all the websites managed by Signavox technologies Pvt Ltd.
            </p>
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              "User" means an individual, who primarily uses the website and/or Service for its intended purpose as outlined in the website's or service's Terms of Use. Where such users are also called Data Subjects, they must be an identified or identifiable natural living person
            </p>
          </div>
        </div>

        {/* Data Controller */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BusinessIcon className="text-purple-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Data Controller</h3>
          </div>
          <div className="space-y-4">
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              Signavox technologies Pvt Ltd is the data controller responsible for your personal data for the Service in context. If you have any questions about this privacy Notice, including any requests to exercise your legal rights, please contact us using the details below.
            </p>
          </div>
        </div>

        {/* Third-Party Links */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ShareIcon className="text-orange-400" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Third-Party Links</h3>
          </div>
          <div className="space-y-4">
            <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
              Our Service may contain links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy notice and data protection measures. When you leave our Service either through such links or otherwise, we encourage you to read the privacy notice of the websites you visit.
            </p>
          </div>
        </div>

        {/* What Personal Data We Collect */}
        <div className="mb-8 sm:mb-10">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What Personal Data We Collect</h2>
            <p className="text-purple-200 text-lg max-w-3xl mx-auto">
              We may collect, use, store, and transfer different kinds of personal data about you through the Service which we have grouped together as follows:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Identity Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PersonIcon className="text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Identity Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes your name (first name, middle name, and last name), username or similar identifier, title, and date of birth, college ID, gender, age, photograph.
              </p>
            </div>

            {/* Contact Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ContactSupportIcon className="text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Contact Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes your email address, telephone numbers, billing address, and current residence address proof (including geographic area such as city and country of residence).
              </p>
            </div>

            {/* Profile Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DataUsageIcon className="text-purple-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Profile Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes your interests, queries, communications between you and the company, preferences, job applicant information (such as resume, job title), occupation, current institution/organization name, education qualification, year of graduation, feedback, and survey responses, employment details (salaried or self-employed). Also, Includes your username and password, purchases or orders made by you, your interests, and preferences.
              </p>
            </div>

            {/* Marketing and Communications Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CampaignIcon className="text-pink-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Marketing and Communications Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes your preferences in receiving marketing communications from us and our third parties, and your communication preferences.
              </p>
            </div>

            {/* Usage Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TimelineIcon className="text-yellow-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Usage Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes information about how you use and interact with our Service (such as our websites, subscriptions, email communications, user requests, etc.)
              </p>
            </div>

            {/* Financial Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SecurityIcon className="text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Financial Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                If you decide to make a payment for any of our products and services, your Financial Data, which includes your bank account and payment card details, will be collected to provide the purchased services. We may also collect monthly income, bank statements of the last 3 or 6 months/payslips.
              </p>
            </div>

            {/* Transaction Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TransferIcon className="text-indigo-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Transaction Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes details about payments to and from you and other details of products and services you have purchased from us.
              </p>
            </div>

            {/* Technical Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TimelineIcon className="text-teal-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Technical Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes your IP address, date and time of the inquiry, time difference to Greenwich Mean Time (GMT), the content of the request (concrete page), access status/HTTP status code, amount of data transferred in each case, website that receives the request, browser, operating system and its interface, language, and browser software version.
              </p>
            </div>

            {/* Media Data */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DataUsageIcon className="text-cyan-400" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Media Data</h3>
              </div>
              <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                Includes photos, audios, videos, testimonials of the user given or collected with their consent, in connection with our business activities.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Detailed Information</h2>
            <p className="text-purple-200 text-lg max-w-3xl mx-auto">
              Learn more about our privacy practices and your rights
            </p>
          </div>
          
          {/* Ways In Which We Collect Your Personal Data */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DataUsageIcon className="text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Ways In Which We Collect Your Personal Data</h3>
            </div>
            <div className="space-y-4">
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                We may collect your personal data from a variety of sources. This includes:
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                1. User-provided Information - Personal data you give us directly. When you use the Service, as a User, you may provide, and we may collect Personal Data in the following scenarios:
              </p>
              <ul className="text-purple-200 leading-relaxed text-sm sm:text-base space-y-2 ml-6">
                <li>• When you subscribe to our newsletter or marketing communications, we may collect your email address, contact preferences, IP address, and location.</li>
                <li>• When you register or create an account using personal data to use our service.</li>
                <li>• When you apply for our various programs, events or business opportunities, through online or offline activities, we may collect your name, email address, phone number, contact preferences, IP address, location and other relevant questions such as role, education, support requested, preferred event location, etc. to validate the applications and requests.</li>
                <li>• When you send us customer service-related requests via email, help desk chat, social media channels, or help line phone numbers, we may request your email address and phone number to communicate the responses to your queries.</li>
                <li>• When you apply for a job or partnership with us, we may collect your name, email address, phone number, and resume to process your application.</li>
                <li>• When you enter a competition, promotion or survey, or contests offered by us, we may collect information relevant to your participation in such events.</li>
                <li>• When you take assessments on our platform, we may also request access to your device webcam and microphone for online proctoring, analysis and feedback.</li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Personal Data */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DataUsageIcon className="text-green-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">How We Use Your Personal Data</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-purple-200 leading-relaxed text-sm sm:text-base mb-4">
                  We will only use or process your personal data under the following lawful basis:
                </p>
                <ol className="text-purple-200 leading-relaxed text-sm sm:text-base space-y-2 ml-6">
                  <li>1. With your consent: We may process data upon your consent, asking for it as appropriate.</li>
                  <li>2. Performance of a contract with you: Where we need to perform the contract, we are about to enter into or have entered into with you.</li>
                  <li>3. Necessary for our legitimate interests: Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>4. Necessary to comply with a legal obligation: Where we need to comply with a legal or regulatory obligation.</li>
                </ol>
              </div>
              
              <div>
                <p className="text-purple-200 leading-relaxed text-sm sm:text-base mb-4">
                  We will be using your personal data for the below listed activities. Each activity is listed along with the type of personal data used for the activity and the lawful basis of processing that data.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To send communications to users who have subscribed or signed up for updates from us</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Contact, Marketing and Communications</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To engage & interact with users to process their applications registered for our programs and events</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent, Necessary for our legitimate interests (for reaching out to users who have expressed interest, for performing administrative tasks)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To engage with registered users with regards to the programs and events they have registered for including correspondence, online and live workshops</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact, Profile</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent, Performance of a contract with you</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To engage with users who have expressed interest regarding business opportunities</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact, Profile</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent, Performance of a contract with you, Necessary for our legitimate interests (evaluating the candidacy of the user, performing background checks)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To engage with users who have applied for job openings</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact, Profile</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent, Performance of a contract with you, Necessary for our legitimate interests (evaluating the candidacy of the user, performing background checks)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To manage our relationship with users which will include:</h4>
                    <ul className="text-purple-200 text-sm ml-4 mb-2">
                      <li>• (a) Notifying users about changes to our terms or privacy Notice</li>
                      <li>• (b) Asking users to leave a review or take a survey</li>
                      <li>• (c) Engaging with users who have initiated a support request</li>
                    </ul>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact, Profile</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Necessary to comply with a legal obligation, Necessary for our legitimate interests (for improving our service, troubleshooting issues faced by users of our service)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To use data analytics to improve our website, products/services, marketing, customer relationships and experiences</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Technical, Usage, Marketing and Communications</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Necessary for our legitimate interests (for improving our service, catering to specific interests of users, developing new products aligned to user requirements)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To administer and protect our business and Service (including troubleshooting, data analysis, testing, system maintenance, support, reporting and hosting of data)</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Identity, Contact, Technical, Usage</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Necessary for our legitimate interests (for running our business, provision of administration and IT services, network security, to prevent fraud and in the context of a business reorganisation or group restructuring exercise)</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Purpose/Activity: To provide the registered users an analysis and feedback of their assessment</h4>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Type of data:</span> Media Data</p>
                    <p className="text-purple-200 text-sm"><span className="font-medium">Lawful basis for processing:</span> Consent, Performance of a contract with you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldIcon className="text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Data Security</h3>
            </div>
            <div className="space-y-4">
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions, and they are subject to a duty of confidentiality.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so. We follow generally accepted industry standards to protect the information submitted to us, both during transmission and once we receive it. We maintain appropriate administrative, technical and physical safeguards to protect Personal Data against accidental or unlawful destruction, accidental loss, unauthorized alteration, unauthorized disclosure or access, misuse, and any other unlawful form of processing of the Personal Data in our possession. This includes, for example, firewalls, password protection and other access and authentication controls. We use SSL technology to encrypt data during transmission through the public internet, and we also employ application-layer security features to further anonymize Personal Data.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                However, no method of transmission over the Internet, or method of electronic storage, is 100% secure. We cannot ensure or warrant the security of any information you transmit to us or store on the Service, and you do so at your own risk. We also cannot guarantee that such information may not be accessed, disclosed, altered, or destroyed by breach of any of our physical, technical, or managerial safeguards. If you believe your Personal Data has been compromised, please contact us as set forth in the "Data Controller" section.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                If we learn of a security systems breach, we will inform you and the authorities of the occurrence of the breach in accordance with applicable law.
              </p>
            </div>
          </div>

          {/* Your Rights as a Data Subject */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GavelIcon className="text-orange-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Your Rights as a Data Subject</h3>
            </div>
            <div className="space-y-4">
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                Under certain circumstances, you have rights under the applicable data protection laws in relation to your personal data. We set out below a brief description of such rights:
              </p>
              <ul className="text-purple-200 leading-relaxed text-sm sm:text-base space-y-2 ml-6">
                <li>• Request access to your personal data (commonly known as a "data subject access request"): This enables you to receive a copy of the personal data we hold about you and to check that we are lawfully processing it.</li>
                <li>• Request correction of your personal data: This enables you to have any incomplete or inaccurate data we hold about you corrected, though we may need to verify the accuracy of the new data you provide to us.</li>
                <li>• Request erasure of your personal data: This enables you to ask us to delete or remove personal data where there is no good reason for us continuing to process it. You also have the right to ask us to delete or remove your personal data where you have successfully exercised your right to object to processing (see below), where we may have processed your information unlawfully or where we are required to erase your personal data to comply with local law. Note, however, that we may not always be able to comply with your request of erasure for specific legal reasons which will be notified to you, if applicable, at the time of your request.</li>
                <li>• Object to the processing of your personal data: Where we are relying on a legitimate interest (or those of a third party) and there is something about your particular situation which makes you want to object to processing on this ground as you feel it impacts on your fundamental rights and freedoms. You also have the right to object where we are processing your personal data for direct marketing purposes. In some cases, we may demonstrate that we have compelling legitimate grounds to process your information which override your rights and freedoms</li>
                <li>• Request restriction of processing your personal data: This enables you to ask us to suspend the processing of your personal data in the following scenarios: (a) if you want us to establish the data's accuracy; or (b) you have objected to our use of your data but we need to verify whether we have overriding legitimate grounds to use it</li>
                <li>• Request the transfer of your personal data to you or to a third party: We will provide to you, or a third party you have chosen, your personal data in a structured, commonly used, machine-readable format. Note that this right only applies to automated information which you initially provided consent for us to use or where we used the information to perform a contract with you.</li>
                <li>• Withdraw consent at any time where we are relying on consent to process your personal data: However, this will not affect the lawfulness of any processing carried out before you withdraw your consent. If you withdraw your consent, we may not be able to provide certain products or services to you. We will advise you if this is the case at the time, you withdraw your consent.</li>
              </ul>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                If you wish to exercise any of the rights set out above, please contact us.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                Right to complain to a supervisory authority: You also have the right to complain to a relevant data protection supervisory authority about our processing of your personally identifiable information.
              </p>
            </div>
          </div>

          {/* Privacy for Children */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChildCareIcon className="text-pink-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Privacy for Children</h3>
            </div>
            <div className="space-y-4">
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                We are committed to protecting the privacy of children, as defined by applicable laws in each jurisdiction. We do not knowingly collect any personal data from children without obtaining verifiable parental or legal guardian consent.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                If you are a child, please do not use or access our services without the direct supervision of a parent or legal guardian. If you wish to participate in any of our programs or events, we kindly ask that your parent or legal guardian contact us to submit a request on your behalf.
              </p>
              <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                If we become aware that personal data has been collected from a child without the necessary parental consent, we will take prompt steps to delete that information. If you are a parent or guardian and discover that your child has used or interacted with our services without your knowledge or consent, please contact us immediately so we can take appropriate action.
              </p>
            </div>
          </div>

                     {/* Data Retention */}
           <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                 <DataUsageIcon className="text-purple-400" />
               </div>
               <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Data Retention</h3>
             </div>
             <div className="space-y-4">
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
               </p>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 Only minimum personal data, from the larger set of data (including Contact, Identity, Financial Transaction and other Data) which was collected from the user will be retained until the dissolution of the Entity and for the subsequent period as mandated by the statute from time to time. And such retention will be as per applicable regulations and statutory guidelines.
               </p>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
               </p>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 In some circumstances you can ask us to delete your data.
               </p>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 In some circumstances we may anonymize your personal data (so that it can no longer be associated with you) for research or statistical purposes in which case we may use this information indefinitely without further notice to you.
               </p>
             </div>
           </div>

                     {/* Data Storage */}
           <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                 <DataUsageIcon className="text-blue-400" />
               </div>
               <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Data Storage</h3>
             </div>
             <div className="space-y-4">
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 Our services are hosted on servers located across the world. Also, as a company with teams working across the world, we may process your data from different regions of the world. If you are accessing our services, you agree to your information being transferred to, stored, and processed by us and by those third parties (whom we may share your personal information) from any or all these locations.
               </p>
             </div>
           </div>

                     {/* Disclosure Of Your Personal Data */}
           <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm hover:from-white/10 hover:to-white/15 hover:shadow-2xl transition-all duration-300 group transform hover:scale-[1.01]">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                 <DataUsageIcon className="text-red-400" />
               </div>
               <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Disclosure Of Your Personal Data</h3>
             </div>
             <div className="space-y-4">
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 Except as described in this Notice, we will not intentionally disclose the Personal Data that we collect or store on the Service to third parties without the consent of the User.
               </p>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 We may disclose information to third parties if you consent to us doing so, as well as in the following circumstances:
               </p>
               <ol className="text-purple-200 leading-relaxed text-sm sm:text-base space-y-4 ml-6">
                 <li>
                   <strong>1. To Data Processors:</strong> We use partners (data processors) for some business processes that are not core to our expertise but are critical to our users having a quality experience. Where we provide your personal data to data processors, we will have in place a written agreement with each third party confirming on what basis the third party will handle your personal data and will ensure that there are sufficient safeguards and processes in place to protect your personal data.
                 </li>
                 <li>
                   <strong>2. To Third Party Service Providers:</strong> We work with third party service providers who provide website, application development, hosting, maintenance, and other services for us. These third parties may have access to, or process Personal Data as part of providing those services for us. We limit the access and information provided to these service providers to that which is reasonably necessary for them to perform their functions, and our contracts with them require them to maintain the confidentiality of such information.
                 </li>
                 <li>
                   <strong>3. Non Personally Identifiable Information:</strong> We may make certain automatically collected, aggregated, or otherwise non-personally-identifiable information available to third parties for various purposes, including (i) compliance with various reporting obligations; (ii) for business or marketing purposes; or (iii) to assist such parties in understanding our Users' interests, habits, and usage patterns for certain programs, content, services, and/or functionality available through the Service.
                 </li>
                 <li>
                   <strong>4. To Law Enforcement, Legal Process and Compliance:</strong> We may disclose Personal Data or other information if required to do so by law or in the good-faith belief that such action is necessary to comply with applicable laws, in response to a facially valid court order, judicial or other government subpoena or warrant, or to otherwise cooperate with law enforcement or other governmental agencies.
                   <br /><br />
                   We also reserve the right to disclose Personal Data or other information that we believe, in good faith, is appropriate or necessary to (i) take precautions against liability, (ii) protect ourselves or others from fraudulent, abusive, or unlawful uses or activity, (iii) investigate and defend ourselves against any third-party claims or allegations, (iv) protect the security or integrity of the Service and any facilities or equipment used to make the Service available, or (v) protect our property or other legal rights, enforce our contracts, or protect the rights, property, or safety of others.
                 </li>
                 <li>
                   <strong>5. Due To Change of Ownership:</strong> Information about Users, including Personal Data, may be disclosed and otherwise transferred to an acquirer, successor or assignee as part of any merger, acquisition, debt financing, sale of assets, or similar transaction, as well as in the event of an insolvency, bankruptcy, or receivership in which information is transferred to one or more third parties as one of our business assets or for the sole purpose of continuing the operation of the Service, only if the recipient of the User Data commits to a Privacy Notice that has terms substantially consistent with this Privacy Notice.
                   <br /><br />
                   We may seek to acquire other businesses or merge with them. If a change happens to our business, then the new owners may use your personal data in the same way as set out in this privacy Notice.
                 </li>
                 <li>
                   <strong>6. To Business Partners:</strong> If you participate in any events conducted or hosted by us in partnership with our business partners, we may share your personal data collected for event purposes with the partners, only after taking your explicit consent.
                   <br /><br />
                   The terms of such partnerships may include sharing personal data with business partners for event administration purposes, for communicating event related announcements, for announcing contest winners (if applicable), or for extending offers on certain products, services, and promotions from business partners to event participants etc.
                   <br /><br />
                   Once the personal data is transferred to a business partner, that data will be governed as per the partner's privacy policies on which we do not have any control. Hence, we recommend that you read and understand the terms and conditions stipulated for that specific event before giving your consent.
                 </li>
               </ol>
               <p className="text-purple-200 leading-relaxed text-sm sm:text-base">
                 We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.
               </p>
             </div>
           </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 sm:mt-10">
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 sm:p-8 border border-green-400/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center">
                <ContactSupportIcon className="text-green-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Contact Us</h2>
                <p className="text-purple-200 text-sm sm:text-base">If you have any questions about our Privacy Policy or data practices, please contact us.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <InfoIcon className="text-blue-400 text-sm" />
                  </div>
                  <span className="text-purple-300 font-medium text-sm">Email</span>
                </div>
                <a href="mailto:support.scl@signavoxtechnologies.com" className="text-blue-300 hover:text-blue-400 transition-colors text-sm block font-medium">
                  support.scl@signavoxtechnologies.com
                </a>
              </div>
              <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ContactSupportIcon className="text-green-400 text-sm" />
                  </div>
                  <span className="text-purple-300 font-medium text-sm">Phone</span>
                </div>
                <a href="tel:+15551234567" className="text-green-300 hover:text-green-400 transition-colors text-sm block font-medium">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <PolicyIcon className="text-purple-400 text-sm" />
                  </div>
                  <span className="text-purple-300 font-medium text-sm">Company</span>
                </div>
                <span className="text-purple-200 text-sm block font-medium">
                  SIGNAVOX TECHNOLOGIES PVT LTD
                </span>
              </div>
            </div>
          </div>
        </div>
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

export default PrivacyPolicy; 