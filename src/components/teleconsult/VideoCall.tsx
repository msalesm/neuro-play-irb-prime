import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { WebRTCManager } from '@/lib/webrtc';
import { toast } from 'sonner';

interface VideoCallProps {
  sessionId: string;
  patientName: string;
  isInitiator: boolean;
  onEnd: () => void;
}

export function VideoCall({ sessionId, patientName, isInitiator, onEnd }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const startCall = async () => {
      try {
        webrtcRef.current = new WebRTCManager({
          sessionId,
          localVideoRef,
          remoteVideoRef,
          onConnectionStateChange: (state) => {
            setConnectionState(state);
            if (state === 'connected') {
              setIsConnecting(false);
              toast.success('Conexão estabelecida');
            } else if (state === 'failed' || state === 'disconnected') {
              toast.error('Conexão perdida');
            }
          },
          onError: (error) => {
            console.error('WebRTC error:', error);
            toast.error('Erro na conexão de vídeo');
            setIsConnecting(false);
          },
        });

        await webrtcRef.current.start(isInitiator);
      } catch (error) {
        console.error('Failed to start call:', error);
        toast.error('Erro ao iniciar chamada. Verifique permissões de câmera/microfone.');
        setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      webrtcRef.current?.stop();
    };
  }, [sessionId, isInitiator]);

  const toggleVideo = () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    webrtcRef.current?.toggleVideo(newState);
  };

  const toggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    webrtcRef.current?.toggleAudio(newState);
  };

  const endCall = async () => {
    await webrtcRef.current?.stop();
    onEnd();
  };

  const getConnectionBadge = () => {
    switch (connectionState) {
      case 'connected':
        return <Badge className="bg-green-500">Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500">Conectando...</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500">Desconectado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>;
      default:
        return <Badge variant="secondary">Aguardando...</Badge>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-muted/30">
      {/* Remote Video (main) */}
      <div className="flex-1 relative">
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Conectando com {patientName}...</p>
              <p className="text-sm text-muted-foreground mt-2">
                {isInitiator ? 'Aguardando paciente entrar...' : 'Entrando na sala...'}
              </p>
            </div>
          </div>
        )}
        
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Connection status */}
        <div className="absolute top-4 left-4">
          {getConnectionBadge()}
        </div>

        {/* Patient name */}
        <div className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 rounded-lg">
          <p className="text-sm font-medium">{patientName}</p>
        </div>

        {/* Local Video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-background shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border flex items-center justify-center gap-4">
        <Button
          variant={isVideoOn ? "outline" : "destructive"}
          size="icon"
          onClick={toggleVideo}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <Button
          variant={isMicOn ? "outline" : "destructive"}
          size="icon"
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={endCall}
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
}
