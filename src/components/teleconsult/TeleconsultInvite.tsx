import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, MessageCircle, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeleconsultInviteProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  patientName: string;
  scheduledAt: Date;
  professionalName: string;
}

export function TeleconsultInvite({
  open,
  onClose,
  sessionId,
  patientName,
  scheduledAt,
  professionalName
}: TeleconsultInviteProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/teleconsulta/${sessionId}`;
  
  const formattedDate = scheduledAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const formattedTime = scheduledAt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const inviteMessage = `Olá! Você tem uma teleconsulta agendada:

📅 Data: ${formattedDate}
⏰ Horário: ${formattedTime}
👤 Paciente: ${patientName}
👨‍⚕️ Profissional: ${professionalName}

Para participar, acesse o link:
${inviteLink}

Dicas:
• Entre alguns minutos antes do horário
• Tenha uma conexão de internet estável
• Permita acesso à câmera e microfone`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const copyMessageToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      toast.success('Mensagem copiada!');
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const shareViaWhatsApp = () => {
    const encodedMessage = encodeURIComponent(inviteMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Teleconsulta agendada - ${patientName}`);
    const body = encodeURIComponent(inviteMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Teleconsulta',
          text: inviteMessage,
          url: inviteLink
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyMessageToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar para Teleconsulta</DialogTitle>
          <DialogDescription>
            Compartilhe o link de acesso com o responsável
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info da consulta */}
          <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
            <p><strong>Paciente:</strong> {patientName}</p>
            <p><strong>Data:</strong> {formattedDate} às {formattedTime}</p>
          </div>

          {/* Link de acesso */}
          <div className="space-y-2">
            <Label htmlFor="link">Link de acesso</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={inviteLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Opções de compartilhamento */}
          <div className="space-y-2">
            <Label>Compartilhar via</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={shareViaWhatsApp}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-xs">E-mail</span>
              </Button>
              <Button
                variant="outline"
                onClick={shareNative}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Share2 className="w-5 h-5 text-purple-500" />
                <span className="text-xs">Outros</span>
              </Button>
            </div>
          </div>

          {/* Copiar mensagem completa */}
          <Button
            variant="secondary"
            onClick={copyMessageToClipboard}
            className="w-full gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar mensagem completa
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
