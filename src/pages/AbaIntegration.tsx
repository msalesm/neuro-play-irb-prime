import { ModernPageLayout } from '@/components/ModernPageLayout';
import { AbaNeuroPlayDashboard } from '@/components/aba-neuroplay/AbaNeuroPlayDashboard';

export default function AbaIntegration() {
  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <AbaNeuroPlayDashboard />
      </div>
    </ModernPageLayout>
  );
}
