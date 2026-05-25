'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Member } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Camera, Wifi } from 'lucide-react';

export interface KnownDetection {
  type: 'known';
  member: Member;
}

export interface UnknownDetection {
  type: 'unknown';
  uid: string; // temporary ID for this unknown person
}

export type DetectionEvent = KnownDetection | UnknownDetection;

interface InternalDetection {
  id: string;
  label: string;
  sublabel: string;
  isUnknown: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  age: number;
  memberId?: string;
}

interface CameraFeedProps {
  isActive: boolean;
  pendingMembers: Member[];
  onDetect: (event: DetectionEvent) => void;
}

const MAX_DETECTION_AGE = 3000;
const POSITIONS = [
  { x: 8,  y: 12, w: 18, h: 32 },
  { x: 32, y: 8,  w: 16, h: 30 },
  { x: 58, y: 15, w: 17, h: 29 },
  { x: 76, y: 10, w: 16, h: 31 },
  { x: 18, y: 50, w: 18, h: 32 },
  { x: 44, y: 48, w: 16, h: 30 },
  { x: 68, y: 52, w: 17, h: 28 },
  { x: 5,  y: 55, w: 15, h: 30 },
  { x: 80, y: 50, w: 16, h: 33 },
  { x: 50, y: 20, w: 15, h: 28 },
];

// Fake unknown visitor names for the camera display
const UNKNOWN_LABELS = ['VISITOR', 'INCONNU', 'NON IDENTIFIÉ'];

export function CameraFeed({ isActive, pendingMembers, onDetect }: CameraFeedProps) {
  const [detections, setDetections] = useState<InternalDetection[]>([]);
  const [tick, setTick] = useState(0);
  const [frameTime, setFrameTime] = useState('');
  const posIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number | null>(null);

  // Clock
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setFrameTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Age out
  const ageDetections = useCallback(() => {
    setDetections((prev) =>
      prev.map((d) => ({ ...d, age: d.age + 50 })).filter((d) => d.age < MAX_DETECTION_AGE)
    );
    animRef.current = requestAnimationFrame(ageDetections);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(ageDetections);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [ageDetections]);

  // Scanline
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  // Spawn detections
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const pos = POSITIONS[posIndexRef.current % POSITIONS.length];
      posIndexRef.current++;

      // 25% chance of unknown when there are still pending members, or always if no pending
      const spawnUnknown = pendingMembers.length === 0 || Math.random() < 0.25;

      if (spawnUnknown) {
        const uid = `unknown-${Date.now()}`;
        const det: InternalDetection = {
          id: `det-${Date.now()}`,
          label: UNKNOWN_LABELS[Math.floor(Math.random() * UNKNOWN_LABELS.length)],
          sublabel: `${55 + Math.floor(Math.random() * 20)}% conf.`,
          isUnknown: true,
          ...pos,
          age: 0,
        };
        setDetections((prev) => [...prev, det]);
        onDetect({ type: 'unknown', uid });
      } else if (pendingMembers.length > 0) {
        const member = pendingMembers[0];
        const confidence = 88 + Math.floor(Math.random() * 12);
        const det: InternalDetection = {
          id: `det-${Date.now()}`,
          label: member.name,
          sublabel: `${confidence}% conf.`,
          isUnknown: false,
          memberId: member.id,
          ...pos,
          age: 0,
        };
        setDetections((prev) => [
          ...prev.filter((d) => d.memberId !== member.id),
          det,
        ]);
        onDetect({ type: 'known', member });
      }
    }, 3000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, pendingMembers, onDetect]);

  const scanlineY = (tick * 3) % 100;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/10 select-none">
      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 60%, rgba(139,92,246,0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Crowd silhouettes */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 100 56"
        preserveAspectRatio="xMidYMid slice"
      >
        {POSITIONS.map((p, i) => (
          <g key={i}>
            <ellipse cx={p.x + p.w / 2} cy={p.y + p.h * 0.75} rx={p.w * 0.45} ry={p.h * 0.32} fill="#8b8" />
            <circle cx={p.x + p.w / 2} cy={p.y + p.h * 0.22} r={p.w * 0.27} fill="#aaa" />
          </g>
        ))}
      </svg>

      {/* Scanline sweep */}
      <div
        className="absolute left-0 right-0 h-12 pointer-events-none"
        style={{
          top: `${scanlineY}%`,
          background: isActive
            ? 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.07) 50%, transparent)'
            : 'none',
        }}
      />

      {/* CRT lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Bounding boxes */}
      {detections.map((det) => {
        const progress = det.age / MAX_DETECTION_AGE;
        const opacity =
          progress < 0.1 ? progress / 0.1 : progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;
        const color = det.isUnknown ? '#f97316' : '#10b981';

        return (
          <div
            key={det.id}
            className="absolute pointer-events-none"
            style={{
              left: `${det.x}%`,
              top: `${det.y}%`,
              width: `${det.w}%`,
              height: `${det.h}%`,
              opacity,
            }}
          >
            {/* Corners */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
              (pos, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 border-2 ${pos}`}
                  style={{
                    borderColor: color,
                    borderRightWidth: pos.includes('right-0') ? '2px' : '0',
                    borderLeftWidth: pos.includes('left-0') ? '2px' : '0',
                    borderTopWidth: pos.includes('top-0') ? '2px' : '0',
                    borderBottomWidth: pos.includes('bottom-0') ? '2px' : '0',
                  }}
                />
              )
            )}

            {/* Label */}
            <div
              className="absolute -top-6 left-0 flex flex-col items-start gap-0.5"
              style={{ fontSize: 'clamp(7px, 1vw, 10px)' }}
            >
              <span
                className="font-bold px-1 py-0.5 rounded leading-none whitespace-nowrap text-black"
                style={{ background: color }}
              >
                {det.label}
              </span>
              <span
                className="font-mono px-1 rounded leading-none bg-black/70"
                style={{ color }}
              >
                {det.sublabel}
              </span>
            </div>
          </div>
        );
      })}

      {/* HUD top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Camera className="h-3 w-3 text-white/70" />
          <span className="text-white/70 font-mono text-[10px]">CAM-01 · 1080p</span>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              REC
            </span>
          )}
          <span className="text-white/60 font-mono text-[10px]">{frameTime}</span>
          <Wifi className="h-3 w-3 text-white/50" />
        </div>
      </div>

      {/* HUD bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-white/50 font-mono text-[9px]">AI FACE DETECT · v2.4</span>
        {isActive ? (
          <div className="flex items-center gap-2">
            <Badge className="text-[9px] h-4 px-1.5 bg-emerald-600/80 text-white border-0">
              {pendingMembers.length} EN ATTENTE
            </Badge>
          </div>
        ) : (
          <span className="text-white/30 font-mono text-[9px]">STANDBY</span>
        )}
      </div>

      {/* Standby overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-white/20" />
          <p className="text-white/30 text-xs font-mono">Démarrer une session pour activer</p>
        </div>
      )}
    </div>
  );
}
