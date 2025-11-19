'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, RefreshCw, Moon, Info, X, Repeat, Clock } from 'lucide-react';

// 诗词数据：枫桥夜泊
const POEM_DATA = {
  title: "枫桥夜泊",
  author: "张继 (唐)",
  lines: [
    {
      text: "月落乌啼霜满天",
      translation: "月亮已落下，乌鸦啼叫，寒霜满天。",
      sceneConfig: { moon: 'setting', birds: true, fog: true, fire: false, bell: false }
    },
    {
      text: "江枫渔火对愁眠",
      translation: "江边枫树与船上渔火，陪伴着我忧愁而眠。",
      sceneConfig: { moon: 'hidden', birds: false, fog: true, fire: true, bell: false }
    },
    {
      text: "姑苏城外寒山寺",
      translation: "姑苏城外那寂寞清静的寒山古寺。",
      sceneConfig: { moon: 'hidden', birds: false, fog: false, fire: true, bell: false }
    },
    {
      text: "夜半钟声到客船",
      translation: "半夜里敲钟的声音传到了客船。",
      sceneConfig: { moon: 'hidden', birds: false, fog: false, fire: true, bell: true }
    }
  ]
};

// SVG 视觉组件：模拟剪纸/卡片风格

const MoonAsset = ({ state }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-1000 ${state === 'setting' ? 'translate-y-20 opacity-50' : state === 'hidden' ? 'translate-y-40 opacity-0' : 'translate-y-0 opacity-100'}`}>
    <circle cx="50" cy="50" r="40" fill="#FEFCE8" className="drop-shadow-[0_0_15px_rgba(254,252,232,0.6)]" />
  </svg>
);

const MountainAsset = () => (
  <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="w-full h-full text-slate-800">
    <path d="M0,200 L150,50 L250,120 L350,80 L400,200 Z" fill="currentColor" className="drop-shadow-xl" />
    <path d="M-20,200 L100,100 L200,200 Z" fill="#1e293b" className="opacity-80" />
  </svg>
);

const TreeAsset = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full text-slate-900">
    <path d="M100,300 Q90,200 100,150 Q80,100 50,80 M100,150 Q120,100 150,70 M100,150 Q110,100 100,50" 
          fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    {/* Leaves/Maple Shapes */}
    <circle cx="50" cy="80" r="20" className="fill-red-900/80 animate-pulse" />
    <circle cx="150" cy="70" r="15" className="fill-red-800/80 animate-pulse delay-75" />
    <circle cx="100" cy="50" r="25" className="fill-red-900/80 animate-pulse delay-150" />
  </svg>
);

const BoatAsset = ({ fireOn }) => (
  <svg viewBox="0 0 200 100" className="w-full h-full">
    {/* Boat Body */}
    <path d="M20,70 Q100,90 180,70 L160,85 Q100,100 40,85 Z" fill="#27272a" className="drop-shadow-lg" />
    {/* Cabin */}
    <rect x="80" y="50" width="40" height="25" rx="2" fill="#3f3f46" />
    <path d="M80,50 L120,50 L110,40 L90,40 Z" fill="#52525b" />
    {/* Fire Light */}
    <circle cx="100" cy="60" r={fireOn ? 8 : 0} fill="#fbbf24" className={`transition-all duration-1000 ${fireOn ? 'opacity-100 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'opacity-0'}`} />
    {/* Reflection */}
    {fireOn && (
       <path d="M90,85 Q100,95 110,85" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" className="opacity-50 animate-pulse" />
    )}
  </svg>
);

const TempleAsset = () => (
  <svg viewBox="0 0 150 150" className="w-full h-full text-slate-900">
    {/* Roof */}
    <path d="M10,60 Q75,10 140,60 L130,70 Q75,30 20,70 Z" fill="currentColor" />
    {/* Body */}
    <rect x="30" y="70" width="90" height="80" fill="#334155" />
    {/* Door */}
    <rect x="60" y="100" width="30" height="50" fill="#0f172a" rx="2" />
  </svg>
);

const FogLayer = ({ active }) => (
  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-2000 ${active ? 'opacity-60' : 'opacity-20'}`}>
     <div className="w-full h-full bg-gradient-to-t from-slate-300/20 to-transparent" />
     {/* Moving fog particles simulated with divs */}
     <div className="absolute top-1/2 left-10 w-40 h-10 bg-white/10 blur-xl rounded-full animate-[pulse_4s_infinite]" />
     <div className="absolute top-2/3 right-20 w-60 h-16 bg-white/10 blur-xl rounded-full animate-[pulse_6s_infinite_reverse]" />
  </div>
);

const BellEffect = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute top-1/4 right-10 z-50 pointer-events-none">
      <div className="w-20 h-20 border-4 border-amber-200/30 rounded-full animate-[ping_2s_ease-out_infinite]" />
      <div className="w-20 h-20 border-4 border-amber-200/20 rounded-full animate-[ping_2s_ease-out_infinite_delay-500]" />
    </div>
  );
};

export default function PoetryCardApp() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // New State for Settings
  const [isLooping, setIsLooping] = useState(true);
  const [intervalTime, setIntervalTime] = useState(4000);

  // Mouse Interaction State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentLine((prev) => {
          // Check if we are at the end
          if (prev >= POEM_DATA.lines.length - 1) {
            if (isLooping) {
              return 0; // Loop back to start
            } else {
              setIsPlaying(false); // Stop playing
              return prev;
            }
          }
          return prev + 1;
        });
      }, intervalTime);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLooping, intervalTime]);

  // Parallax Calculation
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const nextLine = () => setCurrentLine(p => {
    if (p >= POEM_DATA.lines.length - 1 && isLooping) return 0;
    return Math.min(p + 1, POEM_DATA.lines.length - 1)
  });
  const prevLine = () => setCurrentLine(p => Math.max(p - 1, 0));
  const reset = () => {
    setCurrentLine(0);
    setIsPlaying(false);
  };

  // Helper for 3D transform style
  const getParallaxStyle = (depth = 10) => {
    const rotateX = mousePos.y * 10; // Tilt limit
    const rotateY = mousePos.x * -10; 
    const translateX = mousePos.x * depth * -20; 
    const translateY = mousePos.y * depth * -20;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) translateY(${translateY}px)`,
    };
  };

  const currentConfig = POEM_DATA.lines[currentLine].sceneConfig;

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-serif text-slate-800 overflow-hidden">
      
      {/* Main Container */}
      <div className="relative w-full max-w-4xl h-[650px] flex flex-col md:flex-row gap-6">
        
        {/* 2.5D Scene Area */}
        <div 
          className="relative flex-1 bg-slate-900 rounded-xl shadow-2xl overflow-hidden cursor-move select-none border-[12px] border-white ring-1 ring-slate-200"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={containerRef}
        >
          
          {/* 1. Far Background (Stars/Sky) - Slowest Movement */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 scale-110 transition-transform duration-100 ease-out"
            style={getParallaxStyle(2)}
          >
            {/* Stars */}
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse" />
            <div className="absolute top-30 right-40 w-1 h-1 bg-white rounded-full opacity-50" />
            <div className="absolute top-1/4 left-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-90" />
          </div>

          {/* 2. Moon Layer */}
          <div 
            className="absolute top-10 left-10 w-24 h-24 transition-transform duration-100 ease-out z-10"
            style={getParallaxStyle(3)}
          >
            <MoonAsset state={currentConfig.moon} />
          </div>

          {/* 3. Mountains (Mid-Background) */}
          <div 
            className="absolute bottom-20 -right-20 w-[120%] h-64 opacity-40 transition-transform duration-100 ease-out z-20"
            style={getParallaxStyle(4)}
          >
            <MountainAsset />
          </div>

          {/* 4. Temple (Mid-Ground) - Shows on specific lines */}
          <div 
            className={`absolute bottom-32 right-10 w-32 h-32 transition-all duration-1000 ease-out z-25 ${currentLine >= 2 ? 'opacity-60 blur-[1px]' : 'opacity-0 translate-x-10'}`}
            style={getParallaxStyle(4.5)}
          >
             <TempleAsset />
          </div>

          {/* 5. Trees (Foreground Left) */}
          <div 
            className="absolute -bottom-10 -left-10 w-64 h-96 transition-transform duration-100 ease-out z-30 drop-shadow-2xl"
            style={getParallaxStyle(6)}
          >
            <TreeAsset />
          </div>

          {/* 6. Boat (Foreground Center) */}
          <div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 transition-transform duration-100 ease-out z-40"
            style={getParallaxStyle(8)}
          >
            <div className="animate-[bounce_3s_infinite] ease-in-out">
              <BoatAsset fireOn={currentConfig.fire} />
            </div>
          </div>

          {/* 7. Crows (Conditional) */}
          {currentConfig.birds && (
            <div 
              className="absolute top-20 right-20 z-20 animate-[fly_10s_linear_infinite]"
              style={getParallaxStyle(5)}
            >
              <div className="text-slate-800 w-8 h-4">
                 <svg viewBox="0 0 50 20"><path d="M0,10 Q10,0 25,10 Q40,0 50,10" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              </div>
            </div>
          )}

          {/* FX Layers */}
          <FogLayer active={currentConfig.fog} />
          <BellEffect active={currentConfig.bell} />

          {/* Text Overlay (The "Card" in the scene) */}
          <div 
            className="absolute top-10 right-10 w-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-sm py-4 flex flex-col items-center border border-slate-200 z-50 transition-all duration-500"
            style={{
               // Counter-rotate to keep text somewhat legible but still floating
               transform: `perspective(1000px) rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * -5}deg) translateZ(20px)`
            }}
          >
            <div className="writing-vertical-rl text-lg font-bold tracking-widest text-slate-900 h-full">
              {POEM_DATA.title}
            </div>
            <div className="w-px h-12 bg-red-800/50 my-2"></div>
            <div className="w-4 h-4 bg-red-800 rounded-sm text-[8px] text-white flex items-center justify-center font-sans">
              诗
            </div>
          </div>

          {/* Main Line Display - Center Floating */}
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
             <div 
               key={currentLine}
               className="bg-slate-900/70 text-stone-100 px-8 py-4 rounded-lg shadow-2xl backdrop-blur-md border border-slate-500/30 animate-in fade-in zoom-in duration-700"
               style={{
                 transform: `translateY(${mousePos.y * -20}px) translateX(${mousePos.x * -20}px)`
               }}
             >
                <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] drop-shadow-lg text-center">
                  {POEM_DATA.lines[currentLine].text}
                </h2>
             </div>
          </div>

        </div>

        {/* Controls & Info Sidebar */}
        <div className="w-full md:w-72 flex flex-col gap-4">
          
          {/* Poem Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex-1 flex flex-col min-h-[200px]">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 mb-1">{POEM_DATA.title}</h1>
                 <p className="text-sm text-slate-500">{POEM_DATA.author}</p>
               </div>
               <button onClick={() => setShowInfo(!showInfo)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                 {showInfo ? <X size={18} /> : <Info size={18} />}
               </button>
            </div>

            {/* Translation Display */}
            <div className="relative flex-1">
              {showInfo ? (
                <div className="absolute inset-0 bg-white z-10 animate-in slide-in-from-left overflow-y-auto">
                  <h3 className="font-bold text-slate-800 mb-2">全文赏析</h3>
                  <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                    {POEM_DATA.lines.map((line, idx) => (
                      <p key={idx}><span className="font-bold text-slate-800">{line.text}</span><br/>{line.translation}</p>
                    ))}
                  </div>
                </div>
              ) : (
                 <div className="h-full flex flex-col justify-center border-t border-stone-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">当前句解</span>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{POEM_DATA.lines[currentLine].translation}"
                    </p>
                 </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
            
            {/* Progress Bar */}
            <div className="flex gap-1 mb-6">
              {POEM_DATA.lines.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentLine ? 'bg-red-600' : idx < currentLine ? 'bg-slate-300' : 'bg-slate-100'}`}
                />
              ))}
            </div>

            {/* Playback Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={prevLine} 
                disabled={!isLooping && currentLine === 0}
                className="p-3 rounded-full hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700"
              >
                <ChevronLeft size={24} />
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-4 rounded-full shadow-md transition-all transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'}`}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              </button>

              <button 
                onClick={nextLine}
                disabled={!isLooping && currentLine === POEM_DATA.lines.length - 1}
                className="p-3 rounded-full hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* New Settings Section */}
            <div className="pt-4 border-t border-stone-100 flex flex-col gap-4">
                
                {/* Loop Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Repeat size={16} /> 
                        <span>循环播放</span>
                    </div>
                    <button 
                        onClick={() => setIsLooping(!isLooping)}
                        className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${isLooping ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>

                {/* Speed Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>间隔时间</span>
                        </div>
                        <span>{intervalTime / 1000} 秒</span>
                    </div>
                    <input 
                        type="range" 
                        min="2000" 
                        max="8000" 
                        step="500" 
                        value={intervalTime}
                        onChange={(e) => setIntervalTime(Number(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 px-1">
                        <span>快</span>
                        <span>慢</span>
                    </div>
                </div>

            </div>
            
             <div className="mt-4 flex justify-center">
                <button onClick={reset} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                   <RefreshCw size={12} /> 重置场景
                </button>
             </div>
          </div>

        </div>
      </div>

      <style>{`
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
        @keyframes fly {
          0% { transform: translateX(50px) translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-300px) translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
