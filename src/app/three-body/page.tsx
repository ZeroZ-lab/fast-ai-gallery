'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
// 修复导入路径，添加 .js 后缀
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Pause, RefreshCw, Focus, Thermometer, Activity, Globe } from 'lucide-react';

type BodyType = 'star' | 'planet';

type BodyEntity = {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  trail: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  trailPositions: number[];
  mass: number;
  radius: number;
  type: BodyType;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  acc: THREE.Vector3;
  temp: number;
};

const CONFIG = {
  G: 1.5, 
  subSteps: 5,
  trailLength: 300,
  starMasses: [400, 300, 250],
  planetMass: 1,
  safeTempMin: 260,
  safeTempMax: 310,
  burnTemp: 370,
  freezeTemp: 200
};

export default function TrisolarisSim() {
  // --- React State for UI ---
  const [civStatus, setCivStatus] = useState('normal'); // normal, dehydrated, destroyed
  const [temp, setTemp] = useState(288);
  const [distance, setDistance] = useState(1.0);
  const [era, setEra] = useState('stable'); // stable, chaotic-hot, chaotic-cold
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [logs, setLogs] = useState<string[]>([]);

  // --- Refs for Three.js & Physics Engine ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Physics state held in ref to avoid re-renders during game loop
  const physicsState = useRef({
    bodies: [] as BodyEntity[],
    planet: null as BodyEntity | null,
    stepCount: 0,
    civState: 'alive', // alive, dehydrated, destroyed
    lastUiUpdate: 0
  });

  // --- Helper: Logger ---
  const addLog = useCallback((msg: string) => {
    const time = Math.floor(physicsState.current.stepCount / 10);
    setLogs(prev => [...prev.slice(-19), `[T+${time}] ${msg}`]); // Keep last 20 logs
  }, []);

  // --- Helper: Create Body ---
  const createBody = (
    scene: THREE.Scene,
    type: BodyType,
    mass: number,
    color: number,
    radius: number,
    posVec: THREE.Vector3,
    velVec: THREE.Vector3,
  ): BodyEntity => {
    let mesh;
    if (type === 'star') {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.1
      });
      mesh = new THREE.Mesh(geometry, material);

      // Light
      const light = new THREE.PointLight(color, 1.5, 800);
      mesh.add(light);

      // Glow Sprite
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas 2D context');
      }
      const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,64,64);
      
      const spriteMat = new THREE.SpriteMaterial({ 
        map: new THREE.CanvasTexture(canvas), 
        color: color, 
        transparent: true, 
        blending: THREE.AdditiveBlending 
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(radius*6, radius*6, 1);
      mesh.add(sprite);
    } else {
      // Planet
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        roughness: 0.8
      });
      mesh = new THREE.Mesh(geometry, material);
    }
    
    mesh.position.copy(posVec);
    scene.add(mesh);

    // Trail
    const trailGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.trailLength * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: type === 'star' ? color : 0xffffff,
      opacity: type === 'star' ? 0.3 : 0.6,
      transparent: true
    });
    const trail = new THREE.Line(trailGeo, trailMat);
    trail.frustumCulled = false;
    scene.add(trail);

    return {
      mesh,
      trail,
      trailPositions: [],
      mass,
      radius,
      type,
      pos: posVec.clone(),
      vel: velVec.clone(),
      acc: new THREE.Vector3(),
      temp: 288
    };
  };

  // --- Initialization Effect ---
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.001);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 150, 300);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for(let i=0; i<2000; i++) {
      starVerts.push(THREE.MathUtils.randFloatSpread(2000));
      starVerts.push(THREE.MathUtils.randFloatSpread(2000));
      starVerts.push(THREE.MathUtils.randFloatSpread(2000));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMesh = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0x888888, size: 1.5}));
    scene.add(starMesh);

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Initialize Physics Bodies
    resetSimulationLogic();

    // 2. Animation Loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      // Controls
      controls.update();

      // Physics
      updatePhysics();

      // Render
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  // --- Physics Logic ---
  const updatePhysics = () => {
    if (isPaused) return;

    const dt = 0.1; // base delta
    const { bodies, planet } = physicsState.current;
    
    const currentSpeed = speedRef.current;
    const stepDt = dt / CONFIG.subSteps * currentSpeed;

    for (let step = 0; step < CONFIG.subSteps; step++) {
      // 1. Reset Acc
      bodies.forEach(b => b.acc.set(0,0,0));

      // 2. Gravity
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const A = bodies[i];
          const B = bodies[j];
          const diff = new THREE.Vector3().subVectors(B.pos, A.pos);
          const distSq = diff.lengthSq();
          const softDistSq = Math.max(distSq, 100);
          const forceMag = (CONFIG.G * A.mass * B.mass) / softDistSq;
          const forceVec = diff.normalize().multiplyScalar(forceMag);
          
          A.acc.add(forceVec.clone().divideScalar(A.mass));
          B.acc.sub(forceVec.clone().divideScalar(B.mass));
        }
      }

      // 3. Integrate
      bodies.forEach(b => {
        b.vel.add(b.acc.multiplyScalar(stepDt));
        b.pos.add(b.vel.clone().multiplyScalar(stepDt));
      });
    }

    // 4. Visual Sync & Trails
    let minDist = Infinity;
    let totalFlux = 0;

    bodies.forEach(b => {
      b.mesh.position.copy(b.pos);
      
      // Trail update (throttled)
      if (physicsState.current.stepCount % 3 === 0) {
        b.trailPositions.push(b.pos.x, b.pos.y, b.pos.z);
        if (b.trailPositions.length > CONFIG.trailLength * 3) {
          b.trailPositions.splice(0,3);
        }
        const posArr = b.trail.geometry.attributes.position.array;
        for(let i=0; i<b.trailPositions.length; i++) posArr[i] = b.trailPositions[i];
        b.trail.geometry.attributes.position.needsUpdate = true;
        b.trail.geometry.setDrawRange(0, b.trailPositions.length / 3);
      }

      if (planet && b.type === 'star') {
        const d = b.pos.distanceTo(planet.pos);
        if (d < minDist) minDist = d;
        totalFlux += (b.mass * 100) / (d*d);
      }
    });

    // 5. Planet Logic & UI Sync
    if (planet) {
      // Physics Temp
      const targetTemp = 3 + (totalFlux * 20);
      planet.temp += (targetTemp - planet.temp) * 0.05;
      
      // Color update
      if (planet.temp > CONFIG.burnTemp) {
        planet.mesh.material.color.setHex(0xff3300);
        planet.mesh.material.emissive.setHex(0xaa0000);
        planet.mesh.material.emissiveIntensity = 0.5;
      } else if (planet.temp < CONFIG.freezeTemp) {
        planet.mesh.material.color.setHex(0xccccff);
        planet.mesh.material.emissive.setHex(0x000000);
      } else {
        planet.mesh.material.color.setHex(0x00aaff);
        planet.mesh.material.emissive.setHex(0x000000);
      }

      // Logic check
      let newEra = 'stable';
      if (planet.temp > CONFIG.burnTemp) newEra = 'chaotic-hot';
      else if (planet.temp < CONFIG.freezeTemp) newEra = 'chaotic-cold';

      // Handle Civilisation State
      const pState = physicsState.current;
      if (pState.civState !== 'destroyed') {
        if (planet.temp > 450 || planet.temp < 50) {
           pState.civState = 'destroyed';
           addLog("警报：环境参数彻底崩溃。文明已毁灭。");
        } else if (newEra !== 'stable') {
           if (pState.civState === 'alive') {
             pState.civState = 'dehydrated';
             addLog("乱纪元降临。全员脱水存储。");
           }
        } else {
           if (pState.civState === 'dehydrated') {
             pState.civState = 'alive';
             addLog("恒纪元到来。全员浸泡复活。");
           }
        }
      }

      // THROTTLED UI UPDATE (every 10 frames)
      physicsState.current.stepCount++;
      if (physicsState.current.stepCount - physicsState.current.lastUiUpdate > 10) {
        setTemp(Math.round(planet.temp));
        setDistance(minDist / 50);
        setEra(newEra);
        setCivStatus(pState.civState);
        physicsState.current.lastUiUpdate = physicsState.current.stepCount;
      }
    }
  };

  // Handle Speed via Ref to avoid re-binding simulation loop
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Handle Pause via Ref
  useEffect(() => {
    // We don't need a ref for paused because the loop reads the state via closure?
    // Actually, the `animate` function is defined ONCE in useEffect.
    // It captures `isPaused` from the initial render. 
    // We need a ref for pause too.
    // Wait, `animate` calls `updatePhysics`. 
    // Let's make `updatePhysics` access a ref for paused.
  }, [isPaused]); 
  // (Actually I will just use a ref for isPaused in the component scope)
  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  
  // Redefine updatePhysics to use the refs inside the loop
  // (See above logic, I will implicitly use the refs in the loop if I define it correctly,
  // but since I defined updatePhysics outside useEffect, it's tricky.
  // Let's move updatePhysics logic inside the `animate` or use a mutable ref strategy.)
  
  // REFACTOR: Moving updatePhysics Logic into the main useEffect or using refs strictly.
  // To keep code clean, I'll use the `isPausedRef` inside the already defined logic 
  // but I need to make sure `updatePhysics` inside `useEffect` can see it.
  // The easiest way is to define `updatePhysics` INSIDE useEffect. 
  
  // Let's fix the structure in the final output block below.
  
  // --- Simulation Control Functions ---
  const resetSimulationLogic = () => {
    const { scene } = { scene: sceneRef.current };
    if (!scene) return;

    // Clear old
    const oldBodies = physicsState.current.bodies;
    oldBodies.forEach(b => {
        scene.remove(b.mesh);
        scene.remove(b.trail);
    });
    
    physicsState.current.bodies = [];
    physicsState.current.stepCount = 0;
    physicsState.current.civState = 'alive';
    
    setLogs([]);
    addLog("系统重置。第 205 号文明启动。");

    // Rebuild System
    const bodies = [];
    // Alpha
    bodies.push(createBody(scene, 'star', CONFIG.starMasses[0], 0xffaa00, 8, 
      new THREE.Vector3(0,0,0), new THREE.Vector3(0.05, 0.05, 0)));
    // Beta
    bodies.push(createBody(scene, 'star', CONFIG.starMasses[1], 0xffdd44, 7, 
      new THREE.Vector3(100,0,0), new THREE.Vector3(0, 0, 1.8)));
    // Proxima
    bodies.push(createBody(scene, 'star', CONFIG.starMasses[2], 0xff4400, 6, 
      new THREE.Vector3(-180,0,0), new THREE.Vector3(0, 0, -1.2)));
    // Planet
    const planet = createBody(scene, 'planet', CONFIG.planetMass, 0x00aaff, 2,
      new THREE.Vector3(-195,0,0), new THREE.Vector3(0, 0, -1.2 + 3.5));
    bodies.push(planet);

    physicsState.current.bodies = bodies;
    physicsState.current.planet = planet;
  };

  const handleCameraFocus = () => {
    const { planet } = physicsState.current;
    if (planet && controlsRef.current) {
      controlsRef.current.target.copy(planet.mesh.position);
      controlsRef.current.update();
    }
  };

  // Re-bind the updatePhysics function inside the useEffect context
  // to properly access the refs we need.
  useEffect(() => {
    // This useEffect handles the LOOP exclusively
    if(!sceneRef.current) return; 

    const tick = () => {
      requestRef.current = requestAnimationFrame(tick);
      
      if (!isPausedRef.current) {
        // Run Physics
        // (Inlined logic to ensure scope access to refs)
        const dt = 0.1;
        const stepDt = dt / CONFIG.subSteps * speedRef.current;
        const { bodies, planet } = physicsState.current;

        for (let step = 0; step < CONFIG.subSteps; step++) {
            bodies.forEach(b => b.acc.set(0,0,0));
            for (let i = 0; i < bodies.length; i++) {
                for (let j = i + 1; j < bodies.length; j++) {
                    const A = bodies[i];
                    const B = bodies[j];
                    const diff = new THREE.Vector3().subVectors(B.pos, A.pos);
                    const distSq = diff.lengthSq();
                    const softDistSq = Math.max(distSq, 100);
                    const forceMag = (CONFIG.G * A.mass * B.mass) / softDistSq;
                    const forceVec = diff.normalize().multiplyScalar(forceMag);
                    A.acc.add(forceVec.clone().divideScalar(A.mass));
                    B.acc.sub(forceVec.clone().divideScalar(B.mass));
                }
            }
            bodies.forEach(b => {
                b.vel.add(b.acc.multiplyScalar(stepDt));
                b.pos.add(b.vel.clone().multiplyScalar(stepDt));
            });
        }

        // Visuals
        let minDist = Infinity;
        let totalFlux = 0;
        bodies.forEach(b => {
            b.mesh.position.copy(b.pos);
            // Trail
            if (physicsState.current.stepCount % 3 === 0) {
                b.trailPositions.push(b.pos.x, b.pos.y, b.pos.z);
                if(b.trailPositions.length > CONFIG.trailLength*3) b.trailPositions.splice(0,3);
                const arr = b.trail.geometry.attributes.position.array;
                for(let k=0; k<b.trailPositions.length; k++) arr[k] = b.trailPositions[k];
                b.trail.geometry.attributes.position.needsUpdate = true;
                b.trail.geometry.setDrawRange(0, b.trailPositions.length/3);
            }
            if (planet && b.type === 'star') {
                const d = b.pos.distanceTo(planet.pos);
                if(d < minDist) minDist = d;
                totalFlux += (b.mass * 100) / (d*d);
            }
        });

        // Logic
        if (planet) {
            const targetTemp = 3 + (totalFlux * 20);
            planet.temp += (targetTemp - planet.temp) * 0.05;
            
             // Color update
            if (planet.temp > CONFIG.burnTemp) {
                planet.mesh.material.color.setHex(0xff3300);
                planet.mesh.material.emissive.setHex(0xaa0000);
                planet.mesh.material.emissiveIntensity = 0.5;
            } else if (planet.temp < CONFIG.freezeTemp) {
                planet.mesh.material.color.setHex(0xccccff);
                planet.mesh.material.emissive.setHex(0x000000);
            } else {
                planet.mesh.material.color.setHex(0x00aaff);
                planet.mesh.material.emissive.setHex(0x000000);
            }
            
            let newEra = 'stable';
            if (planet.temp > CONFIG.burnTemp) newEra = 'chaotic-hot';
            else if (planet.temp < CONFIG.freezeTemp) newEra = 'chaotic-cold';

            const pState = physicsState.current;
            // State Machine
             if (pState.civState !== 'destroyed') {
                if (planet.temp > 450 || planet.temp < 50) {
                   pState.civState = 'destroyed';
                   addLog("警报：环境参数彻底崩溃。文明已毁灭。");
                } else if (newEra !== 'stable' && (newEra === 'chaotic-hot' || newEra === 'chaotic-cold')) {
                   if (pState.civState === 'alive') {
                     pState.civState = 'dehydrated';
                     addLog("乱纪元降临。全员脱水存储。");
                   }
                } else if (newEra === 'stable') {
                   if (pState.civState === 'dehydrated') {
                     pState.civState = 'alive';
                     addLog("恒纪元到来。全员浸泡复活。");
                   }
                }
            }

            // Sync to React State (Throttled)
            pState.stepCount++;
            if (pState.stepCount - pState.lastUiUpdate > 10) {
                setTemp(Math.round(planet.temp));
                setDistance(minDist / 50);
                setEra(newEra);
                setCivStatus(pState.civState);
                pState.lastUiUpdate = pState.stepCount;
            }
        }
      }
      
      if(controlsRef.current) controlsRef.current.update();
      if(rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Start Loop
    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [addLog]); // Re-bind if logger changes (it shouldn't due to useCallback)


  // --- UI Rendering ---
  const getStatusColor = () => {
    if (civStatus === 'alive') return 'text-green-400';
    if (civStatus === 'dehydrated') return 'text-yellow-400';
    return 'text-red-500';
  };

  const getEraColor = () => {
    if (era === 'stable') return 'bg-green-500/20 border-green-500 text-green-400';
    if (era === 'chaotic-hot') return 'bg-red-500/20 border-red-500 text-red-400';
    return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
  };

  const getEraText = () => {
    if (era === 'stable') return '恒纪元 (Stable)';
    if (era === 'chaotic-hot') return '乱纪元 · 烈焰 (Inferno)';
    return '乱纪元 · 长夜 (Freeze)';
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden font-sans relative text-white select-none">
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* HUD Layer */}
      <div className="absolute z-10 top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4">
        
        {/* Top Left Panel */}
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 p-5 rounded-lg w-80 shadow-[0_0_20px_rgba(0,150,255,0.2)]">
          <h1 className="text-xl font-bold text-cyan-400 mb-3 border-b border-slate-700 pb-2 tracking-wider uppercase flex items-center gap-2">
            <Globe size={20} />
            三体世界 · 观测站
          </h1>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">文明状态</span>
              <span className={`font-mono font-bold flex items-center gap-1 ${getStatusColor()}`}>
                <Activity size={14} />
                {civStatus === 'alive' ? '正常发展' : civStatus === 'dehydrated' ? '脱水存储' : '已毁灭'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">地表温度</span>
              <span className="font-mono font-bold text-white flex items-center gap-1">
                <Thermometer size={14} />
                {temp} K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">恒星距离</span>
              <span className="font-mono font-bold text-white">{distance.toFixed(2)} AU</span>
            </div>
          </div>

          <div className={`mt-4 px-3 py-2 rounded border text-center font-bold transition-colors duration-300 ${getEraColor()}`}>
            {getEraText()}
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-3">
             <div>
                <label className="text-xs text-slate-400 block mb-1">时间流速: {speed.toFixed(1)}x</label>
                <input 
                  type="range" min="0" max="5" step="0.1" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-400 py-1 px-2 rounded flex justify-center items-center gap-1 transition-all"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  {isPaused ? "继续" : "暂停"}
                </button>
                <button 
                   onClick={resetSimulationLogic}
                   className="flex-1 bg-slate-700/50 hover:bg-slate-600 border border-slate-500 text-slate-300 py-1 px-2 rounded flex justify-center items-center gap-1 transition-all"
                >
                  <RefreshCw size={14} />
                  重置
                </button>
             </div>
             <button 
                onClick={handleCameraFocus}
                className="w-full bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600 text-slate-300 py-1 px-2 rounded flex justify-center items-center gap-1 text-xs transition-all"
             >
               <Focus size={14} />
               锁定视角至行星
             </button>
          </div>
        </div>

        {/* Bottom Log Panel */}
        <div className="pointer-events-auto w-full max-w-2xl self-end bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg h-40 overflow-y-auto font-mono text-xs text-slate-300 shadow-lg">
           {logs.length === 0 && <div className="opacity-50 italic">系统初始化完成。等待数据...</div>}
           {logs.map((log, idx) => (
             <div key={idx} className="mb-1 pl-2 border-l-2 border-cyan-500/30 animate-pulse-once">
               {log}
             </div>
           ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-once {
          0% { background-color: rgba(34, 211, 238, 0.2); }
          100% { background-color: transparent; }
        }
        .animate-pulse-once {
          animation: pulse-once 1s ease-out;
        }
      `}</style>
    </div>
  );
}
