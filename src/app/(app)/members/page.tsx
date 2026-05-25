'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMembers } from '@/store/useMembers';
import { Member } from '@/lib/types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['male', 'female']),
  ageGroup: z.enum(['child', 'adult']),
  status: z.enum(['active', 'inactive']),
});

type MemberFormData = z.infer<typeof memberSchema>;

function MemberDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member;
}) {
  const { addMember, updateMember } = useMembers();
  const isEditing = !!member;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          name: member.name,
          gender: member.gender,
          ageGroup: member.ageGroup,
          status: member.status,
        }
      : { gender: 'male', ageGroup: 'adult', status: 'active' },
  });

  const onSubmit = (data: MemberFormData) => {
    if (isEditing && member) {
      updateMember(member.id, data);
      toast.success(`${data.name} updated successfully`);
    } else {
      addMember(data);
      toast.success(`${data.name} added to members`);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Member' : 'Add New Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="e.g. John Smith" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={watch('gender')}
                onValueChange={(v) => setValue('gender', v as 'male' | 'female')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Age Group</Label>
              <Select
                value={watch('ageGroup')}
                onValueChange={(v) => setValue('ageGroup', v as 'child' | 'adult')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const { members, searchQuery, setSearchQuery, deleteMember } = useMembers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || m.gender === genderFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesGender && matchesStatus;
  });

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    deleteMember(member.id);
    toast.success(`${member.name} removed`);
  };

  const handleAdd = () => {
    setEditingMember(undefined);
    setDialogOpen(true);
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your congregation&apos;s roster
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: members.length, icon: Users, color: 'text-violet-500' },
          { label: 'Active', value: members.filter(m => m.status === 'active').length, icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Men', value: members.filter(m => m.gender === 'male').length, icon: Users, color: 'text-blue-500' },
          { label: 'Women', value: members.filter(m => m.gender === 'female').length, icon: Users, color: 'text-pink-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <Card key={member.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    className={`text-sm font-semibold ${
                      member.gender === 'male'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                    }`}
                  >
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{member.name}</p>
                    <Badge
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {member.gender} · {member.ageGroup}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Attendance Rate</span>
                      <span className="font-medium text-foreground">{member.attendanceRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${member.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                  {member.lastAttended && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last seen: {format(new Date(member.lastAttended), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 h-8" onClick={() => handleEdit(member)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:border-destructive/30" onClick={() => handleDelete(member)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No members found</p>
          </div>
        )}
      </div>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
      />
    </div>
  );
}
