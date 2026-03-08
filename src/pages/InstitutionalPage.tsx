import { useState } from 'react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, DollarSign, TrendingUp } from 'lucide-react';

// Lazy sub-pages rendered inline
import InstitutionalDashboard from './InstitutionalDashboard';
import BillingDashboard from './BillingDashboard';
import ImpactDashboard from './ImpactDashboard';

export default function InstitutionalPage() {
  const [tab, setTab] = useState('institution');

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão Institucional</h1>
          <p className="text-muted-foreground">Membros, faturamento e impacto</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="institution" className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              Instituição
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Impacto
            </TabsTrigger>
          </TabsList>

          {/* Each tab renders the original page content without its own ModernPageLayout wrapper */}
          <TabsContent value="institution">
            <InstitutionalDashboardInline />
          </TabsContent>
          <TabsContent value="billing">
            <BillingDashboardInline />
          </TabsContent>
          <TabsContent value="impact">
            <ImpactDashboardInline />
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  );
}

// Thin wrappers that strip ModernPageLayout from original pages
// For now, we keep the original pages and just use this as the entry point.
// The original pages still work standalone for deep-links.
function InstitutionalDashboardInline() {
  // Re-use the component directly - it has its own ModernPageLayout but that's nested safely
  return <InstitutionalDashboard />;
}

function BillingDashboardInline() {
  return <BillingDashboard />;
}

function ImpactDashboardInline() {
  return <ImpactDashboard />;
}
