import React from 'react';
import { TrendingUp, School, Event, AssignmentTurnedIn, CheckCircle } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const metricData = [
  { label: 'Total Courses', value: 12, icon: <School />, color: 'from-purple-400 to-purple-700' },
  { label: 'Completed', value: 7, icon: <CheckCircle />, color: 'from-green-400 to-green-600' },
  { label: 'Progress', value: '58%', icon: <TrendingUp />, color: 'from-pink-400 to-pink-600' },
  { label: 'Events', value: 3, icon: <Event />, color: 'from-blue-400 to-blue-700' },
  { label: 'Enrollments', value: 5, icon: <AssignmentTurnedIn />, color: 'from-yellow-400 to-yellow-600' },
];

const progressData = [
  { month: 'Jan', progress: 10 },
  { month: 'Feb', progress: 20 },
  { month: 'Mar', progress: 35 },
  { month: 'Apr', progress: 40 },
  { month: 'May', progress: 50 },
  { month: 'Jun', progress: 58 },
];

const pieData = [
  { name: 'Completed', value: 7 },
  { name: 'In Progress', value: 4 },
  { name: 'Not Started', value: 1 },
];
const pieColors = ['#a3e635', '#f472b6', '#818cf8'];

const courses = [
  { name: 'React Mastery', status: 'Completed', progress: 100, color: 'bg-green-400' },
  { name: 'Node.js Essentials', status: 'In Progress', progress: 70, color: 'bg-pink-400' },
  { name: 'UI/UX Design', status: 'In Progress', progress: 45, color: 'bg-blue-400' },
  { name: 'Data Structures', status: 'Not Started', progress: 0, color: 'bg-purple-400' },
  { name: 'Cloud Basics', status: 'Completed', progress: 100, color: 'bg-green-400' },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricData.map((m, i) => (
          <div
            key={m.label}
            className={`flex flex-col items-center justify-center rounded-2xl p-5 shadow-xl bg-gradient-to-br ${m.color} text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300`}
          >
            <div className="absolute right-2 top-2 opacity-20 text-6xl group-hover:opacity-30 transition-all">{m.icon}</div>
            <div className="z-10 flex flex-col items-center">
              <div className="text-3xl font-bold drop-shadow-lg">{m.value}</div>
              <div className="text-sm font-medium mt-1 tracking-wide uppercase">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Chart */}
        <div className="col-span-2 bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <div className="mb-4 text-lg font-semibold text-purple-200">Progress Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#c4b5fd"/>
              <YAxis stroke="#c4b5fd"/>
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }}/>
              <Area type="monotone" dataKey="progress" stroke="#a78bfa" fillOpacity={1} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center backdrop-blur-md">
          <div className="mb-4 text-lg font-semibold text-purple-200">Course Completion</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <div className="mb-4 text-lg font-semibold text-purple-200">Your Courses</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.name} className="rounded-xl p-5 bg-gradient-to-br from-[#312e81]/80 to-[#0a081e]/80 shadow-md flex flex-col gap-2 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${course.color} animate-pulse`}></span>
                <span className="font-semibold text-white text-lg">{course.name}</span>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/10 text-purple-200 border border-purple-400/30">{course.status}</span>
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${course.color}`}
                  style={{ width: `${course.progress}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }}
                ></div>
              </div>
              <div className="text-xs text-purple-200 mt-1">Progress: {course.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 