'use client';
import React, { useState } from 'react';
import {
  Settings,
  Bell,
  User,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Laptop,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Briefcase,
  MessageSquare,
  Search,
  ArrowUpRight
} from 'lucide-react';

// --- Mock Data & Components ---

type AvatarProps = {
  src: string;
  alt: string;
  className?: string;
};

const Avatar = ({ src, alt, className = "w-8 h-8" }: AvatarProps) => (
  <img
    src={src}
    alt={alt}
    className={`rounded-full object-cover border-2 border-white ${className}`}
  />
);

type StatPillProps = {
  label: string;
  percent: string;
  color?: string;
  textColor?: string;
  width?: string;
};

const StatPill = ({ label, percent, color = "bg-gray-100", textColor = "text-gray-600", width = "w-full" }: StatPillProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium ml-1">{label}</span>
    <div className={`h-10 rounded-full flex items-center px-4 ${color} ${width}`}>
      <span className={`font-bold text-sm ${textColor}`}>{percent}</span>
    </div>
  </div>
);

type IconButtonProps = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  className?: string;
};

const IconButton = ({ icon: Icon, className = "" }: IconButtonProps) => (
  <button className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}>
    <Icon size={20} strokeWidth={1.5} />
  </button>
);

export default function App() {
  // State for the accordion
  const [expandedSection, setExpandedSection] = useState<string | null>('Devices');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F1] to-[#F1EADE] text-[#1A1A1A] p-4 md:p-8 font-sans selection:bg-yellow-200"> {/* Updated background */}
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="px-6 py-2 rounded-full border border-gray-200 bg-white/50 shadow-sm">
            <span className="text-xl font-semibold tracking-tight">Crextio</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center bg-white/50 p-1.5 rounded-full border border-gray-200 shadow-sm overflow-hidden">
            {['Dashboard', 'People', 'Hiring', 'Devices', 'Apps', 'Salary', 'Calendar', 'Reviews'].map((item, idx) => (
              <button
                key={item}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  idx === 0
                    ? 'bg-[#1A1A1A] text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-full border border-gray-200 shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-600 transition-colors">
              <Settings size={18} />
              <span>Setting</span>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <IconButton icon={Bell} />
            <IconButton icon={User} />
          </div>
        </header>

        {/* --- Welcome & Top Stats --- */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-6 flex-1">
            <h1 className="text-4xl md:text-5xl font-medium text-gray-900 tracking-tight">
              Welcome in, <span className="text-gray-800">Nixtio</span>
            </h1>

            {/* Stats Pills Row */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-32">
                <StatPill label="Interviews" percent="15%" color="bg-[#1A1A1A]" textColor="text-white" />
              </div>
              <div className="w-32">
                <StatPill label="Hired" percent="15%" color="bg-[#FACC15]" textColor="text-black" />
              </div>
              <div className="flex-1 min-w-[200px]">
                 <span className="text-xs text-gray-500 font-medium ml-1 mb-1 block">Project time</span>
                 <div className="h-10 w-full bg-white rounded-full border border-gray-200 flex items-center px-1 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB2aWV3Qm94PSIwIDAgNCA0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9M00tMSA1TDUgLTEiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] w-[60%] h-full opacity-50"></div>
                    <span className="relative z-10 text-xs font-bold ml-4">60%</span>
                 </div>
              </div>
              <div className="w-24">
                 <StatPill label="Output" percent="10%" color="bg-transparent border border-gray-300" textColor="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Right Big Numbers */}
          <div className="flex gap-8 md:gap-12 mb-2">
            {[
              { val: 78, label: 'Employe', icon: User },
              { val: 56, label: 'Hirings', icon: Search },
              { val: 203, label: 'Projects', icon: Briefcase },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center md:items-start">
                <div className="text-4xl md:text-5xl font-light text-gray-800">{stat.val}</div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <stat.icon size={14} />
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Main Grid --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column (Profile & Accordion) */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Profile Card */}
            <div className="relative h-[340px] rounded-[2rem] overflow-hidden group shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt="Profile"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-semibold">Lora Piterson</h3>
                    <p className="text-white/70 text-sm">UX/UI Designer</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full text-sm font-medium">
                    $1,200
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Menu */}
            <div className="bg-[#FBF8F1] space-y-1"> {/* This specific background should remain solid, as per original */}
              {[
                { id: 'Pension', title: 'Pension contributions' },
                { id: 'Devices', title: 'Devices' },
                { id: 'Compensation', title: 'Compensation Summary' },
                { id: 'Benefits', title: 'Employee Benefits' },
              ].map((item) => (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
                    className="flex items-center justify-between py-3 px-2 hover:bg-white/50 rounded-lg transition-colors group"
                  >
                    <span className="font-medium text-gray-700">{item.title}</span>
                    {expandedSection === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} className="text-gray-400" />}
                  </button>

                  {expandedSection === item.id && item.id === 'Devices' && (
                    <div className="px-2 pb-4 animate-in slide-in-from-top-2 duration-200">
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-md">
                             <Laptop size={24} />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-sm text-gray-900">MacBook Air</h4>
                             <p className="text-xs text-gray-500">Version M1</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                             <MoreVertical size={16} />
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column (Charts & Timeline) */}
          <div className="lg:col-span-6 flex flex-col gap-6">

            {/* Top Row: Progress & Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Bar Chart Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-gray-500 text-sm mb-1">Progress</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-medium">6.1 h</span>
                      <span className="text-xs text-gray-400">Work Time<br/>this week</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-50 rounded-full">
                     <ArrowUpRight size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Bars */}
                <div className="flex items-end justify-between h-32 px-2">
                  {[
                    { d: 'S', h: 'h-8', hl: false },
                    { d: 'M', h: 'h-12', hl: false },
                    { d: 'T', h: 'h-16', hl: false },
                    { d: 'W', h: 'h-10', hl: false },
                    { d: 'T', h: 'h-24', hl: true, label: '5h 23m' },
                    { d: 'F', h: 'h-20', hl: false },
                    { d: 'S', h: 'h-8', hl: false },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group relative">
                       {bar.hl && (
                         <div className="absolute -top-8 bg-[#FACC15] text-[10px] font-bold py-1 px-2 rounded-full shadow-sm whitespace-nowrap animate-bounce">
                            {bar.label}
                         </div>
                       )}
                       <div className={`w-2 rounded-full transition-all duration-500 ${bar.hl ? 'bg-[#FACC15]' : 'bg-[#1A1A1A]'} ${bar.h}`}></div>
                       <span className="text-xs text-gray-400">{bar.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timer Card */}
              <div className="bg-[#FFFBF2] rounded-[2rem] p-6 shadow-sm border border-yellow-100/50 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <h3 className="text-gray-600 font-medium">Time tracker</h3>
                  <ArrowUpRight size={18} className="text-gray-400" />
                </div>

                <div className="flex justify-center items-center py-4 relative z-10">
                  {/* Circular Progress SVG */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="0" />
                        <circle cx="80" cy="80" r="70" stroke="#FACC15" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="180" strokeLinecap="round" />
                     </svg>
                     <div className="absolute text-center">
                        <div className="text-3xl font-light text-gray-800">02:35</div>
                        <div className="text-xs text-gray-400">Work Time</div>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between items-center z-10">
                  <div className="flex gap-3">
                     <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <Play size={16} className="ml-1 text-gray-800" />
                     </button>
                     <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                        <Pause size={16} className="text-gray-800" />
                     </button>
                  </div>
                  <button className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-sm text-white hover:bg-black">
                     <Clock size={18} />
                  </button>
                </div>
              </div>

            </div>

            {/* Calendar / Timeline Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex-1">
               <div className="flex justify-between items-center mb-6">
                  <div className="px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-500">August</div>
                  <h3 className="font-medium text-gray-800">September 2024</h3>
                  <div className="px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-500">October</div>
               </div>

               <div className="relative pt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 top-12 flex justify-between px-4 pointer-events-none">
                     {[1,2,3,4,5,6].map(i => <div key={i} className="w-px h-full bg-gray-50 border-r border-dashed border-gray-200"></div>)}
                  </div>

                  {/* Days Header */}
                  <div className="flex justify-between px-4 mb-8 relative z-10">
                     {[
                        { d: 'Mon', n: '22' }, { d: 'Tue', n: '23' }, { d: 'Wed', n: '24' },
                        { d: 'Thu', n: '25' }, { d: 'Fri', n: '26' }, { d: 'Sat', n: '27' }
                     ].map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                           <span className="text-xs text-gray-400 font-medium">{day.d}</span>
                           <span className={`text-sm font-bold ${i===2 ? 'text-[#1A1A1A]' : 'text-gray-600'}`}>{day.n}</span>
                        </div>
                     ))}
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-6 relative z-10 min-h-[180px]">
                     {/* 8:00 AM Row */}
                     <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-12">8:00 am</span>
                     </div>

                     {/* Event 1 */}
                     <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-12">9:00 am</span>
                        <div className="ml-12 flex-1">
                           <div className="bg-[#1A1A1A] text-white p-3 rounded-full inline-flex items-center gap-4 shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">
                              <div className="pl-2">
                                 <div className="text-xs font-bold">Weekly Team Sync</div>
                                 <div className="text-[10px] text-gray-400">Discuss progress on projects</div>
                              </div>
                              <div className="flex -space-x-2 pr-1">
                                 {[1,2,3].map(i => (
                                    <Avatar key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt={`Participant ${i}`} className="w-6 h-6 border-gray-800" />
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* 10:00 AM Row */}
                     <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-12">10:00 am</span>
                     </div>

                     {/* Event 2 */}
                     <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-12">11:00 am</span>
                        <div className="ml-auto w-1/2 pr-8">
                           <div className="bg-white border border-gray-200 p-2 rounded-full flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
                              <div className="pl-3">
                                 <div className="text-xs font-bold text-gray-900">Onboarding Session</div>
                                 <div className="text-[10px] text-gray-500">Introduction for new hires</div>
                              </div>
                              <div className="flex -space-x-2">
                                 {[4,5].map(i => (
                                    <Avatar key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} alt={`Participant ${i}`} className="w-6 h-6 border-white" />
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column (Onboarding & Tasks) */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Onboarding Progress */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
               <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-medium text-gray-800">Onboarding</h3>
                  <span className="text-3xl font-light">18%</span>
               </div>

               <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>30%</span>
                  <span>25%</span>
                  <span>0%</span>
               </div>

               <div className="flex gap-1 h-12">
                  <div className="flex-1 bg-[#FACC15] rounded-l-2xl rounded-r-md flex items-center justify-center text-xs font-bold text-black">Task</div>
                  <div className="w-12 bg-[#1A1A1A] rounded-md"></div>
                  <div className="w-8 bg-gray-400 rounded-l-md rounded-r-2xl"></div>
               </div>
            </div>

            {/* Tasks List (Dark Card) */}
            <div className="bg-[#1A1A1A] rounded-[2rem] p-6 text-white flex-1 relative overflow-hidden">
               {/* Top decoration looking like a folder tab */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/10 rounded-b-lg"></div>

               <div className="flex justify-between items-end mb-8 mt-2">
                  <div>
                     <h3 className="text-lg font-light text-white/90">Onboarding Task</h3>
                  </div>
                  <span className="text-3xl font-light">2/8</span>
               </div>

               <div className="space-y-6">
                  {[
                     { title: 'Interview', time: 'Sep 13, 08:30', icon: Laptop, checked: true },
                     { title: 'Team Meeting', time: 'Sep 13, 10:30', icon: MessageSquare, checked: true },
                     { title: 'Project Update', time: 'Sep 13, 13:00', icon: CheckCircle2, checked: false },
                     { title: 'Discuss Q3 Goals', time: 'Sep 13, 14:45', icon: Briefcase, checked: false },
                     { title: 'HR Policy Review', time: 'Sep 13, 16:30', icon: LinkIcon, checked: false },
                  ].map((task, i) => (
                     <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${task.checked ? 'bg-[#2A2A2A] text-white' : 'bg-white text-black'}`}>
                           <task.icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                           <h4 className={`text-sm font-medium ${task.checked ? 'text-gray-400 line-through' : 'text-white'}`}>{task.title}</h4>
                           <p className="text-[10px] text-gray-500">{task.time}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${task.checked ? 'bg-[#FACC15] border-[#FACC15]' : 'border-gray-600 bg-transparent'}`}>
                           {task.checked && <CheckCircle2 size={14} className="text-black" />}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
