
import React, { useEffect, useRef } from 'react';

export const Logo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseRef.current = { x, y };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const particles: { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      baseSize: number; 
      pulsePhase: number; 
      pulseSpeed: number;
      depth: number;
      color: string;
    }[] = [];
    
    // Increased particle count and dynamics
    const particleCount = 100; 
    const connectionDistance = 140;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (Math.min(width, height) * 0.5);
      
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * (radius * 0.7),
        vx: (Math.random() - 0.5) * 1.5, // Faster base speed
        vy: (Math.random() - 0.5) * 1.5,
        baseSize: Math.random() * 2.0 + 1.0,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.08 + Math.random() * 0.08,
        depth: 0.5 + Math.random() * 2.0,
        color: Math.random() > 0.6 ? '#06b6d4' : '#3b82f6', // Cyan and Blue
      });
    }

    let animationFrameId: number;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;
      
      currentMouseX += (mouseRef.current.x - currentMouseX) * 0.1;
      currentMouseY += (mouseRef.current.y - currentMouseY) * 0.1;

      // Global rotation effect based on mouse
      const rotation = currentMouseX * 0.0005;

      particles.forEach((p, i) => {
        // Orbit physics
        const dx = p.x - width / 2;
        const dy = p.y - height / 2;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Swirling force
        p.vx += -dy * 0.0001;
        p.vy += dx * 0.0001;

        // Mouse repulsion/attraction
        const mdx = p.x - (width/2 + currentMouseX);
        const mdy = p.y - (height/2 + currentMouseY);
        const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
        if (mdist < 200) {
            const force = (200 - mdist) / 200;
            p.vx += (mdx / mdist) * force * 0.5;
            p.vy += (mdy / mdist) * force * 0.5;
        }

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounds soft containment
        const distFromCenter = Math.sqrt((p.x - width/2)**2 + (p.y - height/2)**2);
        if (distFromCenter > Math.min(width, height) * 0.5) {
            const angleToCenter = Math.atan2(height/2 - p.y, width/2 - p.x);
            p.vx += Math.cos(angleToCenter) * 0.1;
            p.vy += Math.sin(angleToCenter) * 0.1;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.pulsePhase += p.pulseSpeed;
        const pulseFactor = (Math.sin(p.pulsePhase) + 1) / 2;
        
        const currentSize = p.baseSize + (p.baseSize * 0.5 * pulseFactor);
        const currentAlpha = 0.3 + (0.7 * pulseFactor);

        // Parallax
        const parallaxX = -currentMouseX * p.depth * 0.05;
        const parallaxY = -currentMouseY * p.depth * 0.05;
        
        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;

        // Draw Particle
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 10 * pulseFactor;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2ParallaxX = -currentMouseX * p2.depth * 0.05;
          const p2ParallaxY = -currentMouseY * p2.depth * 0.05;
          const p2DrawX = p2.x + p2ParallaxX;
          const p2DrawY = p2.y + p2ParallaxY;

          const pdx = drawX - p2DrawX;
          const pdy = drawY - p2DrawY;
          const distance = Math.sqrt(pdx * pdx + pdy * pdy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(p2DrawX, p2DrawY);
            const alpha = (1 - (distance / connectionDistance)) * 0.2;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="group relative w-[400px] h-[350px] flex items-center justify-center transition-all duration-500 ease-out cursor-pointer">
      {/* Network Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0 opacity-90 transition-opacity duration-500"
      />

      <div className="relative z-10 flex flex-col items-center gap-10 pointer-events-none">
        {/* The Central Rotating Structure - Improved Dynamics */}
        <div className="relative w-40 h-40">
          
          {/* Outer Ring - Fast Spin */}
          <div className="absolute inset-0 rounded-full border-[2px] border-cyan-500/40 border-t-cyan-400 border-l-transparent animate-[spin_3s_linear_infinite] shadow-[0_0_30px_rgba(6,182,212,0.2)]"></div>
          
          {/* Middle Ring - Reverse Axis */}
          <div className="absolute inset-3 rounded-full border-[2px] border-blue-500/30 border-b-blue-400 border-r-transparent animate-[spin_5s_linear_infinite_reverse]"></div>

          {/* Inner Gyro - 3D feel */}
          <div className="absolute inset-8 rounded-full border border-indigo-400/40 animate-[pulse_2s_ease-in-out_infinite]">
             <div className="absolute inset-0 rounded-full border-r-2 border-r-indigo-400 animate-[spin_1.5s_linear_infinite] opacity-70"></div>
          </div>

          {/* Core */}
          <div className="absolute inset-[60px] rounded-full bg-gradient-to-br from-white to-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.6)] animate-pulse">
          </div>
        </div>

        {/* PapaData Text - Ensure tight tracking and no space between spans */}
        <div className="flex items-center font-['Inter'] tracking-tight select-none z-20 bg-slate-950/30 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-800/50">
            <span className="text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">Papa</span><span className="text-5xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">Data</span>
        </div>
      </div>
    </div>
  );
};

export const PDIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center select-none">
      <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
        <text 
            x="10" 
            y="65" 
            fontSize="60" 
            fontFamily="Inter, sans-serif" 
            fontWeight="800" 
            fill="white"
            className="animate-[pulse_3s_ease-in-out_infinite]"
        >
            P
        </text>
        <text 
            x="55" 
            y="65" 
            fontSize="60" 
            fontFamily="Inter, sans-serif" 
            fontWeight="800" 
            fill="#22d3ee"
            className="animate-[pulse_3s_ease-in-out_infinite_0.5s]"
        >
            D
        </text>
      </svg>
    </div>
  );
};
