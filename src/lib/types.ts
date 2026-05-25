export type Gender = 'male' | 'female';
export type AgeGroup = 'child' | 'adult';
export type MemberStatus = 'active' | 'inactive';

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  ageGroup: AgeGroup;
  status: MemberStatus;
  attendanceRate: number; // e.g. 85 for 85%
  lastAttended?: string; // ISO date string
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  memberId: string;
  status: 'present' | 'absent';
  timestamp: string; // ISO date string
  detectedBy: 'manual' | 'ai';
}

export interface Session {
  id: string;
  date: string; // ISO date string
  status: 'upcoming' | 'in_progress' | 'completed';
  totalPresent: number;
  totalMembers: number;
  aiDetectionActive: boolean;
}

export interface DailyStats {
  date: string;
  present: number;
  absent: number;
  men: number;
  women: number;
  children: number;
  adults: number;
}
