'use client';

import { useCallback, useState } from 'react';
import { useAttendance } from '@/store/useAttendance';
import { useMembers } from '@/store/useMembers';
import { Member } from '@/lib/types';
import {
  Play,
  Square,
  Zap,
  ZapOff,
  UserCheck,
  UserX,
  Clock,
  SlidersHorizontal,
  UserPlus,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CameraFeed, DetectionEvent } from '@/components/CameraFeed';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Quick-register form ──────────────────────────────────────────────────────
const quickRegisterSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  gender: z.enum(['male', 'female']),
  ageGroup: z.enum(['child', 'adult']),
});
type QuickRegisterData = z.infer<typeof quickRegisterSchema>;

function QuickRegisterDialog({
  open,
  onOpenChange,
  onRegister,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRegister: (name: string, gender: 'male' | 'female', ageGroup: 'child' | 'adult') => void;
}) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<QuickRegisterData>({
      resolver: zodResolver(quickRegisterSchema),
      defaultValues: { gender: 'male', ageGroup: 'adult' },
    });

  const onSubmit = (data: QuickRegisterData) => {
    onRegister(data.name, data.gender, data.ageGroup);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Inconnu détecté
          </DialogTitle>
          <DialogDescription>
            Enregistrer cette personne comme nouveau membre ou visiteur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="qr-name">Nom complet</Label>
            <Input id="qr-name" placeholder="ex. Jean Dupont" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Genre</Label>
              <Select
                value={watch('gender')}
                onValueChange={(v) => setValue('gender', v as 'male' | 'female')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Âge</Label>
              <Select
                value={watch('ageGroup')}
                onValueChange={(v) => setValue('ageGroup', v as 'child' | 'adult')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adulte</SelectItem>
                  <SelectItem value="child">Enfant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1 gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────
function MemberAttendanceRow({
  member,
  recordStatus,
  detectedBy,
  onMark,
  disabled,
}: {
  member: Member;
  recordStatus?: 'present' | 'absent';
  detectedBy?: 'manual' | 'ai';
  onMark: (memberId: string, status: 'present' | 'absent', by: 'manual') => void;
  disabled: boolean;
}) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300',
        recordStatus === 'present'
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : recordStatus === 'absent'
          ? 'border-rose-500/30 bg-rose-500/5'
          : 'border-border bg-card'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className={cn(
                'text-xs font-semibold',
                member.gender === 'male'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {recordStatus === 'present' && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium leading-none">{member.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {member.gender} · {member.ageGroup}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {detectedBy && (
          <Badge variant="outline" className="text-xs">
            {detectedBy === 'ai' ? '🤖 IA' : '✏️ Manuel'}
          </Badge>
        )}
        <Button
          size="sm"
          disabled={disabled}
          variant={recordStatus === 'present' ? 'default' : 'outline'}
          className={cn(
            'h-8 gap-1.5 text-xs',
            recordStatus === 'present' && 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
          )}
          onClick={() => onMark(member.id, 'present', 'manual')}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Présent
        </Button>
        <Button
          size="sm"
          disabled={disabled}
          variant={recordStatus === 'absent' ? 'destructive' : 'outline'}
          className="h-8 gap-1.5 text-xs"
          onClick={() => onMark(member.id, 'absent', 'manual')}
        >
          <UserX className="h-3.5 w-3.5" />
          Absent
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface UnknownAlert {
  uid: string;
  ts: number;
}

export default function AttendancePage() {
  const { session, records, startSession, stopSession, toggleAiSimulation, markPresence } =
    useAttendance();
  const { members, addMember } = useMembers();

  // Unknown visitor state
  const [visitorCount, setVisitorCount] = useState(0);
  const [unknownQueue, setUnknownQueue] = useState<UnknownAlert[]>([]);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [pendingUnknownUid, setPendingUnknownUid] = useState<string | null>(null);

  const activeMembers = members.filter((m) => m.status === 'active');
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const notMarked = activeMembers.length - records.length;

  const pendingMembers = activeMembers.filter(
    (m) => !records.some((r) => r.memberId === m.id && r.status === 'present')
  );

  const handleMark = (memberId: string, status: 'present' | 'absent', by: 'manual') => {
    markPresence(memberId, status, by);
    const member = members.find((m) => m.id === memberId);
    toast.success(`${member?.name} marqué comme ${status === 'present' ? 'présent' : 'absent'}`);
  };

  // Camera detection handler
  const handleCameraDetect = useCallback(
    (event: DetectionEvent) => {
      if (event.type === 'known') {
        markPresence(event.member.id, 'present', 'ai');
        toast.success(`🤖 IA : ${event.member.name} détecté`, { duration: 2000 });
      } else {
        // Unknown person — add to queue
        setUnknownQueue((prev) => {
          // Limit queue to 3 simultaneous alerts
          if (prev.length >= 3) return prev;
          return [...prev, { uid: event.uid, ts: Date.now() }];
        });
      }
    },
    [markPresence]
  );

  const dismissUnknown = (uid: string) => {
    setUnknownQueue((prev) => prev.filter((a) => a.uid !== uid));
  };

  const countAsVisitor = (uid: string) => {
    setVisitorCount((c) => c + 1);
    dismissUnknown(uid);
    toast.info('Visiteur comptabilisé');
  };

  const openRegisterDialog = (uid: string) => {
    setPendingUnknownUid(uid);
    setRegisterDialogOpen(true);
  };

  const handleRegister = (
    name: string,
    gender: 'male' | 'female',
    ageGroup: 'child' | 'adult'
  ) => {
    addMember({ name, gender, ageGroup, status: 'active' });
    if (pendingUnknownUid) {
      dismissUnknown(pendingUnknownUid);
    }
    toast.success(`${name} ajouté comme nouveau membre`);
  };

  const handleStart = () => { startSession(); toast.success('Session démarrée !'); };
  const handleStop = () => { stopSession(); toast.info('Session terminée et sauvegardée.'); };
  const handleAiToggle = () => {
    toggleAiSimulation();
    toast[session.aiDetectionActive ? 'info' : 'success'](
      session.aiDetectionActive ? 'IA en pause' : 'Caméra IA activée'
    );
  };

  const sessionInProgress = session.status === 'in_progress';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suivi de Présence</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE d MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {sessionInProgress && (
            <div className="flex items-center gap-3 rounded-xl border px-4 py-2">
              {session.aiDetectionActive
                ? <Zap className="h-4 w-4 text-amber-500" />
                : <ZapOff className="h-4 w-4 text-muted-foreground" />
              }
              <Label htmlFor="ai-toggle" className="text-sm cursor-pointer">Caméra IA</Label>
              <Switch id="ai-toggle" checked={session.aiDetectionActive} onCheckedChange={handleAiToggle} />
            </div>
          )}
          {session.status === 'upcoming' && (
            <Button onClick={handleStart} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Play className="h-4 w-4" /> Démarrer
            </Button>
          )}
          {sessionInProgress && (
            <Button onClick={handleStop} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" /> Terminer
            </Button>
          )}
          {session.status === 'completed' && (
            <Badge variant="secondary" className="text-sm px-4 py-2">✓ Session terminée</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Présents', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Absents', value: absentCount, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Non marqués', value: notMarked, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          {
            label: 'Taux',
            value: activeMembers.length > 0 ? `${Math.round((presentCount / activeMembers.length) * 100)}%` : '—',
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-950/30',
          },
          { label: 'Visiteurs', value: visitorCount, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
        ].map((s) => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hint */}
      {session.status === 'upcoming' && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          Démarrez une session puis activez la Caméra IA pour simuler la détection faciale en temps réel.
        </div>
      )}

      {/* Unknown person alerts */}
      {unknownQueue.length > 0 && (
        <div className="space-y-2">
          {unknownQueue.map((alert) => (
            <div
              key={alert.uid}
              className="flex items-center justify-between gap-3 rounded-xl border border-orange-400/40 bg-orange-500/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                    Personne inconnue détectée
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Non identifiée dans la base de données
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-950"
                  onClick={() => countAsVisitor(alert.uid)}
                >
                  Visiteur
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700"
                  onClick={() => openRegisterDialog(alert.uid)}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Enregistrer
                </Button>
                <button
                  onClick={() => dismissUnknown(alert.uid)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* Camera — 3 cols */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  session.aiDetectionActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                )}
              />
              Flux Caméra — Détection IA
            </h2>
            {session.aiDetectionActive && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                Analyse en cours…
              </span>
            )}
          </div>
          <CameraFeed
            isActive={session.aiDetectionActive}
            pendingMembers={pendingMembers}
            onDetect={handleCameraDetect}
          />
          <p className="text-[11px] text-muted-foreground">
            Simulation · Les boîtes vertes = membres connus · Les boîtes oranges = personnes inconnues.
          </p>
        </div>

        {/* Member list — 2 cols */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-3">
              <div className="space-y-2">
                {activeMembers.map((member) => {
                  const record = records.find((r) => r.memberId === member.id);
                  return (
                    <MemberAttendanceRow
                      key={member.id}
                      member={member}
                      recordStatus={record?.status}
                      detectedBy={record?.detectedBy}
                      onMark={handleMark}
                      disabled={!sessionInProgress}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick register dialog */}
      <QuickRegisterDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onRegister={handleRegister}
      />
    </div>
  );
}
