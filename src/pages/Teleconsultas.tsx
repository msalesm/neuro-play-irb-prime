import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { TeleconsultList } from '@/components/teleconsult/TeleconsultList';
import { Button } from '@/components/ui/button';
import { Video, Zap, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Teleconsultas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instantLink, setInstantLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleStartSession = (session: any) => {
    navigate(`/teleconsulta/${session.id}`);
  };

  const handleViewRecord = (childId: string) => {
    navigate(`/prontuario/${childId}`);
  };

  const createInstantTeleconsult = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const roomId = crypto.randomUUID().slice(0, 8);
      const link = `${window.location.origin}/teleconsulta-demo?room=${roomId}`;
      setInstantLink(link);
      toast.success('Sala de teleconsulta criada!');
    } catch (error) {
      toast.error('Erro ao criar teleconsulta');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async () => {
    if (!instantLink) return;
    try {
      await navigator.clipboard.writeText(instantLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <Button onClick={createInstantTeleconsult} disabled={creating}>
            <Zap className="w-4 h-4 mr-2" />
            {creating ? 'Criando...' : 'Teleconsulta Instantânea'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/teleconsulta-demo')}>
            <Video className="w-4 h-4 mr-2" />
            Testar Teleconsulta
          </Button>
        </div>
        <TeleconsultList 
          onStartSession={handleStartSession}
          onViewRecord={handleViewRecord}
        />

        {/* Instant teleconsult link dialog */}
        <Dialog open={!!instantLink} onOpenChange={() => setInstantLink(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Teleconsulta Instantânea</DialogTitle>
              <DialogDescription>
                Compartilhe o link abaixo com o participante
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link da sala</Label>
                <div className="flex gap-2">
                  <Input value={instantLink || ''} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={copyLink}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (instantLink) window.open(instantLink, '_blank');
              }}>
                <Video className="w-4 h-4 mr-2" />
                Entrar na Sala
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModernPageLayout>
  );
}
