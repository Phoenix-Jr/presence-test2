import { Member, Session, DailyStats } from './types';
import { subDays, subWeeks, format } from 'date-fns';

const today = new Date();

export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'James Carter', gender: 'male', ageGroup: 'adult', status: 'active', attendanceRate: 92, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm2', name: 'Sarah Jenkins', gender: 'female', ageGroup: 'adult', status: 'active', attendanceRate: 85, lastAttended: format(subWeeks(today, 1), 'yyyy-MM-dd') },
  { id: 'm3', name: 'Michael Smith', gender: 'male', ageGroup: 'child', status: 'active', attendanceRate: 78, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm4', name: 'Emily Davis', gender: 'female', ageGroup: 'child', status: 'active', attendanceRate: 95, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm5', name: 'David Wilson', gender: 'male', ageGroup: 'adult', status: 'inactive', attendanceRate: 45, lastAttended: format(subWeeks(today, 4), 'yyyy-MM-dd') },
  { id: 'm6', name: 'Linda Brown', gender: 'female', ageGroup: 'adult', status: 'active', attendanceRate: 90, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm7', name: 'Robert Jones', gender: 'male', ageGroup: 'adult', status: 'active', attendanceRate: 88, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm8', name: 'Sophia Taylor', gender: 'female', ageGroup: 'child', status: 'active', attendanceRate: 70, lastAttended: format(subDays(today, 14), 'yyyy-MM-dd') },
  { id: 'm9', name: 'William Anderson', gender: 'male', ageGroup: 'adult', status: 'active', attendanceRate: 82, lastAttended: format(today, 'yyyy-MM-dd') },
  { id: 'm10', name: 'Olivia Thomas', gender: 'female', ageGroup: 'adult', status: 'active', attendanceRate: 98, lastAttended: format(today, 'yyyy-MM-dd') },
];

export const MOCK_STATS_HISTORY: DailyStats[] = Array.from({ length: 8 }).map((_, i) => {
  const date = subWeeks(today, 7 - i);
  const total = 100 + Math.floor(Math.random() * 20);
  const present = total - Math.floor(Math.random() * 30);
  
  return {
    date: format(date, 'MMM dd'),
    present,
    absent: total - present,
    men: Math.floor(present * 0.45),
    women: Math.floor(present * 0.35),
    children: Math.floor(present * 0.20),
    adults: Math.floor(present * 0.80),
  };
});

export const INITIAL_SESSION: Session = {
  id: 's1',
  date: format(today, 'yyyy-MM-dd'),
  status: 'upcoming',
  totalPresent: 0,
  totalMembers: MOCK_MEMBERS.length,
  aiDetectionActive: false,
};
