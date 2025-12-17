import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClubCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ClubPartner {
  id: string;
  user_id: string | null;
  name: string;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  commission_rate: number;
  is_approved: boolean;
  is_active: boolean;
}

export interface ClubService {
  id: string;
  partner_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  discount_percentage: number;
  location_type: string;
  location_address: string | null;
  cancellation_policy: string | null;
  is_active: boolean;
  partner?: ClubPartner;
  category?: ClubCategory;
}

export interface ClubBooking {
  id: string;
  service_id: string;
  partner_id: string;
  parent_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  price: number;
  discount_applied: number;
  final_price: number;
  clinic_commission: number;
  partner_amount: number;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  service?: ClubService;
  partner?: ClubPartner;
}

export function useParentsClub(userId?: string) {
  const [categories, setCategories] = useState<ClubCategory[]>([]);
  const [services, setServices] = useState<ClubService[]>([]);
  const [bookings, setBookings] = useState<ClubBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchServices();
    if (userId) fetchMyBookings();
  }, [userId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('club_service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (!error && data) setCategories(data);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('club_services')
      .select(`*, partner:club_partners(*), category:club_service_categories(*)`)
      .eq('is_active', true);
    
    if (!error && data) setServices(data as any);
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('club_bookings')
      .select(`*, service:club_services(*), partner:club_partners(*)`)
      .eq('parent_id', userId)
      .order('scheduled_date', { ascending: false });
    
    if (!error && data) setBookings(data as any);
  };

  const createBooking = async (serviceId: string, partnerId: string, date: string, time: string, service: ClubService) => {
    if (!userId) return null;
    const discountApplied = service.price * (service.discount_percentage / 100);
    const finalPrice = service.price - discountApplied;
    const commissionRate = (service.partner as any)?.commission_rate || 20;
    const clinicCommission = finalPrice * (commissionRate / 100);

    const { data, error } = await supabase.from('club_bookings').insert({
      service_id: serviceId, partner_id: partnerId, parent_id: userId,
      scheduled_date: date, scheduled_time: time, duration_minutes: service.duration_minutes,
      price: service.price, discount_applied: discountApplied, final_price: finalPrice,
      clinic_commission: clinicCommission, partner_amount: finalPrice - clinicCommission, status: 'pending'
    }).select().single();

    if (error) { toast.error('Erro ao criar agendamento'); return null; }
    toast.success('Agendamento criado!');
    fetchMyBookings();
    return data;
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    const { error } = await supabase.from('club_bookings').update({
      status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString()
    }).eq('id', bookingId);
    if (error) { toast.error('Erro ao cancelar'); return false; }
    toast.success('Cancelado');
    fetchMyBookings();
    return true;
  };

  return { categories, services, bookings, loading, createBooking, cancelBooking, refreshBookings: fetchMyBookings };
}

export function useClubPartner(userId?: string) {
  const [partner, setPartner] = useState<ClubPartner | null>(null);
  const [myServices, setMyServices] = useState<ClubService[]>([]);
  const [myBookings, setMyBookings] = useState<ClubBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchPartnerProfile();
  }, [userId]);

  const fetchPartnerProfile = async () => {
    if (!userId) return;
    const { data } = await supabase.from('club_partners').select('*').eq('user_id', userId).single();
    if (data) {
      setPartner(data as any);
      fetchMyServices(data.id);
      fetchPartnerBookings(data.id);
    }
    setLoading(false);
  };

  const fetchMyServices = async (partnerId: string) => {
    const { data } = await supabase.from('club_services').select('*, category:club_service_categories(*)').eq('partner_id', partnerId);
    if (data) setMyServices(data as any);
  };

  const fetchPartnerBookings = async (partnerId: string) => {
    const { data } = await supabase.from('club_bookings').select(`*, service:club_services(*)`).eq('partner_id', partnerId).order('scheduled_date');
    if (data) setMyBookings(data as any);
  };

  const createService = async (serviceData: Partial<ClubService>) => {
    if (!partner) return null;
    const { data, error } = await supabase.from('club_services').insert({ ...serviceData, partner_id: partner.id } as any).select().single();
    if (error) { toast.error('Erro ao criar serviço'); return null; }
    toast.success('Serviço criado!');
    fetchMyServices(partner.id);
    return data;
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from('club_bookings').update({ status }).eq('id', bookingId);
    if (error) { toast.error('Erro'); return false; }
    toast.success('Atualizado');
    if (partner) fetchPartnerBookings(partner.id);
    return true;
  };

  return { partner, myServices, myBookings, loading, createService, updateBookingStatus };
}

export function useClubAdmin() {
  const [partners, setPartners] = useState<ClubPartner[]>([]);
  const [allBookings, setAllBookings] = useState<ClubBooking[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, activePartners: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPartners();
    fetchAllBookings();
    fetchStats();
  }, []);

  const fetchAllPartners = async () => {
    const { data } = await supabase.from('club_partners').select('*').order('created_at', { ascending: false });
    if (data) setPartners(data as any);
    setLoading(false);
  };

  const fetchAllBookings = async () => {
    const { data } = await supabase.from('club_bookings').select(`*, service:club_services(*), partner:club_partners(*)`).order('created_at', { ascending: false }).limit(100);
    if (data) setAllBookings(data as any);
  };

  const fetchStats = async () => {
    const { data: revenueData } = await supabase.from('club_bookings').select('clinic_commission').eq('status', 'completed');
    const totalRevenue = revenueData?.reduce((sum, b) => sum + Number(b.clinic_commission), 0) || 0;
    const { count: bookingsCount } = await supabase.from('club_bookings').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('club_partners').select('*', { count: 'exact', head: true }).eq('is_approved', true).eq('is_active', true);
    const { count: pendingCount } = await supabase.from('club_partners').select('*', { count: 'exact', head: true }).eq('is_approved', false);
    setStats({ totalRevenue, totalBookings: bookingsCount || 0, activePartners: activeCount || 0, pendingApprovals: pendingCount || 0 });
  };

  const approvePartner = async (partnerId: string, approvedBy: string) => {
    const { error } = await supabase.from('club_partners').update({ is_approved: true, approved_at: new Date().toISOString(), approved_by: approvedBy }).eq('id', partnerId);
    if (error) { toast.error('Erro'); return false; }
    toast.success('Aprovado!');
    fetchAllPartners();
    fetchStats();
    return true;
  };

  const togglePartnerStatus = async (partnerId: string, isActive: boolean) => {
    const { error } = await supabase.from('club_partners').update({ is_active: isActive }).eq('id', partnerId);
    if (error) { toast.error('Erro'); return false; }
    toast.success(isActive ? 'Ativado' : 'Desativado');
    fetchAllPartners();
    return true;
  };

  return { partners, allBookings, stats, loading, approvePartner, togglePartnerStatus };
}
