-- Break recursive RLS between children and child_access by using a SECURITY DEFINER helper

create or replace function public.professional_has_child_access(_child_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_access
    where child_id = _child_id
      and professional_id = _user_id
  );
$$;

-- Recreate policies on children that referenced child_access directly

drop policy if exists "Professionals can view children with granted access" on public.children;
drop policy if exists "Therapists can update children with access" on public.children;
drop policy if exists "Therapists can view children with access (via child_access)" on public.children;

create policy "Professionals can view children with granted access" on public.children
for select using (
  public.professional_has_child_access(id, auth.uid())
);

create policy "Therapists can update children with access" on public.children
for update using (
  public.professional_has_child_access(id, auth.uid())
);

create policy "Therapists can view children with access (via child_access)" on public.children
for select using (
  public.professional_has_child_access(id, auth.uid())
);
