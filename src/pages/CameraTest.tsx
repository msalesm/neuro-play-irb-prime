import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CameraTest() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

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
      const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(cameraStatus.state as 'granted' | 'denied' | 'prompt');
      
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(micStatus.state as 'granted' | 'denied' | 'prompt');
    } catch (error) {
      console.log('Permissions API not supported');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      setIsVideoOn(true);
      setIsMicOn(true);
      setCameraPermission('granted');
      setMicPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast.success('Câmera e microfone ativados');
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      
      if (error.name === 'NotAllowedError') {
        setCameraPermission('denied');
        setMicPermission('denied');
        toast.error('Permissão de câmera/microfone negada');
      } else if (error.name === 'NotFoundError') {
        toast.error('Nenhum dispositivo de câmera/microfone encontrado');
      } else {
        toast.error('Erro ao acessar câmera/microfone');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoOn(false);
      setIsMicOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
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

  const getPermissionBadge = (status: 'granted' | 'denied' | 'prompt') => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Permitido</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Negado</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Teste de Câmera e Microfone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Câmera:</span>
              {getPermissionBadge(cameraPermission)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Microfone:</span>
              {getPermissionBadge(micPermission)}
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Clique em "Iniciar Câmera" para testar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            {!stream ? (
              <Button onClick={startCamera} size="lg">
                <Video className="w-4 h-4 mr-2" />
                Iniciar Câmera
              </Button>
            ) : (
              <>
                <Button
                  variant={isVideoOn ? "default" : "secondary"}
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
                  {isVideoOn ? 'Câmera Ligada' : 'Câmera Desligada'}
                </Button>
                <Button
                  variant={isMicOn ? "default" : "secondary"}
                  onClick={toggleMic}
                >
                  {isMicOn ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                  {isMicOn ? 'Microfone Ligado' : 'Microfone Desligado'}
                </Button>
                <Button variant="destructive" onClick={stopCamera}>
                  Parar
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Instruções:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clique em "Iniciar Câmera" para solicitar permissões</li>
              <li>• Permita o acesso à câmera e microfone no navegador</li>
              <li>• Verifique se você consegue ver sua imagem no vídeo</li>
              <li>• Use os botões para ligar/desligar câmera e microfone</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
