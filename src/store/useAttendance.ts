import { create } from 'zustand';
import { Session, AttendanceRecord, DailyStats, Member } from '@/lib/types';
import { INITIAL_SESSION, MOCK_STATS_HISTORY } from '@/lib/mock-data';
import { useMembers } from './useMembers';
import { format } from 'date-fns';

interface AttendanceState {
  session: Session;
  records: AttendanceRecord[];
  aiInterval: NodeJS.Timeout | null;
  startSession: () => void;
  stopSession: () => void;
  toggleAiSimulation: () => void;
  markPresence: (memberId: string, status: 'present' | 'absent', by: 'manual' | 'ai') => void;
  processAiTick: () => void;
}

export const useAttendance = create<AttendanceState>((set, get) => ({
  session: INITIAL_SESSION,
  records: [],
  aiInterval: null,

  startSession: () => {
    set({
      session: { ...INITIAL_SESSION, status: 'in_progress', date: format(new Date(), 'yyyy-MM-dd') },
      records: []
    });
  },

  stopSession: () => {
    const { aiInterval } = get();
    if (aiInterval) clearInterval(aiInterval);
    set((state) => ({
      session: { ...state.session, status: 'completed', aiDetectionActive: false },
      aiInterval: null
    }));
  },

  toggleAiSimulation: () => {
    const { session, aiInterval, processAiTick } = get();
    if (session.status !== 'in_progress') return;

    if (session.aiDetectionActive) {
      if (aiInterval) clearInterval(aiInterval);
      set({ session: { ...session, aiDetectionActive: false }, aiInterval: null });
    } else {
      const intervalId = setInterval(() => {
        processAiTick();
      }, 3000); // Simulate every 3 seconds
      set({ session: { ...session, aiDetectionActive: true }, aiInterval: intervalId as any });
    }
  },

  markPresence: (memberId, status, by) => {
    const { session, records } = get();
    if (session.status !== 'in_progress') return;

    const existingRecordIndex = records.findIndex(r => r.memberId === memberId);
    let newRecords = [...records];
    let increment = 0;

    if (existingRecordIndex >= 0) {
      const oldStatus = records[existingRecordIndex].status;
      if (oldStatus !== status) {
        newRecords[existingRecordIndex] = { ...records[existingRecordIndex], status, detectedBy: by, timestamp: new Date().toISOString() };
        increment = status === 'present' ? 1 : -1;
      }
    } else {
      newRecords.push({
        id: `r${Date.now()}`,
        sessionId: session.id,
        memberId,
        status,
        timestamp: new Date().toISOString(),
        detectedBy: by
      });
      if (status === 'present') increment = 1;
    }

    if (increment !== 0) {
      // update member stats
      useMembers.getState().updateMember(memberId, { lastAttended: format(new Date(), 'yyyy-MM-dd') });
    }

    set({
      records: newRecords,
      session: {
        ...session,
        totalPresent: session.totalPresent + increment
      }
    });
  },

  processAiTick: () => {
    const { records, markPresence } = get();
    const members = useMembers.getState().members;
    
    // Find members not yet marked
    const unmarkedMembers = members.filter(m => !records.some(r => r.memberId === m.id));
    
    if (unmarkedMembers.length > 0) {
      // Pick a random member and mark them present
      const randomIndex = Math.floor(Math.random() * unmarkedMembers.length);
      const memberToUpdate = unmarkedMembers[randomIndex];
      markPresence(memberToUpdate.id, 'present', 'ai');
    } else {
      get().toggleAiSimulation(); // stop when all are marked
    }
  }
}));
