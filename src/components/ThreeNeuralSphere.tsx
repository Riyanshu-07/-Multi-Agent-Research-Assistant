import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '../theme';

interface ThreeNeuralSphereProps {
  isLoading: boolean;
  currentStep: number;
  theme: ThemeConfig;
  className?: string;
  compact?: boolean;
}

export const ThreeNeuralSphere: React.FC<ThreeNeuralSphereProps> = ({
  isLoading,
  currentStep,
  theme,
  className = '',
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback2D, setUseFallback2D] = useState(false);

  // Fallback 2D Interactive Holographic Sphere (Runs 100% reliably anywhere without WebGL)
  useEffect(() => {
    if (!useFallback2D) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotX = 0.2;
    let rotY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Generate 3D nodes
    const nodeCount = compact ? 65 : 110;
    const radius = compact ? 60 : 85;
    const nodes: Array<{ x: number; y: number; z: number }> = [];

    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      nodes.push({
        x: Math.cos(theta) * rAtY * radius,
        y: y * radius,
        z: Math.sin(theta) * rAtY * radius,
      });
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevMouseX) * 0.01;
      rotX += (e.clientY - prevMouseY) * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    const container = containerRef.current;
    container?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let t = 0;
    const render = () => {
      t += 0.016;
      if (!isDragging) {
        rotY += isLoading ? 0.025 : 0.008;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Project nodes with 3D rotation
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected = nodes.map((n) => {
        // Rotate Y
        let x1 = n.x * cosY + n.z * sinY;
        let z1 = -n.x * sinY + n.z * cosY;
        // Rotate X
        let y2 = n.y * cosX - z1 * sinX;
        let z2 = n.y * sinX + z1 * cosX;

        const fov = 280;
        const scale = fov / (fov + z2 + 100);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      });

      // Draw faint lines between close nodes
      ctx.strokeStyle = `${theme.dotColor}25`;
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i += 2) {
        for (let j = i + 1; j < Math.min(i + 6, projected.length); j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.hypot(dx, dy);
          if (dist < 38) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.2, (p.pz + radius) / (radius * 2));
        ctx.fillStyle = theme.dotColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1.2, 2.8 * p.scale), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw orbiting satellites
      const satellites = 4;
      for (let s = 0; s < satellites; s++) {
        const angle = t * 1.5 + (s * Math.PI) / 2;
        const satR = radius * 1.25;
        const sx = Math.cos(angle) * satR;
        const sz = Math.sin(angle) * satR;
        const sy = Math.sin(angle * 2) * (radius * 0.35);

        let sx1 = sx * cosY + sz * sinY;
        let sz1 = -sx * sinY + sz * cosY;
        let sy2 = sy * cosX - sz1 * sinX;
        let sz2 = sy * sinX + sz1 * cosX;

        const scale = 280 / (280 + sz2 + 100);
        const px = cx + sx1 * scale;
        const py = cy + sy2 * scale;

        const isCurrent = isLoading && currentStep === s + 1;
        ctx.fillStyle = isCurrent ? '#ffffff' : theme.secondaryDotColor;
        ctx.beginPath();
        ctx.arc(px, py, isCurrent ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing glow for current active satellite
        if (isCurrent) {
          ctx.strokeStyle = theme.dotColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 9 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      container?.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [useFallback2D, theme.dotColor, theme.secondaryDotColor, isLoading, currentStep, compact]);

  // Primary WebGL Attempt with full try-catch safety
  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability first
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setUseFallback2D(true);
        return;
      }
    } catch {
      setUseFallback2D(true);
      return;
    }

    let renderer: any = null;
    let animId: number = 0;
    let cleanupFn: (() => void) | null = null;

    // Dynamically load Three.js safely
    import('three')
      .then((THREE) => {
        if (!isMounted || !container) return;

        try {
          const width = Math.max(container.clientWidth || 300, 100);
          const height = Math.max(container.clientHeight || 220, 100);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
          camera.position.z = compact ? 190 : 160;

          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'default',
          });

          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          container.appendChild(renderer.domElement);

          const mainGroup = new THREE.Group();
          scene.add(mainGroup);

          const nodeCount = compact ? 80 : 120;
          const sphereRadius = compact ? 42 : 55;
          const nodePositions: any[] = [];

          const pGeometry = new THREE.BufferGeometry();
          const pPositions = new Float32Array(nodeCount * 3);
          const pColors = new Float32Array(nodeCount * 3);

          const primaryColor = new THREE.Color(theme.dotColor || '#10b981');
          const secondaryColor = new THREE.Color(theme.secondaryDotColor || '#8b5cf6');

          const phi = Math.PI * (3 - Math.sqrt(5));
          for (let i = 0; i < nodeCount; i++) {
            const y = 1 - (i / (nodeCount - 1)) * 2;
            const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
            const theta = phi * i;

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            const pos = new THREE.Vector3(x, y, z).multiplyScalar(sphereRadius);
            nodePositions.push(pos);

            pPositions[i * 3] = pos.x;
            pPositions[i * 3 + 1] = pos.y;
            pPositions[i * 3 + 2] = pos.z;

            const nodeCol = primaryColor.clone().lerp(secondaryColor, Math.random());
            pColors[i * 3] = nodeCol.r;
            pColors[i * 3 + 1] = nodeCol.g;
            pColors[i * 3 + 2] = nodeCol.b;
          }

          pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
          pGeometry.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

          const pMaterial = new THREE.PointsMaterial({
            size: compact ? 3.2 : 4.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
          });
          const pointCloud = new THREE.Points(pGeometry, pMaterial);
          mainGroup.add(pointCloud);

          // Lines
          const linePositions: number[] = [];
          for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
              if (nodePositions[i].distanceTo(nodePositions[j]) < sphereRadius * 0.45) {
                linePositions.push(
                  nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
                  nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
                );
              }
            }
          }

          const lineGeometry = new THREE.BufferGeometry();
          lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(theme.dotColor || '#10b981'),
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
          });
          const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
          mainGroup.add(lineSegments);

          // Satellites
          const agentSatellites: any[] = [];
          for (let i = 0; i < 4; i++) {
            const satGeo = new THREE.SphereGeometry(compact ? 2.5 : 3.2, 12, 12);
            const satMat = new THREE.MeshBasicMaterial({
              color: i % 2 === 0 ? primaryColor : secondaryColor,
            });
            const satMesh = new THREE.Mesh(satGeo, satMat);
            agentSatellites.push(satMesh);
            scene.add(satMesh);
          }

          const clock = new THREE.Clock();
          const animate = () => {
            animId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const speed = isLoading ? 2.2 : 0.6;

            mainGroup.rotation.y += 0.005 * speed;
            mainGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15;

            agentSatellites.forEach((sat, idx) => {
              const angle = elapsed * 0.8 * speed + (idx * Math.PI) / 2;
              const r = (sphereRadius + 15) * (1 + Math.sin(elapsed + idx) * 0.05);
              sat.position.x = Math.cos(angle) * r;
              sat.position.y = Math.sin(angle) * (r * 0.6);
              sat.position.z = Math.sin(angle * 1.5) * (r * 0.4);
            });

            renderer.render(scene, camera);
          };

          animate();

          cleanupFn = () => {
            cancelAnimationFrame(animId);
            pGeometry.dispose();
            pMaterial.dispose();
            lineGeometry.dispose();
            lineMaterial.dispose();
            agentSatellites.forEach((s) => {
              s.geometry.dispose();
              s.material.dispose();
            });
            renderer.dispose();
            if (renderer.domElement && container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          };
        } catch (threeErr) {
          console.warn('Three.js initialization failed, falling back to 2D holographic sphere:', threeErr);
          setUseFallback2D(true);
        }
      })
      .catch((importErr) => {
        console.warn('Three.js import failed:', importErr);
        setUseFallback2D(true);
      });

    return () => {
      isMounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [theme.dotColor, theme.secondaryDotColor, isLoading, currentStep, compact]);

  return (
    <div className={`relative rounded-3xl overflow-hidden select-none w-full h-full min-h-[200px] flex items-center justify-center ${className}`}>
      {useFallback2D ? (
        <canvas
          ref={canvasRef}
          width={compact ? 280 : 340}
          height={compact ? 200 : 240}
          className="cursor-grab active:cursor-grabbing max-w-full max-h-full"
        />
      ) : (
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        />
      )}

      {/* 3D Holo HUD Micro-Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: theme.dotColor }}
        />
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-300 drop-shadow">
          {isLoading ? 'Neural Holo-Engine Active' : '3D Synaptic Matrix'}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-3 pointer-events-none text-[9px] font-mono text-slate-500 opacity-70">
        Drag to rotate in 3D
      </div>
    </div>
  );
};
