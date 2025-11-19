"use client"
import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Database, 
  FolderOpen, 
  Github, 
  Zap, 
  FileText, 
  Wrench, 
  Cable, 
  ArrowRightLeft, 
  Box,
  Search
} from 'lucide-react';

// 定义 MCP 服务器数据源
const SERVERS = [
  { 
    id: 'github', 
    name: "GitHub Server", 
    icon: Github, 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/30",
    desc: "Issues & PRs",
    tool: "get_issue",
    toolIcon: Wrench
  },
  { 
    id: 'postgres', 
    name: "Postgres DB", 
    icon: Database, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30",
    desc: "SQL Query",
    tool: "query_db",
    toolIcon: Search
  },
  { 
    id: 'filesystem', 
    name: "Filesystem", 
    icon: FolderOpen, 
    color: "text-amber-500", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/30",
    desc: "Local Files",
    tool: "read_file",
    toolIcon: FileText
  }
];

// 动画阶段常量
const PHASES = {
  CONNECTING: 'CONNECTING',     // 建立连接
  CAPABILITIES: 'CAPABILITIES', // 交换能力
  REQUEST: 'REQUEST',           // 发起请求
  RESPONSE: 'RESPONSE',         // 返回响应
  SWITCHING: 'SWITCHING'        // 切换服务器
};

type Phase = (typeof PHASES)[keyof typeof PHASES];
type PacketDirection = 'c2s' | 's2c';
type PacketType = 'request' | 'response' | 'tool' | 'resource' | 'prompt';
type LogType = 'info' | 'neutral' | 'success' | 'purple';

type PacketData = {
  id: number;
  type: PacketType;
  direction: PacketDirection;
  icon: React.ComponentType<{ className?: string }>;
};

type LogEntry = {
  id: number;
  text: string;
  type: LogType;
};

export default function MCPVisualizer() {

  const [phase, setPhase] = useState<Phase>(PHASES.CONNECTING);
  const [serverIndex, setServerIndex] = useState(0);
  const [packets, setPackets] = useState<PacketData[]>([]); // 存储飞行中的数据包
  const [logs, setLogs] = useState<LogEntry[]>([]); // 底部日志

  const currentServer = SERVERS[serverIndex];

  // 添加日志辅助函数
  const addLog = (text: string, type: LogType = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 3));
  };

  // 主循环状态机
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const runPhase = () => {
      switch (phase) {
        case PHASES.CONNECTING:
          addLog(`正在连接至 ${currentServer.name}...`, 'neutral');
          timeout = setTimeout(() => {
            setPhase(PHASES.CAPABILITIES);
          }, 1500); // 连接动画耗时
          break;

        case PHASES.CAPABILITIES:
          addLog("握手成功：获取工具与资源列表", 'success');
          // 发射能力数据包 (从右向左)
          emitPackets(['resource', 'prompt', 'tool'], 's2c');
          timeout = setTimeout(() => {
            setPhase(PHASES.REQUEST);
          }, 2500);
          break;

        case PHASES.REQUEST:
          addLog(`Host 调用工具: ${currentServer.tool}()`, 'purple');
          // 发射请求数据包 (从左向右)
          emitPackets(['request'], 'c2s');
          timeout = setTimeout(() => {
            setPhase(PHASES.RESPONSE);
          }, 2000);
          break;

        case PHASES.RESPONSE:
          addLog(`Server 返回数据: ${currentServer.desc}`, 'success');
          // 发射响应数据包 (从右向左)
          emitPackets(['response'], 's2c');
          timeout = setTimeout(() => {
            setPhase(PHASES.SWITCHING);
          }, 2000);
          break;

        case PHASES.SWITCHING:
          addLog("断开连接，切换数据源...", 'neutral');
          timeout = setTimeout(() => {
            setServerIndex((prev) => (prev + 1) % SERVERS.length);
            setPackets([]); // 清空数据包
            setPhase(PHASES.CONNECTING);
          }, 1500); // 断开动画耗时
          break;
        
        default:
          break;
      }
    };

    runPhase();
    return () => clearTimeout(timeout);
  }, [phase, serverIndex]);

  // 发射数据包逻辑
  const emitPackets = (types: PacketType[], direction: PacketDirection) => {
    types.forEach((type, index) => {
      setTimeout(() => {
        const newPacket = {
          id: Date.now() + index,
          type,
          direction, // 'c2s' (Client to Server) or 's2c' (Server to Client)
          icon: getPacketIcon(type),
        };
        setPackets(prev => [...prev, newPacket]);
        
        // 动画结束后清理
        setTimeout(() => {
          setPackets(prev => prev.filter(p => p.id !== newPacket.id));
        }, 1000);
      }, index * 300);
    });
  };

  const getPacketIcon = (type: PacketType): React.ComponentType<{ className?: string }> => {
    switch(type) {
      case 'request': return Zap;
      case 'response': return Box;
      case 'tool': return Wrench;
      case 'resource': return FileText;
      case 'prompt': return ArrowRightLeft;
      default: return Box;
    }
  };

  // 渲染
  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex flex-col relative">
      
      {/* Header / Legend */}
      <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          MCP 原理可视化
        </h1>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Host (AI Client / IDE)</span>
          </div>
          <div className="flex items-center gap-2">
            <Cable className="w-4 h-4 text-purple-400" />
            <span>Protocol (JSON-RPC)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${currentServer.border} ${currentServer.color}`}>
              <currentServer.icon className="w-3 h-3" />
            </div>
            <span>Server (Data Source)</span>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex items-center justify-center relative">
        
        {/* --- Left: Host (Client) --- */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-48">
          <div className="w-24 h-24 bg-slate-900 rounded-2xl border-2 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center justify-center relative">
            <Monitor className="w-10 h-10 text-blue-400" />
            {/* Host Pulse */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-20"></div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-100">AI Client</div>
            <div className="text-xs text-slate-500">Claude / Cursor / IDE</div>
          </div>
        </div>

        {/* --- Middle: Connection Pipe --- */}
        <div className="w-96 h-20 relative flex items-center mx-4">
          {/* Background Pipe Track */}
          <div className="absolute left-0 right-0 h-2 bg-slate-800 rounded-full overflow-hidden">
             {/* Connection Progress Bar */}
             <div 
                className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-[1500ms] ease-in-out ${
                  phase === PHASES.CONNECTING || phase === PHASES.SWITCHING 
                    ? (phase === PHASES.SWITCHING ? 'w-0 opacity-50' : 'w-full opacity-100') 
                    : 'w-full'
                }`}
             />
          </div>

          {/* Connection Plug Head (Moving part) */}
          <div 
             className={`absolute h-6 w-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-[1500ms] ease-in-out flex items-center justify-center z-20
             ${phase === PHASES.SWITCHING ? 'left-0' : 'left-[98%]'}`}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>

          {/* Packets Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
             {packets.map(pkt => (
               <Packet key={pkt.id} data={pkt} />
             ))}
          </div>

          {/* Protocol Label */}
          <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono text-purple-400 transition-opacity duration-500 ${phase === PHASES.CONNECTING || phase === PHASES.SWITCHING ? 'opacity-0' : 'opacity-100'}`}>
            MCP Protocol
          </div>
        </div>

        {/* --- Right: Server (Data Source) --- */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-48">
          {/* Server Container with transition */}
          <div 
            className={`w-24 h-24 rounded-2xl border-2 transition-all duration-700 flex items-center justify-center relative shadow-2xl
              ${phase === PHASES.SWITCHING ? 'translate-x-10 opacity-0 scale-90' : 'translate-x-0 opacity-100 scale-100'}
              ${currentServer.border} ${currentServer.bg}
            `}
          >
            <currentServer.icon className={`w-10 h-10 ${currentServer.color}`} />
            
            {/* Capabilities Tags (Only show when connected) */}
            <div className={`absolute -right-32 top-0 flex flex-col gap-2 transition-all duration-500 ${phase === PHASES.CONNECTING || phase === PHASES.SWITCHING ? 'opacity-0 translate-x-[-10px]' : 'opacity-100 translate-x-0'}`}>
               <Badge text="Tools" color="bg-pink-500/20 text-pink-300" delay={100} />
               <Badge text="Prompts" color="bg-purple-500/20 text-purple-300" delay={200} />
               <Badge text="Resources" color="bg-blue-500/20 text-blue-300" delay={300} />
            </div>

          </div>
          
          <div className={`text-center transition-opacity duration-500 ${phase === PHASES.SWITCHING ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`font-bold ${currentServer.color}`}>{currentServer.name}</div>
            <div className="text-xs text-slate-500">{currentServer.desc}</div>
          </div>
        </div>

      </div>

      {/* Bottom Log / Status */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96">
        <div className="flex flex-col gap-2 items-center">
          {logs.map((log, i) => (
            <div 
              key={log.id}
              className={`px-4 py-2 rounded-full text-sm backdrop-blur-md border shadow-lg transition-all duration-500
                ${i === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-40 scale-90 translate-y-4 absolute bottom-0 -z-10'}
                ${log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 
                  log.type === 'purple' ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' :
                  'bg-slate-800/50 border-slate-700 text-slate-300'}
              `}
            >
              {log.text}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Sub-component: Moving Packet
function Packet({ data }: { data: PacketData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger CSS transition after mount
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // c2s: Client to Server (Left -> Right)
  // s2c: Server to Client (Right -> Left)
  const startPos = data.direction === 'c2s' ? 'left-0' : 'left-[95%]';
  const endPos = data.direction === 'c2s' ? 'left-[95%]' : 'left-0';

  return (
    <div 
      className={`absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear z-30
        ${mounted ? endPos : startPos}
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border
        ${data.direction === 'c2s' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-purple-500 text-purple-300'}
      `}>
        <data.icon className="w-5 h-5" />
      </div>
    </div>
  );
}

// Sub-component: Simple Badge
function Badge({ text, color, delay = 0 }: { text: string; color: string; delay?: number }) {
  return (
    <div className={`text-xs px-2 py-1 rounded border ${color} animate-in fade-in slide-in-from-left-4 duration-500`} style={{ animationDelay: `${delay}ms` }}>
      {text}
    </div>
  );
}
