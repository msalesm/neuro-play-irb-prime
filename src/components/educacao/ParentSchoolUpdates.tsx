import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClassAnnouncementsBoard } from './ClassAnnouncementsBoard';
import { ParentTeacherNotes } from './ParentTeacherNotes';

interface Props {
  childId: string;
  childName?: string;
}

/**
 * Parent-side surface for school updates: shows class announcements
 * and the parent <-> teacher notes thread for the selected child.
 * Renders nothing if the child is not enrolled in any active class.
 */
export function ParentSchoolUpdates({ childId, childName }: Props) {
  const { data: classId } = useQuery({
    queryKey: ['parent-child-class', childId],
    queryFn: async () => {
      const { data } = await supabase
        .from('class_students')
        .select('class_id')
        .eq('child_id', childId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.class_id || null;
    },
    enabled: !!childId,
  });

  if (!classId) return null;

  return (
    <div className="space-y-4">
      <ClassAnnouncementsBoard classId={classId} readOnly />
      <ParentTeacherNotes childId={childId} childName={childName} asRole="parent" />
    </div>
  );
}