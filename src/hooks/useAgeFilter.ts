import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AgeFilterConfig {
  ageMin?: number | null;
  ageMax?: number | null;
}

export function useChildAge() {
  const { user } = useAuth();

  const { data: childAge, isLoading } = useQuery({
    queryKey: ['child-age', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Check localStorage first for selected child
      const storedProfile = localStorage.getItem('selectedChildProfile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed.date_of_birth || parsed.birth_date) {
            const birthDate = new Date(parsed.date_of_birth || parsed.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            return age;
          }
        } catch (e) {
          // Fallback to database
        }
      }

      // Try child_profiles table first
      const { data: childProfile } = await supabase
        .from('child_profiles')
        .select('date_of_birth')
        .eq('parent_user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (childProfile?.date_of_birth) {
        const birthDate = new Date(childProfile.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }

      // Try children table
      const { data: child } = await supabase
        .from('children')
        .select('birth_date')
        .eq('parent_id', user.id)
        .limit(1)
        .maybeSingle();

      if (child?.birth_date) {
        const birthDate = new Date(child.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }

      return null;
    },
    enabled: !!user?.id,
  });

  return { childAge, isLoading };
}

export function useAgeFilteredContent<T extends AgeFilterConfig>(
  items: T[],
  getAgeRange: (item: T) => { min: number | null; max: number | null }
) {
  const { childAge, isLoading } = useChildAge();

  const filteredItems = useMemo(() => {
    // If no age set or loading, return all items
    if (isLoading || childAge === null || childAge === undefined) {
      return items;
    }

    return items.filter(item => {
      const { min, max } = getAgeRange(item);
      const minAge = min ?? 0;
      const maxAge = max ?? 99;
      return childAge >= minAge && childAge <= maxAge;
    });
  }, [items, childAge, isLoading, getAgeRange]);

  return {
    filteredItems,
    childAge,
    isLoading,
    hasAgeFilter: childAge !== null && childAge !== undefined,
  };
}

export function filterByAge<T>(
  items: T[],
  childAge: number | null,
  getAgeRange: (item: T) => { min: number | null; max: number | null }
): T[] {
  if (childAge === null || childAge === undefined) {
    return items;
  }

  return items.filter(item => {
    const { min, max } = getAgeRange(item);
    const minAge = min ?? 0;
    const maxAge = max ?? 99;
    return childAge >= minAge && childAge <= maxAge;
  });
}
