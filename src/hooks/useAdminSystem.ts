import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type ProgressTrend = 'excellent' | 'good' | 'average' | 'needs_improvement';
type UserRole = 'admin' | 'moderator' | 'user' | 'educator';

export interface StudentData {
  student_id: string;
  student_name: string;
  total_sessions: number;
  avg_accuracy: number;
  total_xp: number;
  last_session_date: string | null;
  needs_attention: boolean;
  progress_trend: ProgressTrend;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  created_at: string;
  learning_trails: any[];
  recent_sessions: any[];
  neurodiversity_profile: any;
  performance_metrics: {
    total_xp: number;
    avg_accuracy: number;
    total_sessions: number;
    active_days: number;
    strongest_category: string;
    weakest_category: string;
  };
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

export function useAdminSystem() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserRole();
      fetchAdminData();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;

    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roles) {
        const userRoles = roles.map(r => r.role as UserRole);
        setIsAdmin(userRoles.includes('admin'));
        setIsEducator(userRoles.includes('admin') || userRoles.includes('educator'));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchAdminData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch students data (for educators and admins)
      const { data: studentsData, error: studentsError } = await supabase
        .rpc('get_educator_students_stats', { educator_uuid: user.id });

      if (studentsError) throw studentsError;
      
      // Ensure correct typing for progress_trend
      const typedStudentsData = (studentsData || []).map((student: any) => ({
        ...student,
        progress_trend: student.progress_trend as ProgressTrend
      }));
      
      setStudents(typedStudentsData);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentDetail = async (studentId: string): Promise<StudentDetail | null> => {
    try {
      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Fetch learning trails
      const { data: trails, error: trailsError } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('user_id', studentId);

      if (trailsError) throw trailsError;

      // Fetch recent sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Fetch neurodiversity profile
      const { data: neuroProfile, error: neuroError } = await supabase
        .from('neurodiversity_profiles')
        .select('*')
        .eq('user_id', studentId)
        .single();

      if (neuroError && neuroError.code !== 'PGRST116') throw neuroError;

      // Calculate performance metrics
      const totalXP = trails?.reduce((sum, trail) => sum + (trail.total_xp || 0), 0) || 0;
      const avgAccuracy = sessions?.length > 0 
        ? sessions.reduce((sum, s) => {
            const performanceData = s.performance_data as any;
            return sum + (performanceData?.accuracy || 0);
          }, 0) / sessions.length 
        : 0;
      
      const categoryXP = trails?.reduce((acc, trail) => {
        acc[trail.cognitive_category] = trail.total_xp || 0;
        return acc;
      }, {} as Record<string, number>) || {};

      const strongest = Object.keys(categoryXP).reduce((a, b) => 
        categoryXP[a] > categoryXP[b] ? a : b, 'none');
      const weakest = Object.keys(categoryXP).reduce((a, b) => 
        categoryXP[a] < categoryXP[b] ? a : b, 'none');

      // Calculate active days (unique dates from sessions)
      const activeDays = new Set(
        sessions?.map(s => s.created_at.split('T')[0]) || []
      ).size;

      return {
        id: profile.id,
        name: profile.name || 'Sem nome',
        email: profile.email || '',
        created_at: profile.created_at,
        learning_trails: trails || [],
        recent_sessions: sessions || [],
        neurodiversity_profile: neuroProfile,
        performance_metrics: {
          total_xp: totalXP,
          avg_accuracy: Math.round(avgAccuracy),
          total_sessions: sessions?.length || 0,
          active_days: activeDays,
          strongest_category: strongest,
          weakest_category: weakest
        }
      };
    } catch (error) {
      console.error('Error fetching student detail:', error);
      return null;
    }
  };

  const addStudentToEducator = async (studentEmail: string, educatorId?: string): Promise<boolean> => {
    try {
      const currentEducatorId = educatorId || user?.id;
      if (!currentEducatorId) return false;

      // Find student by email
      const { data: student, error: studentError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', studentEmail)
        .single();

      if (studentError) throw studentError;

      // Add relationship
      const { error: relationError } = await supabase
        .from('educator_students')
        .insert({
          educator_id: currentEducatorId,
          student_id: student.id
        });

      if (relationError) throw relationError;

      await fetchAdminData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      return false;
    }
  };

  const removeStudentFromEducator = async (studentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('educator_students')
        .delete()
        .eq('educator_id', user?.id)
        .eq('student_id', studentId);

      if (error) throw error;

      await fetchAdminData(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error removing student:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId 
          ? { ...n, read_at: new Date().toISOString() }
          : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getAllStudents = async (): Promise<StudentData[]> => {
    if (!isAdmin) return [];

    try {
      // Get basic user profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, name, email, created_at');

      if (profilesError) throw profilesError;
      if (!profiles || !Array.isArray(profiles)) return [];

      // Get learning data for each user
      const processedData: StudentData[] = [];
      
      for (const user of profiles) {
        // Get learning trails
        const { data: trails } = await supabase
          .from('learning_trails')
          .select('total_xp, current_level')
          .eq('user_id', user.id);

        // Get learning sessions
        const { data: sessions } = await supabase
          .from('learning_sessions')
          .select('performance_data, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const sessionsArray = sessions || [];
        const trailsArray = trails || [];

        const avgAccuracy = sessionsArray.length > 0 
          ? sessionsArray.reduce((sum: number, s: any) => {
              const performanceData = s.performance_data as any;
              return sum + (performanceData?.accuracy || 0);
            }, 0) / sessionsArray.length 
          : 0;

        const totalXP = trailsArray.reduce((sum: number, trail: any) => sum + (trail.total_xp || 0), 0);

        const progressTrend: ProgressTrend = avgAccuracy >= 80 ? 'excellent' : 
                       avgAccuracy >= 70 ? 'good' : 
                       avgAccuracy >= 60 ? 'average' : 'needs_improvement';

        processedData.push({
          student_id: user.id,
          student_name: user.name || 'Sem nome',
          total_sessions: sessionsArray.length,
          avg_accuracy: Math.round(avgAccuracy),
          total_xp: totalXP,
          last_session_date: sessionsArray.length > 0 ? sessionsArray[0].created_at : null,
          needs_attention: avgAccuracy < 60,
          progress_trend: progressTrend
        });
      }

      return processedData;
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  };

  const exportStudentData = async (studentId: string): Promise<any> => {
    try {
      const studentDetail = await getStudentDetail(studentId);
      if (!studentDetail) return null;

      return {
        export_date: new Date().toISOString(),
        student_info: {
          name: studentDetail.name,
          id: studentDetail.id,
          member_since: studentDetail.created_at
        },
        performance_summary: studentDetail.performance_metrics,
        learning_trails: studentDetail.learning_trails,
        recent_sessions: studentDetail.recent_sessions,
        neurodiversity_profile: studentDetail.neurodiversity_profile
      };
    } catch (error) {
      console.error('Error exporting student data:', error);
      return null;
    }
  };

  return {
    students,
    notifications,
    loading,
    isAdmin,
    isEducator,
    getStudentDetail,
    addStudentToEducator,
    removeStudentFromEducator,
    markNotificationAsRead,
    getAllStudents,
    exportStudentData,
    refreshData: fetchAdminData
  };
}