import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AppointmentType {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  color: string;
  price: number | null;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  child_id: string | null;
  parent_id: string | null;
  professional_id: string;
  appointment_type_id: string | null;
  service_mode: 'premium' | 'standard';
  room: string | null;
  scheduled_date: string;
  scheduled_time: string;
  end_time: string | null;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'realizado' | 'falta' | 'cancelado' | 'reagendado';
  internal_notes: string | null;
  check_in_at: string | null;
  confirmed_at: string | null;
  confirmed_via: string | null;
  cancellation_reason: string | null;
  created_at: string;
  // Joined data
  child?: { id: string; name: string } | null;
  parent?: { id: string; full_name: string } | null;
  professional?: { id: string; full_name: string } | null;
  appointment_type?: AppointmentType | null;
}

export interface WaitingListItem {
  id: string;
  child_id: string | null;
  parent_id: string | null;
  professional_id: string | null;
  appointment_type_id: string | null;
  preferred_days: string[] | null;
  preferred_times: string[] | null;
  priority: number;
  notes: string | null;
  status: 'aguardando' | 'contatado' | 'agendado' | 'cancelado';
  created_at: string;
  child?: { id: string; name: string } | null;
  parent?: { id: string; full_name: string } | null;
}

export function useClinicAgenda() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
  const [professionals, setProfessionals] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointmentTypes();
      fetchProfessionals();
      fetchWaitingList();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, selectedDate, selectedProfessional]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('clinic-appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinic_appointments' },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate, selectedProfessional]);

  const fetchAppointmentTypes = async () => {
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching appointment types:', error);
      return;
    }

    setAppointmentTypes(data || []);
  };

  const fetchProfessionals = async () => {
    // Fetch only clinical professionals (therapists, specialists)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['therapist', 'admin']);

    if (roleError) {
      console.error('Error fetching professional roles:', roleError);
      return;
    }

    const professionalIds = roleData?.map(r => r.user_id) || [];

    if (professionalIds.length === 0) {
      setProfessionals([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', professionalIds)
      .order('full_name');

    if (error) {
      console.error('Error fetching professionals:', error);
      return;
    }

    setProfessionals(data || []);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    
    // Get date range for the view (week view by default)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    let query = supabase
      .from('clinic_appointments')
      .select(`
        *,
        child:children(id, name),
        parent:profiles!clinic_appointments_parent_id_fkey(id, full_name),
        professional:profiles!clinic_appointments_professional_id_fkey(id, full_name),
        appointment_type:appointment_types(*)
      `)
      .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
      .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])
      .order('scheduled_date')
      .order('scheduled_time');

    if (selectedProfessional) {
      query = query.eq('professional_id', selectedProfessional);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
      return;
    }

    setAppointments(data as Appointment[] || []);
    setLoading(false);
  };

  const fetchWaitingList = async () => {
    const { data, error } = await supabase
      .from('waiting_list')
      .select(`
        *,
        child:children(id, name),
        parent:profiles!waiting_list_parent_id_fkey(id, full_name)
      `)
      .eq('status', 'aguardando')
      .order('priority', { ascending: true })
      .order('created_at');

    if (error) {
      console.error('Error fetching waiting list:', error);
      return;
    }

    setWaitingList(data as WaitingListItem[] || []);
  };

  const createAppointment = async (appointmentData: {
    child_id?: string;
    parent_id?: string;
    professional_id: string;
    appointment_type_id?: string;
    service_mode: 'premium' | 'standard';
    room?: string;
    scheduled_date: string;
    scheduled_time: string;
    internal_notes?: string;
  }) => {
    // Calculate end time based on appointment type duration
    let end_time = appointmentData.scheduled_time;
    if (appointmentData.appointment_type_id) {
      const type = appointmentTypes.find(t => t.id === appointmentData.appointment_type_id);
      if (type) {
        const [hours, minutes] = appointmentData.scheduled_time.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + type.duration_minutes);
        end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      }
    }

    const { data, error } = await supabase
      .from('clinic_appointments')
      .insert({
        ...appointmentData,
        end_time,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
      return null;
    }

    toast.success('Agendamento criado com sucesso!');
    fetchAppointments();
    return data;
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment['status'],
    additionalData?: { cancellation_reason?: string; check_in_at?: string; confirmed_at?: string; confirmed_via?: string }
  ) => {
    const { error } = await supabase
      .from('clinic_appointments')
      .update({ status, ...additionalData })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar agendamento');
      return false;
    }

    toast.success('Status atualizado!');
    fetchAppointments();
    return true;
  };

  const checkInPatient = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'em_atendimento', {
      check_in_at: new Date().toISOString(),
    });
  };

  const confirmAppointment = async (appointmentId: string, via: string = 'manual') => {
    return updateAppointmentStatus(appointmentId, 'confirmado', {
      confirmed_at: new Date().toISOString(),
      confirmed_via: via,
    });
  };

  const cancelAppointment = async (appointmentId: string, reason: string) => {
    return updateAppointmentStatus(appointmentId, 'cancelado', {
      cancellation_reason: reason,
    });
  };

  const completeAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'realizado');
  };

  const markAsNoShow = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'falta');
  };

  const addToWaitingList = async (data: {
    child_id?: string;
    parent_id?: string;
    professional_id?: string;
    appointment_type_id?: string;
    preferred_days?: string[];
    preferred_times?: string[];
    notes?: string;
  }) => {
    const { error } = await supabase
      .from('waiting_list')
      .insert(data);

    if (error) {
      console.error('Error adding to waiting list:', error);
      toast.error('Erro ao adicionar à lista de espera');
      return false;
    }

    toast.success('Adicionado à lista de espera!');
    fetchWaitingList();
    return true;
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.scheduled_date === dateStr);
  };

  return {
    appointments,
    appointmentTypes,
    waitingList,
    professionals,
    loading,
    selectedDate,
    setSelectedDate,
    selectedProfessional,
    setSelectedProfessional,
    createAppointment,
    updateAppointmentStatus,
    checkInPatient,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markAsNoShow,
    addToWaitingList,
    getAppointmentsForDay,
    refresh: fetchAppointments,
  };
}
