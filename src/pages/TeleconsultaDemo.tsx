import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TeleconsultSession } from '@/components/teleconsult/TeleconsultSession';
import { PatientHistoryPanel } from '@/components/teleconsult/PatientHistoryPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { History, FileText, Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft, Copy, Check, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const DEMO_PATIENT_ID = 'demo-patient-id';
const DEMO_SESSION_ID = 'demo-session-id';

export default function TeleconsultaDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [activePanel, setActivePanel] = useState<'history' | 'session'>('history');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = roomId
    ? `${window.location.origin}/teleconsulta-demo?room=${roomId}`
    : `${window.location.origin}/teleconsulta-demo?room=${crypto.randomUUID().slice(0, 8)}`;

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setIsVideoOn(true);
      setIsMicOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success('Câmera e microfone ativados');
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      toast.error('Erro ao acessar câmera/microfone');
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoOn(false);
      setIsMicOn(false);
    }
    navigate(-1);
  };

  const handleClose = () => navigate(-1);
  const handleComplete = () => {
    toast.success('Demo: Teleconsulta finalizada');
    navigate(-1);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <Badge variant="secondary">
            {roomId ? 'SALA DE TELECONSULTA' : 'MODO DEMONSTRAÇÃO'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Convidar
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Teleconsulta Split-Screen
          </span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="w-1/2 flex flex-col bg-muted/20">
          <div className="flex-1 relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain bg-black" />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Clique para iniciar a câmera</p>
                  <Button onClick={startCamera}>
                    <Video className="w-4 h-4 mr-2" />
                    Iniciar Câmera
                  </Button>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="text-sm">Paciente Demo</Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500">{roomId ? 'Sala Ativa' : 'Demo Ativo'}</Badge>
            </div>
          </div>

          {stream && (
            <div className="p-4 flex justify-center gap-4 border-t border-border">
              <Button variant={isVideoOn ? "outline" : "secondary"} size="icon" onClick={toggleVideo}>
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button variant={isMicOn ? "outline" : "secondary"} size="icon" onClick={toggleMic}>
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button variant="destructive" size="icon" onClick={endCall}>
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Clinical Panel */}
        <div className="w-1/2 flex flex-col border-l border-border">
          <div className="p-2 border-b border-border flex gap-2 bg-muted/30">
            <Button variant={activePanel === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setActivePanel('history')} className="flex-1">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button variant={activePanel === 'session' ? 'default' : 'outline'} size="sm" onClick={() => setActivePanel('session')} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Prontuário
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activePanel === 'history' ? (
              <PatientHistoryPanel patientId={DEMO_PATIENT_ID} patientName="Paciente Demo" />
            ) : (
              <TeleconsultSession sessionId={DEMO_SESSION_ID} patientId={DEMO_PATIENT_ID} patientName="Paciente Demo" onClose={handleClose} onComplete={handleComplete} />
            )}
          </div>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Participante</DialogTitle>
            <DialogDescription>Compartilhe o link abaixo para outra pessoa entrar na sala</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link da sala</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-sm" />
                <Button variant="outline" size="icon" onClick={copyInviteLink}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button variant="secondary" onClick={copyInviteLink} className="w-full gap-2">
              <Copy className="w-4 h-4" />
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
