import { lazy } from 'react';

const ParentCoachingPage = lazy(() => import('@/components/coaching/ParentCoachingPage'));

export default function ParentCoaching() {
  return <ParentCoachingPage />;
}
