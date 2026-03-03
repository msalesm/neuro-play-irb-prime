import { ModernPageLayout } from '@/components/ModernPageLayout';
import { AbaDashboard } from '@/components/aba/AbaDashboard';

export default function AbaIntegration() {
  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <AbaDashboard />
      </div>
    </ModernPageLayout>
  );
}
