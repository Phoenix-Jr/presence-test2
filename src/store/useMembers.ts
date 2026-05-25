import { create } from 'zustand';
import { Member } from '@/lib/types';
import { MOCK_MEMBERS } from '@/lib/mock-data';

interface MembersState {
  members: Member[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMember: (member: Omit<Member, 'id' | 'lastAttended' | 'attendanceRate'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
}

export const useMembers = create<MembersState>((set) => ({
  members: MOCK_MEMBERS,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  addMember: (memberData) => set((state) => ({
    members: [
      ...state.members,
      {
        ...memberData,
        id: `m${Date.now()}`,
        attendanceRate: 0,
      }
    ]
  })),
  updateMember: (id, updates) => set((state) => ({
    members: state.members.map((m) => m.id === id ? { ...m, ...updates } : m)
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id)
  }))
}));
