import { ModernPageLayout } from '@/components/ModernPageLayout';
import { OperationalDashboard } from '@/components/operations/OperationalDashboard';

export default function OperationsCenter() {
  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <OperationalDashboard />
      </div>
    </ModernPageLayout>
  );
}
