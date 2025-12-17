import { AppLayout } from '@/components/AppLayout';
import { SkillsInventory } from '@/components/pei/SkillsInventory';

export default function InventarioHabilidades() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Inventário de Habilidades</h1>
          <p className="text-muted-foreground">Avaliação completa das habilidades do paciente</p>
        </div>
        <SkillsInventory childId={undefined} />
      </div>
    </AppLayout>
  );
}
