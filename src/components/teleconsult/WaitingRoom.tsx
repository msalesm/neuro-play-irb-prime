import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, VideoOff, Mic, MicOff, Volume2, 
  CheckCircle, AlertCircle, Loader2, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface WaitingRoomProps {
  patientName: string;
  professionalName: string;
  scheduledAt: Date;
  onReady: () => void;
  onCancel: () => void;
  isWaitingForOther: boolean;
}

export function WaitingRoom({
  patientName,
  professionalName,
  scheduledAt,
  onReady,
  onCancel,
  isWaitingForOther
}: WaitingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  useEffect(() => {
    checkPermissions();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(d => d.kind === 'videoinput');
      const hasMic = devices.some(d => d.kind === 'audioinput');
      
      if (!hasCamera || !hasMic) {
        toast.error('Câmera ou microfone não encontrados');
      }
    } catch (error) {
      console.error('Error checking devices:', error);
    }
  };

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      setIsVideoOn(true);
      setIsMicOn(true);
      setHasVideoPermission(true);
      setHasAudioPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error('Error starting video:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Permissão negada. Habilite câmera e microfone nas configurações do navegador.');
        setHasVideoPermission(false);
        setHasAudioPermission(false);
      } else {
        toast.error('Erro ao acessar câmera/microfone');
      }
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

  const testAudio = () => {
    setIsTestingAudio(true);
    // Play a test sound
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      setIsTestingAudio(false);
      toast.success('Áudio funcionando!');
    }, 500);
  };

  const handleEnterCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onReady();
  };

  const allReady = hasVideoPermission === true && hasAudioPermission === true;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sala de Espera</CardTitle>
          <p className="text-muted-foreground mt-2">
            Prepare-se para sua teleconsulta
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info da consulta */}
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Paciente: {patientName}</p>
              <p className="text-sm text-muted-foreground">Profissional: {professionalName}</p>
            </div>
            <Badge variant="outline">
              {scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
          </div>

          {/* Preview de vídeo */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Clique em "Iniciar câmera" para testar</p>
                </div>
              </div>
            )}
            
            {!isVideoOn && stream && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Controles de teste */}
          <div className="flex flex-wrap justify-center gap-3">
            {!stream ? (
              <Button onClick={startVideo} className="gap-2">
                <Video className="w-4 h-4" />
                Iniciar câmera e microfone
              </Button>
            ) : (
              <>
                <Button
                  variant={isVideoOn ? "outline" : "destructive"}
                  size="sm"
                  onClick={toggleVideo}
                  className="gap-2"
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  {isVideoOn ? 'Câmera ligada' : 'Câmera desligada'}
                </Button>
                <Button
                  variant={isMicOn ? "outline" : "destructive"}
                  size="sm"
                  onClick={toggleMic}
                  className="gap-2"
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {isMicOn ? 'Microfone ligado' : 'Microfone desligado'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testAudio}
                  disabled={isTestingAudio}
                  className="gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Testar som
                </Button>
              </>
            )}
          </div>

          {/* Status das permissões */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              {hasVideoPermission === true ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : hasVideoPermission === false ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <Settings className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm">Câmera</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              {hasAudioPermission === true ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : hasAudioPermission === false ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <Settings className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm">Microfone</span>
            </div>
          </div>

          {/* Waiting for other participant */}
          {isWaitingForOther && (
            <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-primary">Aguardando o outro participante...</span>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnterCall}
              disabled={!allReady}
              className="flex-1 gap-2"
            >
              <Video className="w-4 h-4" />
              Entrar na Teleconsulta
            </Button>
          </div>

          {!allReady && hasVideoPermission !== null && (
            <p className="text-sm text-center text-destructive">
              Habilite a câmera e o microfone para continuar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
