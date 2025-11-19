
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, RefreshCw, Brain, MessageSquare, Cpu, Zap } from 'lucide-react';

const LLMVisualize = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 模拟输入句子
  const inputTokens = [
    { id: 101, text: "今天", color: "#60A5FA" },
    { id: 102, text: "天气", color: "#34D399" },
    { id: 103, text: "非常", color: "#F472B6" },
    { id: 104, text: "...", color: "#A78BFA" } // 待预测位置
  ];

  // 模拟预测候选项
  const predictions = [
    { text: "好", prob: 0.75, color: "#10B981" },
    { text: "热", prob: 0.15, color: "#F59E0B" },
    { text: "冷", prob: 0.08, color: "#3B82F6" },
    { text: "差", prob: 0.02, color: "#EF4444" },
  ];

  const totalSteps = 4;

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying]);

  const handleNext = () => {
    setStep((prev) => (prev < totalSteps ? prev + 1 : 0));
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 0 ? prev - 1 : 0));
    setIsPlaying(false);
  };

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  // 步骤描述数据
  const stepsInfo = [
    {
      title: "1. 输入与分词 (Tokenization)",
      desc: "大模型不直接理解文字。首先，它将句子拆解为“Token”（词元）。每个 Token 被转换成一个唯一的数字ID。这是模型能处理的最小单位。",
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />
    },
    {
      title: "2. 向量嵌入 (Embedding)",
      desc: "每个数字 ID 被转换成一个高维向量（这里简化为发光的方块）。这个向量包含了词的语义信息（例如，“猫”和“狗”在数学空间上靠得很近）。",
      icon: <Cpu className="w-6 h-6 text-green-400" />
    },
    {
      title: "3. 自注意力机制 (Self-Attention)",
      desc: "这是 Transformer 的核心。模型在处理当前位置时，会“回头看”前面的所有词，计算它们之间的关联度（连线粗细）。例如，理解“它”指代什么，需要看前面的名词。",
      icon: <Brain className="w-6 h-6 text-purple-400" />
    },
    {
      title: "4. 概率预测 (Next Token Prediction)",
      desc: "经过多层神经网络计算，模型最终输出一个概率列表。它预测词典中每一个词成为“下一个词”的可能性。通常选择概率最高的那个。",
      icon: <Zap className="w-6 h-6 text-yellow-400" />
    },
    {
      title: "完成：生成新 Token",
      desc: "模型选择了“好”字。现在，“好”字被加入到输入序列中，整个过程将重复，用来预测“好”后面的下一个字。这就是生成式 AI 的循环。",
      icon: <RefreshCw className="w-6 h-6 text-white" />
    }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-900 rounded-xl shadow-2xl overflow-hidden font-sans text-slate-200 border border-slate-700">
      
      {/* 头部标题 */}
      <div className="w-full p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500 w-6 h-6" />
          <h1 className="text-xl font-bold text-white">LLM 原理可视化：Next Token Prediction</h1>
        </div>
        <div className="text-sm text-slate-400">Step {step} / {totalSteps}</div>
      </div>

      {/* 主可视化区域 (SVG) */}
      <div className="w-full aspect-video bg-slate-950 relative overflow-hidden">
        {/* 背景网格装饰 */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <svg className="w-full h-full" viewBox="0 0 800 450">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* --- 区域 1: 输入层 (底部) --- */}
          <g transform="translate(100, 350)">
            <text x="-60" y="25" fill="#64748b" fontSize="14" fontWeight="bold">INPUT</text>
            {inputTokens.map((token, i) => (
              <g key={i} transform={`translate(${i * 120}, 0)`} className="transition-all duration-500">
                {/* Token Box */}
                <rect 
                  x="0" y="0" width="100" height="40" rx="6" 
                  fill={step >= 1 ? "#1e293b" : "transparent"} 
                  stroke={step >= 1 ? token.color : "transparent"}
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
                {/* Text */}
                <text 
                  x="50" y="25" textAnchor="middle" 
                  fill="white" fontSize="16" fontWeight="bold"
                  className="transition-opacity duration-500"
                  opacity={step >= 0 ? 1 : 0}
                >
                  {step >= 1 ? `${token.text} [${token.id}]` : token.text}
                </text>
                
                {/* Embedding Vector (Visualized as small blocks) */}
                <g transform="translate(10, -30)" opacity={step >= 2 ? 1 : 0} className="transition-opacity duration-700">
                   <rect x="0" y="0" width="15" height="15" fill={token.color} opacity="0.8" />
                   <rect x="22" y="0" width="15" height="15" fill={token.color} opacity="0.6" />
                   <rect x="44" y="0" width="15" height="15" fill={token.color} opacity="0.4" />
                   <rect x="66" y="0" width="15" height="15" fill={token.color} opacity="0.2" />
                </g>
              </g>
            ))}
          </g>

          {/* --- 区域 2: 神经网络/Attention 层 (中部) --- */}
          <g transform="translate(100, 200)" opacity={step >= 3 ? 1 : 0} className="transition-opacity duration-700">
             <text x="-60" y="55" fill="#64748b" fontSize="14" fontWeight="bold">MODEL</text>
            {/* Transformer Block Container */}
            <rect x="-20" y="0" width="400" height="100" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Attention Lines (Connecting inputs to the 'Processing' token) */}
            {inputTokens.slice(0, 3).map((token, i) => (
               <path 
                 key={`att-${i}`}
                 d={`M ${i * 120 + 50} 150 C ${i * 120 + 50} 100, 410 100, 410 80`} // Curves to the last token position
                 fill="none"
                 stroke={token.color}
                 strokeWidth={step === 3 ? (i + 1) * 1.5 : 0} // Dynamic width based on 'attention weight'
                 strokeDasharray={step === 3 ? "5,5" : "0,0"}
                 opacity={step === 3 ? 0.8 : 0}
                 className="transition-all duration-1000"
               >
                 {step === 3 && (
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                 )}
               </path>
            ))}
            
            {/* Processing Nodes inside Transformer */}
            {[0, 1, 2, 3].map(row => (
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => (
                    <circle 
                        key={`${row}-${col}`} 
                        cx={col * 38 + 10} cy={row * 25 + 12} r="3" 
                        fill={step >= 3 ? "#60A5FA" : "#334155"}
                        opacity={step >= 3 ? Math.random() * 0.5 + 0.5 : 0.2}
                    >
                        {step >= 3 && <animate attributeName="opacity" values="0.2;1;0.2" dur={`${Math.random() * 2 + 1}s`} repeatCount="indefinite" />}
                    </circle>
                ))
            ))}
          </g>

          {/* --- 区域 3: 输出概率层 (顶部) --- */}
          <g transform="translate(500, 50)" opacity={step >= 4 ? 1 : 0} className="transition-opacity duration-500">
            <text x="-60" y="80" fill="#64748b" fontSize="14" fontWeight="bold">OUTPUT</text>
            {predictions.map((pred, i) => (
              <g key={i} transform={`translate(0, ${i * 35})`}>
                {/* Text Label */}
                <text x="-10" y="15" textAnchor="end" fill="white" fontSize="14">{pred.text}</text>
                
                {/* Bar Background */}
                <rect x="5" y="0" width="200" height="20" fill="#1e293b" rx="4" />
                
                {/* Probability Bar */}
                <rect 
                  x="5" y="0" 
                  width={step >= 4 ? pred.prob * 200 : 0} 
                  height="20" 
                  fill={pred.color} 
                  rx="4"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Percentage */}
                <text x={215} y="15" fill="#94a3b8" fontSize="12">{(pred.prob * 100).toFixed(0)}%</text>
              </g>
            ))}

            {/* Final Selection Highlight */}
            {step >= 4 && (
                <rect x="-50" y="-5" width="310" height="30" fill="none" stroke="#10B981" strokeWidth="2" rx="4" strokeDasharray="4,4">
                    <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1s" repeatCount="indefinite" />
                </rect>
            )}
          </g>

          {/* 连接线: Model 到 Output */}
          <path 
            d="M 410 200 L 500 120" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth={step >= 4 ? 2 : 0} 
            markerEnd="url(#arrow)"
            className="transition-all duration-500"
          />

        </svg>
      </div>

      {/* 底部控制与解释面板 */}
      <div className="w-full bg-slate-800 p-6 border-t border-slate-700">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* 控制按钮 */}
          <div className="flex flex-row gap-3 shrink-0">
             <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? '暂停' : '自动演示'}
            </button>

            <div className="flex bg-slate-700 rounded-lg p-1">
              <button onClick={handlePrev} disabled={step === 0} className="p-2 hover:bg-slate-600 rounded disabled:opacity-30 transition-colors text-slate-300">
                <ChevronLeft size={20} />
              </button>
              <button onClick={reset} className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-300" title="重置">
                <RefreshCw size={18} />
              </button>
              <button onClick={handleNext} disabled={step === totalSteps} className="p-2 hover:bg-slate-600 rounded disabled:opacity-30 transition-colors text-slate-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* 解释文本 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-700 rounded-lg">
                {stepsInfo[step].icon}
              </div>
              <h3 className="text-lg font-bold text-white">{stepsInfo[step].title}</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {stepsInfo[step].desc}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LLMVisualize;
